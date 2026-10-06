import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  User as UserIcon,
  MapPin,
  CreditCard,
  Coins,
  Wallet,
  Link2,
  Edit3,
  Trash2,
  Plus,
  CheckCircle2,
  LogOut,
  HelpCircle,
  X,
  Loader2,
  Phone,
  Mail,
  ShoppingCart,
  Bell,
  Truck,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  Package,
  Download,
  MessageSquare,
} from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';
import { useStore } from '@/store/StoreContext';
import { profileService, authService, shippingService } from '@/services/api';
import { generateAndPrintInvoice } from '@/utils/generateInvoice';
import { toast } from 'sonner';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { BookCover } from '@/components/BookCover';

export default function Profile() {
  const { logout: authLogout, accessToken } = useAuthStore();
  const { logout: storeLogout, user: storeUser } = useStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileErrorStatus, setProfileErrorStatus] = useState<number | null>(null); // NEW: tracks 401 vs other failures
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'notifications' | 'payments' | 'points'>('orders');
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [userNotifs, setUserNotifs] = useState<any[]>([]);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);
  const [helpOrderModal, setHelpOrderModal] = useState<any | null>(null);

  // Edit Profile State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Address Modals & State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    postOffice: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    type: 'HOME',
    isDefault: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);

  // Real-time India Post Pincode Lookup for Address Modal
  useEffect(() => {
    const cleanPin = (addressForm.pincode || '').replace(/\D/g, '').slice(0, 6);
    if (cleanPin.length === 6) {
      shippingService.verifyPincode(cleanPin)
        .then((res) => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const office = res.data[0];
            setAddressForm((prev) => ({
              ...prev,
              city: prev.city || office.city_name || '',
              postOffice: prev.postOffice || office.office_name || '',
              state: prev.state || office.state_name || '',
            }));
          }
        })
        .catch(() => {});
    }
  }, [addressForm.pincode]);

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    type: 'UPI',
    provider: 'Google Pay',
    maskedData: '',
    holderName: '',
    isDefault: false,
  });
  const [paymentSaving, setPaymentSaving] = useState(false);

  // Techno Points State
  const [pointsData, setPointsData] = useState<any>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const fetchFullProfile = async () => {
    try {
      setLoading(true);
      setProfileErrorStatus(null); // reset on each new attempt
      const res = await profileService.getProfile();
      if (res.success && res.data) {
        setProfileData(res.data);
        setName(res.data.name || '');
        setPhone(res.data.phone || '');
        setAvatarUrl(res.data.avatarUrl || '');
        setAvatarError(false);
        setAddresses(res.data.addresses || []);
        setPaymentMethods(res.data.savedPaymentMethods || []);
      }
      
      const ptsRes = await profileService.getPoints().catch(() => null);
      if (ptsRes && ptsRes.data) {
        setPointsData(ptsRes.data);
      }

      // Fetch user orders
      profileService.getOrders().then((ordRes: any) => {
        if (ordRes.success && Array.isArray(ordRes.data)) {
          setUserOrders(ordRes.data);
        }
      }).catch(() => {});

      // Fetch user notifications
      profileService.getNotifications().then((notifRes: any) => {
        if (notifRes.success && Array.isArray(notifRes.data)) {
          setUserNotifs(notifRes.data);
        }
      }).catch(() => {});

    } catch (err: any) {
      // NOTE: adjust this extraction to match how profileService/api actually
      // attaches the HTTP status to a thrown error in your codebase.
      const status = err?.status ?? err?.response?.status ?? err?.statusCode ?? null;
      setProfileErrorStatus(status);

      // If unauthorized, the session is dead — nothing else to retry against.
      if (status === 401) {
        // no-op here; the render logic below branches on profileErrorStatus
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await profileService.getOrders();
      if (res.success && Array.isArray(res.data)) {
        setUserOrders(res.data);
      }
    } catch {}
    finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchUserNotifs = async () => {
    setIsLoadingNotifs(true);
    try {
      const res = await profileService.getNotifications();
      if (res.success && Array.isArray(res.data)) {
        setUserNotifs(res.data);
      }
    } catch {}
    finally {
      setIsLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchFullProfile();
  }, []);

  // Auto-retry once if token exists but profile load failed (handles cold-start server wakeup)
  useEffect(() => {
    if (!loading && !profileData && (accessToken || storeUser)) {
      const timer = setTimeout(() => {
        fetchFullProfile();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, profileData, accessToken, storeUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return toast.error('Enter a valid 10-digit mobile number');
    }

    setIsUpdatingProfile(true);
    try {
      const res = await profileService.updateProfile({
        name,
        phone: phone || null,
        avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : null,
      });
      if (res.success) {
        toast.success('Profile updated successfully!');
        setProfileData((prev: any) => ({ ...prev, ...res.data }));
        setAvatarError(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.phone || !addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      return toast.error('Please fill in all required address fields');
    }
    if (!/^[1-8]\d{5}$/.test(addressForm.pincode)) {
      return toast.error('Enter a valid 6-digit Indian PIN code');
    }

    setAddressSaving(true);
    try {
      if (editingAddress) {
        const res = await profileService.updateAddress(editingAddress.id, addressForm);
        if (res.success) {
          toast.success('Address modified successfully!');
          setEditingAddress(null);
        }
      } else {
        const res = await profileService.createAddress(addressForm as any);
        if (res.success) {
          toast.success(res.message || 'Address saved successfully!');
          setIsAddAddressOpen(false);
        }
      }
      // Refresh addresses list
      const updatedList = await profileService.getAddresses();
      if (updatedList.data) setAddresses(updatedList.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to remove this saved address?')) return;
    try {
      await profileService.deleteAddress(id);
      toast.success('Address removed');
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete address');
    }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.maskedData) return toast.error('Please enter payment details (e.g. UPI ID or last 4 digits)');

    setPaymentSaving(true);
    try {
      const res = await profileService.savePaymentMethod(paymentForm as any);
      if (res.success) {
        toast.success('Payment method preference saved! (External processing dormant)');
        setIsAddPaymentOpen(false);
        setPaymentMethods(prev => [...prev, res.data]);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save payment preference');
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      await profileService.deletePaymentMethod(id);
      toast.success('Payment preference removed');
      setPaymentMethods(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete payment preference');
    }
  };

  const handleLogout = () => {
    authLogout();
    storeLogout();
    authService.logout().catch(() => {});
    toast.success('Signed out successfully');
    navigate('/');
  };

  // If not logged in, prompt user to log in via Developer Google OAuth Bypass
  // Check BOTH profileData (from API) AND storeUser/accessToken (from login state)
  const isLoggedIn = !!(profileData || storeUser || accessToken);

  if (!loading && !isLoggedIn) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow">
          <UserIcon className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Account Access Required</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to view your profile, manage delivery addresses, and track your Techno Points loyalty coins.
        </p>

        <div className="mt-8 space-y-4">
          <GoogleSignInButton onSuccess={fetchFullProfile} width={320} />
          
          <Link to="/" className="block text-xs font-semibold text-slate-500 hover:text-slate-800">
            Back to Bookstore
          </Link>
        </div>
      </div>
    );
  }

  // User is logged in but the profile could not be loaded. Never retry an
  // authenticated request from this screen; let the user re-authenticate or sign out.
  if (!loading && !profileData && isLoggedIn) {
    const isSessionExpired = profileErrorStatus === 401 || profileErrorStatus === 403;

    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow ${
            isSessionExpired ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">
          {isSessionExpired ? 'Session Expired' : 'Profile Unavailable'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {isSessionExpired
            ? 'Your session has expired. Please sign in again to continue.'
            : 'We could not verify your profile right now. Please sign in again or sign out and return to the bookstore.'}
        </p>
        <div className="mt-6 space-y-3">
          <GoogleSignInButton
            onSuccess={() => {
              setProfileErrorStatus(null);
              fetchFullProfile();
            }}
            width={320}
          />
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const technoPoints = profileData?.technoPoints || 0;
  const technoWallet = Number(profileData?.technoWallet ?? pointsData?.technoWallet ?? 0);
  const displayName = profileData?.name || storeUser?.name || (profileData?.email ? profileData.email.split('@')[0] : 'Reader');

  const hasCustomAvatar = Boolean(
    profileData?.avatarUrl &&
    !profileData.avatarUrl.includes('unsplash') &&
    !avatarError
  );
  const avatarInitial = (displayName || storeUser?.name || storeUser?.email || 'Reader').trim().charAt(0).toUpperCase() || 'U';
  
  // Clean Gmail-style Google avatar palette
  const getGmailAvatarBg = (name: string) => {
    const bgList = ['bg-[#1a73e8]', 'bg-[#188038]', 'bg-[#d93025]', 'bg-[#e37400]', 'bg-[#8430ce]', 'bg-[#129eaf]', 'bg-[#475569]'];
    const code = (name || 'U').charCodeAt(0);
    return bgList[code % bgList.length];
  };
  const gmailBgClass = getGmailAvatarBg(displayName);

  const navigationTabs = [
    { id: 'orders', label: 'My Orders', count: userOrders.length, icon: ShoppingCart },
    { id: 'notifications', label: 'Alerts', count: userNotifs.filter(n => !n.isRead).length > 0 ? userNotifs.filter(n => !n.isRead).length : null, icon: Bell, isNew: userNotifs.filter(n => !n.isRead).length > 0 },
    { id: 'profile', label: 'Personal Info', count: null, icon: UserIcon },
    { id: 'addresses', label: 'Addresses', count: addresses.length, icon: MapPin },
    { id: 'points', label: 'Wallet & Coins', count: `₹${(technoWallet + technoPoints).toFixed(0)}`, icon: Wallet },
    { id: 'payments', label: 'Saved Payments', count: null, icon: CreditCard },
  ];

  const getOrderStatusMeta = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { label: 'Order Confirmed', pillClass: 'bg-stone-800 text-white' };
      case 'PROCESSING':
        return { label: 'Preparing for Dispatch', pillClass: 'bg-stone-800 text-white' };
      case 'SHIPPED':
        return { label: 'Dispatched', pillClass: 'bg-stone-800 text-white' };
      case 'DELIVERED':
        return { label: 'Delivered', pillClass: 'bg-emerald-950 text-white' };
      case 'CANCELLED':
        return { label: 'Cancelled', pillClass: 'bg-stone-200 text-stone-700' };
      case 'REFUNDED':
        return { label: 'Refunded', pillClass: 'bg-stone-200 text-stone-700' };
      case 'PENDING':
      default:
        return { label: 'Order Confirmed', pillClass: 'bg-stone-800 text-white' };
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/50 py-6 sm:py-10 font-sans text-stone-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Header / Quick Identity Banner (< lg screens) */}
        <div className="lg:hidden mb-6 rounded-lg border border-stone-200 bg-white p-4 space-y-3.5">
          <div className="flex items-center gap-3">
            <div className={`relative h-12 w-12 shrink-0 rounded-full flex items-center justify-center overflow-hidden ring-1 ring-stone-200/80 shadow-2xs select-none ${!hasCustomAvatar ? gmailBgClass : 'bg-stone-100'}`}>
              {hasCustomAvatar ? (
                <img
                  src={profileData!.avatarUrl!}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <span className="font-bold text-white text-lg select-none">
                  {avatarInitial}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base font-bold text-stone-900 truncate">{displayName}</h1>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  Verified Customer
                </span>
              </div>
              <p className="text-xs text-stone-500 truncate">{profileData?.email || storeUser?.email}</p>
            </div>
          </div>

          {/* Quick Balance Readout Mobile */}
          <div className="grid grid-cols-2 gap-2 border-t border-stone-100 pt-3 text-xs">
            <div className="rounded-md border border-stone-200 bg-stone-50/80 p-2.5">
              <span className="text-[10px] text-stone-500 block uppercase font-medium">Wallet Balance</span>
              <span className="font-semibold text-stone-900 font-mono text-sm">₹{technoWallet.toFixed(2)}</span>
            </div>
            <div className="rounded-md border border-stone-200 bg-stone-50/80 p-2.5">
              <span className="text-[10px] text-stone-500 block uppercase font-medium">Techno Coins</span>
              <span className="font-semibold text-stone-900 font-mono text-sm">{technoPoints}</span>
            </div>
          </div>

          {/* Horizontal Navigation Tabs on Mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-stone-100 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navigationTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors shrink-0 ${
                    isActive
                      ? 'bg-stone-900 text-white'
                      : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`text-[10px] px-1 rounded font-mono ${isActive ? 'bg-white/20 text-white' : 'text-stone-500'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Dashboard Layout (Desktop) */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          
          {/* LEFT SIDEBAR (col-span-3) - Sticky on desktop */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 space-y-5">
            {/* User Profile Card */}
            <div className="rounded-lg border border-stone-200 bg-white p-5 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className={`h-14 w-14 shrink-0 rounded-full flex items-center justify-center overflow-hidden ring-1 ring-stone-200/80 shadow-2xs select-none ${!hasCustomAvatar ? gmailBgClass : 'bg-stone-100'}`}>
                  {hasCustomAvatar ? (
                    <img
                      src={profileData!.avatarUrl!}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarError(true)}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="font-bold text-white text-xl select-none">
                      {avatarInitial}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-stone-900 truncate leading-snug">
                    {displayName}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Verified Customer</span>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-500">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{profileData?.email || storeUser?.email || 'No email attached'}</span>
                </div>
                {profileData?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span>+91 {profileData.phone}</span>
                  </div>
                )}
              </div>

              {/* Monochrome Wallet & Coins Badges */}
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <div className="flex items-center justify-between text-xs p-2.5 rounded-md bg-stone-50 border border-stone-200/80">
                  <div className="flex items-center gap-2 text-stone-600">
                    <Wallet className="h-4 w-4 text-stone-700" />
                    <span>Wallet Balance</span>
                  </div>
                  <span className="font-semibold text-stone-900 font-mono">₹{technoWallet.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2.5 rounded-md bg-stone-50 border border-stone-200/80">
                  <div className="flex items-center gap-2 text-stone-600">
                    <Coins className="h-4 w-4 text-stone-700" />
                    <span className="flex items-center gap-1">
                      Techno Coins
                      <button
                        type="button"
                        onClick={() => setIsTermsModalOpen(true)}
                        className="text-stone-400 hover:text-stone-600"
                        title="View Terms"
                      >
                        <HelpCircle className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  </div>
                  <span className="font-semibold text-stone-900 font-mono">
                    {technoPoints} <span className="text-[10px] text-stone-500 font-sans font-normal">(₹{technoPoints})</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Vertical Flush Navigation */}
            <div className="rounded-lg border border-stone-200 bg-white p-2">
              <nav className="space-y-0.5">
                {navigationTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition-colors text-left rounded-md ${
                        isActive
                          ? 'border-l-2 border-emerald-800 bg-stone-100/70 text-stone-900 font-semibold pl-2.5 rounded-l-none'
                          : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <tab.icon className={`h-4 w-4 ${isActive ? 'text-stone-900' : 'text-stone-400'}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.count !== null && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isActive
                            ? 'bg-stone-200 text-stone-800 font-bold'
                            : tab.isNew
                            ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                            : 'text-stone-500'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}

                <div className="pt-2 border-t border-stone-100 mt-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-stone-600 hover:bg-stone-50 hover:text-rose-700 rounded-md transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4 text-stone-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* RIGHT MAIN CONTENT (col-span-9) */}
          <main className="lg:col-span-9 space-y-6">
          {/* 0. My Orders & History Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-stone-200 bg-white p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-stone-700" /> Purchase History
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">Track your orders, view delivery progress, and check real-time shipment updates.</p>
                </div>
                <button
                  onClick={fetchUserOrders}
                  disabled={isLoadingOrders}
                  className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isLoadingOrders ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
                  <span>Refresh</span>
                </button>
              </div>

              {userOrders.length === 0 ? (
                <div className="rounded-lg border border-stone-200 bg-white p-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-stone-300 mb-3" />
                  <h3 className="text-base font-bold text-stone-800">No orders placed yet</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-5">
                    Explore our vast collection of academic, competitive examination, and general books!
                  </p>
                  <Link
                    to="/catalog"
                    className="inline-flex items-center gap-1.5 rounded-md bg-stone-900 px-5 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
                  >
                    Browse Catalog <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {userOrders.map((ord: any) => {
                    const statusMeta = getOrderStatusMeta(ord.status);

                    return (
                      <div key={ord.id} className="rounded-lg border border-stone-200 bg-white overflow-hidden shadow-xs">
                        {/* 1. Order Meta Header */}
                        <div className="bg-stone-50 border-b border-stone-200 px-4 sm:px-5 py-3 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                          {/* Left: Placed date + Total */}
                          <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-stone-600">
                            <div>
                              <span className="text-stone-400 block text-[10px] uppercase tracking-wider font-medium">Order Placed</span>
                              <span className="font-semibold text-stone-900 font-mono">
                                {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <span className="text-stone-300 hidden sm:inline">|</span>
                            <div>
                              <span className="text-stone-400 block text-[10px] uppercase tracking-wider font-medium">Total</span>
                              <span className="font-bold text-stone-900 font-mono text-sm sm:text-base">
                                ₹{ord.totalAmount}
                              </span>
                            </div>
                            {ord.paymentMethod && (
                              <span className="hidden md:inline-block text-[11px] text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded font-mono">
                                {ord.paymentMethod.toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Right: Order ID + Solid Muted Status Pill */}
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <div className="text-right">
                              <span className="text-stone-400 block text-[10px] uppercase tracking-wider font-medium">Order #</span>
                              <span className="font-mono font-bold text-stone-900">{ord.orderNumber}</span>
                            </div>
                            <span className={`rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide ${statusMeta.pillClass}`}>
                              {statusMeta.label}
                            </span>
                          </div>
                        </div>

                        {/* Consignment and Merged Notice (Neutral) */}
                        {(ord.isMerged || (ord.childOrders && ord.childOrders.length > 0)) && (
                          <div className="bg-stone-100/70 border-b border-stone-200 px-4 sm:px-5 py-2 flex flex-wrap items-center gap-2 text-xs text-stone-700">
                            {ord.isMerged && (
                              <span className="inline-flex items-center gap-1">
                                <Link2 className="h-3.5 w-3.5 text-stone-500" />
                                Consolidated into Consignment #{ord.parentOrder?.orderNumber || ord.parentOrderId?.slice(0, 8)}
                                {ord.shippingRefunded > 0 && (
                                  <span className="font-medium text-stone-900">· ₹{ord.shippingRefunded} refunded to Wallet</span>
                                )}
                              </span>
                            )}
                            {ord.childOrders && ord.childOrders.length > 0 && (
                              <span className="inline-flex items-center gap-1">
                                <Package className="h-3.5 w-3.5 text-stone-500" />
                                Master Consignment ({ord.childOrders.length} Add-on Order{ord.childOrders.length > 1 ? 's' : ''} Merged)
                              </span>
                            )}
                          </div>
                        )}

                        {/* 2. Order Items Body */}
                        <div className="p-4 sm:p-5 divide-y divide-stone-100">
                          {ord.items?.map((item: any) => (
                            <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-4 sm:gap-5">
                              {/* 50%+ Larger Thumbnail */}
                              <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-md bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                                <BookCover
                                  book={{
                                    id: item.book?.id || item.bookId,
                                    title: item.book?.title || 'Book',
                                    coverUrl: item.book?.coverUrl,
                                    galleryUrls: item.book?.galleryUrls,
                                    images: item.book?.images,
                                    coverImage: item.book?.coverImage,
                                  }}
                                  className="w-full h-full text-[8px]"
                                />
                              </div>

                              {/* Book Title & Info */}
                              <div className="flex-1 min-w-0 pr-2">
                                <h4 className="text-base sm:text-lg font-semibold text-stone-900 leading-snug line-clamp-2">
                                  {item.book?.title || 'Book Title'}
                                </h4>
                                {item.book?.author && (
                                  <p className="text-xs text-stone-500 mt-1">by {item.book.author}</p>
                                )}
                                {item.book?.binding && (
                                  <span className="inline-block mt-2 text-[10px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/80">
                                    {item.book.binding}
                                  </span>
                                )}
                              </div>

                              {/* Right Pricing Grid */}
                              <div className="text-right shrink-0 whitespace-nowrap">
                                <div className="text-base sm:text-lg font-semibold text-stone-900 font-mono">
                                  ₹{item.priceAtPurchase * item.quantity}
                                </div>
                                <div className="text-xs text-stone-500 mt-0.5">
                                  Qty: <span className="font-semibold text-stone-800">{item.quantity}</span>
                                  {item.quantity > 1 && (
                                    <span className="text-[11px] block text-stone-400">₹{item.priceAtPurchase} each</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>



                        {/* Dispatch Status & Action Buttons Footer */}
                        <div className="border-t border-stone-200 bg-stone-50/60 p-4 sm:p-5 space-y-3">
                          {/* Top Status & Actions Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              {(ord.status === 'PENDING' || ord.status === 'CONFIRMED' || ord.status === 'PROCESSING') && (
                                <>
                                  <div className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                                    <Package className="h-4 w-4 text-stone-600" />
                                    Preparing for Dispatch
                                  </div>
                                  <p className="text-xs text-stone-500">
                                    Eligible for 100% refund cancellation strictly before courier handover.
                                  </p>
                                </>
                              )}

                              {ord.status === 'SHIPPED' && (
                                <>
                                  <div className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                                    <Truck className="h-4 w-4 text-stone-600" />
                                    Dispatched & In-Transit
                                  </div>
                                  <p className="text-xs text-stone-500">
                                    {ord.trackingNumber ? `Dispatched via India Post (${ord.trackingNumber}).` : 'Dispatched via courier partner.'} Dispatched orders cannot be cancelled.
                                  </p>
                                </>
                              )}

                              {ord.status === 'DELIVERED' && (() => {
                                const deliveryTimestamp = ord.deliveredAt || ord.updatedAt || ord.createdAt;
                                const deliveryDate = new Date(deliveryTimestamp);
                                const daysSinceDelivery = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
                                const isReplacementEligible = daysSinceDelivery <= 7;
                                const replacementDaysRemaining = Math.max(0, 7 - daysSinceDelivery);

                                return (
                                  <>
                                    <div className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                                      <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                                      Delivered on {deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                    <p className="text-xs text-stone-500">
                                      {isReplacementEligible 
                                        ? `7-day replacement window active (${replacementDaysRemaining === 0 ? 'expires today' : `${replacementDaysRemaining} day${replacementDaysRemaining > 1 ? 's' : ''} left`}).`
                                        : 'Replacement window has ended for this order.'
                                      }
                                    </p>
                                  </>
                                );
                              })()}

                              {ord.status === 'CANCELLED' && (
                                <>
                                  <div className="text-sm font-semibold text-rose-800">
                                    Order Cancelled
                                  </div>
                                  <p className="text-xs text-stone-500">
                                    This order has been cancelled and closed.
                                  </p>
                                </>
                              )}
                            </div>

                            {/* Secondary Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
                              {/* Replacement Link if eligible */}
                              {ord.status === 'DELIVERED' && (() => {
                                const deliveryTimestamp = ord.deliveredAt || ord.updatedAt || ord.createdAt;
                                const daysSinceDelivery = Math.floor((Date.now() - new Date(deliveryTimestamp).getTime()) / (1000 * 60 * 60 * 24));
                                if (daysSinceDelivery <= 7) {
                                  return (
                                    <a
                                      href="https://docs.google.com/forms/d/e/1FAIpQLSdP7BBi2SNX67XU0xoBDzqiXSaL4nyBBIwDfVacG8M9kVR1RQ/viewform?usp=publish-editor"
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
                                    >
                                      Request Replacement <ExternalLink className="h-3 w-3 text-stone-400" />
                                    </a>
                                  );
                                }
                                return null;
                              })()}

                              {/* Pre-Dispatch Cancellation Button */}
                              {(ord.status === 'PENDING' || ord.status === 'CONFIRMED' || ord.status === 'PROCESSING') && (
                                <a
                                  href={`https://wa.me/917479135626?text=Hi%20Techno%20World%20Books%2C%20I%20want%20to%20cancel%20my%20pre-dispatch%20order%20%23${ord.orderNumber}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
                                >
                                  Request Cancellation
                                </a>
                              )}

                              {/* Tracking Link */}
                              {ord.trackingNumber && (
                                <Link
                                  to={`/track?trackingId=${ord.trackingNumber}`}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
                                >
                                  <Truck className="h-3.5 w-3.5 text-stone-500" />
                                  Track Shipment
                                </Link>
                              )}

                              {/* Tax Invoice */}
                              {ord.status !== 'CANCELLED' && (
                                <button
                                  type="button"
                                  onClick={() => generateAndPrintInvoice(ord)}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
                                >
                                  <Download className="h-3.5 w-3.5 text-stone-500" />
                                  <span>Tax Invoice</span>
                                </button>
                              )}

                              {/* Need Help */}
                              <button
                                type="button"
                                onClick={() => setHelpOrderModal(ord)}
                                className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
                              >
                                Need Help?
                              </button>
                            </div>
                          </div>

                          {/* Subtle Shipping Address */}
                          <div className="pt-2.5 border-t border-stone-200/70 text-xs text-stone-500 flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="font-medium text-stone-700">Ship to: </span>
                              {ord.address ? (
                                <span>{ord.address.fullName}, {ord.address.addressLine1}, {ord.address.city}, {ord.address.state} - {ord.address.pincode}</span>
                              ) : (
                                <span>Standard Delivery Address</span>
                              )}
                            </div>
                            {ord.trackingNumber && (
                              <span className="font-mono text-[11px] text-stone-400">
                                India Post Ref: #{ord.trackingNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Need Help? Order Support Modal */}
              {helpOrderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                  <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-slate-100">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <HelpCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900">Need Help with Order?</h3>
                          <p className="text-xs text-slate-500 font-mono">Order #{helpOrderModal.orderNumber}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHelpOrderModal(null)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Option 1: WhatsApp 24/7 Faster Support */}
                      <a
                        href={`https://wa.me/917479135626?text=${encodeURIComponent(
                          `Hello Techno World Books! I need support regarding my order #${helpOrderModal.orderNumber}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-start gap-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 hover:bg-emerald-100/70 hover:border-emerald-300 transition-all"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-emerald-950">WhatsApp 24/7 (Faster Support)</p>
                            <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-black text-emerald-900">24/7</span>
                          </div>
                          <p className="text-xs text-emerald-800 font-semibold mt-0.5">+91 747 913 5626</p>
                          <p className="text-[11px] text-emerald-700/90 mt-1">Usually replies within minutes for order updates, changes & delivery tracking.</p>
                        </div>
                      </a>

                      {/* Option 2: Call Support 9am to 8pm */}
                      <a
                        href="tel:+917479135626"
                        className="group flex items-start gap-3.5 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 hover:bg-blue-100/70 hover:border-blue-300 transition-all"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-blue-950">Call Support Desk</p>
                            <span className="rounded-full bg-blue-200 px-2 py-0.5 text-[10px] font-black text-blue-900">9 AM – 8 PM</span>
                          </div>
                          <p className="text-xs text-blue-800 font-semibold mt-0.5">+91 747 913 5626 / 033 2219 6115</p>
                          <p className="text-[11px] text-blue-700/90 mt-1">Direct phone assistance from our College Street office team (Usually replies within hours).</p>
                        </div>
                      </a>

                      {/* Option 3: Support Form (Direct Prefilled) */}
                      <Link
                        to={`/contact?orderId=${encodeURIComponent(helpOrderModal.orderNumber)}&name=${encodeURIComponent(storeUser?.name || profileData?.name || '')}&email=${encodeURIComponent(storeUser?.email || profileData?.email || '')}`}
                        onClick={() => setHelpOrderModal(null)}
                        className="group flex items-start gap-3.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 hover:bg-slate-100 hover:border-slate-300 transition-all"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white shadow-sm">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-900">Fill Help &amp; Support Form</p>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">Auto-prefilled</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">Submit an official inquiry with your order details prefilled.</p>
                          <p className="text-[11px] text-slate-500 mt-1">Saves directly to system & sends confirmation to your email.</p>
                        </div>
                      </Link>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setHelpOrderModal(null)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 0.5 In-App Notifications & Store Alerts Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-emerald-700" /> Order Updates & Store Notifications
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Live notices from the bookstore regarding order confirmations, stock delays, and delivery updates.</p>
                </div>
                <button
                  onClick={fetchUserNotifs}
                  disabled={isLoadingNotifs}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  {isLoadingNotifs ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
                  Refresh Alerts
                </button>
              </div>

              {userNotifs.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
                  <Bell className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No new notifications</h3>
                  <p className="text-xs text-slate-500 mt-1">You will receive updates here as your orders are processed and dispatched.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userNotifs.map((notif: any) => (
                    <div
                      key={notif.id}
                      className={`rounded-2xl border p-5 shadow-sm transition-all ${
                        notif.isRead ? 'bg-white border-slate-200' : 'bg-emerald-50/50 border-emerald-200 shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                            {notif.type?.includes('cancel') ? '❌' : notif.type?.includes('delay') ? '⏳' : notif.type?.includes('ship') ? '🚚' : '✅'}
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900">{notif.title}</h4>
                            <p className="text-xs text-slate-700 mt-1 whitespace-pre-line leading-relaxed">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-2">
                              {new Date(notif.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>

                        {!notif.isRead && (
                          <button
                            onClick={async () => {
                              await profileService.markNotificationRead(notif.id);
                              fetchUserNotifs();
                            }}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline shrink-0"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 1. Personal Information Tab */}
          {activeTab === 'profile' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="max-w-xl">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-emerald-700" /> Personal Information
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage your profile photo, display name, and contact details.</p>

                <form onSubmit={handleUpdateProfile} className="mt-6 space-y-5">
                  {/* Round Profile Photo Field */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div className={`relative h-14 w-14 rounded-full overflow-hidden flex items-center justify-center shrink-0 font-bold text-xl select-none ring-1 ring-stone-200/80 shadow-2xs ${!avatarUrl || avatarUrl.includes('unsplash') || avatarError ? gmailBgClass + ' text-white' : 'bg-stone-100'}`}>
                        {avatarUrl && !avatarUrl.includes('unsplash') && !avatarError ? (
                          <img
                            src={avatarUrl}
                            alt="Preview"
                            referrerPolicy="no-referrer"
                            onError={() => setAvatarError(true)}
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          avatarInitial
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <input
                          type="url"
                          value={avatarUrl}
                          onChange={(e) => {
                            setAvatarUrl(e.target.value);
                            setAvatarError(false);
                          }}
                          placeholder="Paste image URL (e.g. Google profile, gravatar)"
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {avatarUrl && (
                            <button
                              type="button"
                              onClick={() => { setAvatarUrl(''); setAvatarError(false); }}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline"
                            >
                              Remove Photo (Use Initials)
                            </button>
                          )}
                          <span className="text-[11px] text-slate-400">Photo will always be framed as a perfect circle.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={profileData?.email || ''}
                      disabled
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Email is permanently linked to your verified authentication credentials.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">10-Digit Mobile Number</label>
                    <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                      <span className="bg-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-600 border-r border-slate-200">+91</span>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Enter mobile number"
                        className="w-full px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-md transition-all disabled:opacity-50"
                  >
                    {isUpdatingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 2. Saved Addresses Tab (With In-Place Modification & Deduplication) */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Saved Delivery Addresses</h2>
                  <p className="text-xs text-slate-500">Manage, edit, or remove delivery addresses used for fast Speed Post checkout.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressForm({
                      fullName: profileData?.name || '',
                      phone: profileData?.phone || '',
                      addressLine1: '',
                      addressLine2: '',
                      postOffice: '',
                      landmark: '',
                      city: 'Kolkata',
                      state: 'West Bengal',
                      pincode: '',
                      type: 'HOME',
                      isDefault: addresses.length === 0,
                    });
                    setIsAddAddressOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm transition-all"
                >
                  <Plus className="h-4 w-4" /> Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
                  <MapPin className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <p className="font-bold text-slate-700">No saved addresses yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Add your address to enjoy one-click Speed Post deliveries.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`relative rounded-2xl border p-5 bg-white shadow-sm transition-all ${
                        addr.isDefault ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{addr.fullName}</span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                            {addr.type || 'HOME'}
                          </span>
                          {addr.isDefault && (
                            <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Default
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingAddress(addr);
                              setAddressForm({
                                fullName: addr.fullName,
                                phone: addr.phone,
                                addressLine1: addr.addressLine1,
                                addressLine2: addr.addressLine2 || '',
                                postOffice: addr.postOffice || '',
                                landmark: addr.landmark || '',
                                city: addr.city,
                                state: addr.state,
                                pincode: addr.pincode,
                                type: addr.type || 'HOME',
                                isDefault: addr.isDefault,
                              });
                              setIsAddAddressOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100"
                            title="Edit Address"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Delete Address"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                        {addr.postOffice ? <span>PO: <b className="text-slate-800">{addr.postOffice}</b> · </span> : null}
                        {addr.city}, {addr.state} — <b>{addr.pincode}</b>
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        📞 Mobile: <span className="font-semibold text-slate-700">+91 {addr.phone}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Payment Preferences (Dormant External Processing) */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Saved Payment Preferences</h2>
                  <p className="text-xs text-slate-500">
                    Saved UPI handles and card preferences. <span className="text-amber-700 font-semibold">(External payment processing currently dormant until Razorpay live keys are configured).</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPaymentForm({
                      type: 'UPI',
                      provider: 'Google Pay',
                      maskedData: '',
                      holderName: profileData?.name || '',
                      isDefault: paymentMethods.length === 0,
                    });
                    setIsAddPaymentOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
                >
                  <Plus className="h-4 w-4" /> Save Payment Preference
                </button>
              </div>

              {paymentMethods.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
                  <CreditCard className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <p className="font-bold text-slate-700">No payment methods saved.</p>
                  <p className="text-xs text-slate-500 mt-1">You can save your preferred UPI VPA for faster reference during checkout.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((pm) => (
                    <div key={pm.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                          {pm.type === 'UPI' ? 'UPI' : 'CARD'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{pm.maskedData}</p>
                          <p className="text-xs text-slate-500">{pm.provider || 'UPI VPA'} · Dormant Mode</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePayment(pm.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. TechnoWallet & Techno Points Loyalty */}
          {activeTab === 'points' && (
            <div className="space-y-6">
              {/* TechnoWallet Cash Balance Banner */}
              <div className="rounded-lg border border-stone-200 bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-stone-900">TechnoWallet Cash Balance</h2>
                        <span className="rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                          Direct Cash
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Consolidated parcel delivery refunds & store credit with zero restrictions.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-500 block">Available Cash Balance</span>
                    <span className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono">₹{technoWallet.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-stone-100 pt-4 text-xs">
                  <div className="rounded-md bg-stone-50 p-3 border border-stone-200">
                    <p className="font-semibold text-stone-900">No Expiry Date</p>
                    <p className="text-[11px] text-stone-500 mt-1">Unlike promotional points, your TechnoWallet balance never expires.</p>
                  </div>
                  <div className="rounded-md bg-stone-50 p-3 border border-stone-200">
                    <p className="font-semibold text-stone-900">100% Usable</p>
                    <p className="text-[11px] text-stone-500 mt-1">Pay for any book or entire order. No minimum or maximum percentage limits.</p>
                  </div>
                  <div className="rounded-md bg-stone-50 p-3 border border-stone-200">
                    <p className="font-semibold text-stone-900">Stackable</p>
                    <p className="text-[11px] text-stone-500 mt-1">Combine wallet cash with Techno Points and coupon promo discounts freely.</p>
                  </div>
                </div>
              </div>

              {/* TechnoWallet Activity Ledger */}
              {pointsData?.walletTransactions && pointsData.walletTransactions.length > 0 && (
                <div className="rounded-lg border border-stone-200 bg-white p-5 sm:p-6">
                  <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-stone-600" /> TechnoWallet Cash Transactions
                  </h3>
                  <div className="space-y-3">
                    {pointsData.walletTransactions.map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between border-b border-stone-100 pb-3 text-xs">
                        <div>
                          <p className="font-medium text-stone-900">{tx.description}</p>
                          <p className="text-stone-400 text-[11px] mt-0.5">
                            {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`font-semibold font-mono text-sm ${tx.type === 'CREDIT' ? 'text-emerald-800' : 'text-stone-800'}`}>
                            {tx.type === 'CREDIT' ? `+₹${Number(tx.amount).toFixed(2)}` : `-₹${Number(tx.amount).toFixed(2)}`}
                          </span>
                          <span className="block text-[10px] text-stone-500 mt-0.5">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Techno Points Loyalty Card */}
              <div className="rounded-lg border border-stone-200 bg-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Techno Points Reward Program</h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Every ₹100 spent earns 1 Techno Point (worth ₹1.00). Valid for 1 full year from issuance.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(true)}
                  className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
                >
                  View Terms & 1-Year Rules
                </button>
              </div>

              {/* Points Transactions Ledger */}
              <div className="rounded-lg border border-stone-200 bg-white p-5 sm:p-6">
                <h3 className="text-sm font-bold text-stone-900 mb-4">Points Activity Ledger</h3>
                {(!pointsData?.transactions || pointsData.transactions.length === 0) ? (
                  <p className="text-xs text-stone-500">No point transactions recorded yet. Place an order to earn coins.</p>
                ) : (
                  <div className="space-y-3">
                    {pointsData.transactions.map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between border-b border-stone-100 pb-3 text-xs">
                        <div>
                          <p className="font-medium text-stone-900">{tx.description}</p>
                          <p className="text-stone-400 text-[11px] mt-0.5">
                            Issued on {new Date(tx.createdAt).toLocaleDateString('en-IN')} · Valid until {new Date(tx.expiresAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`font-semibold font-mono text-sm ${tx.type === 'EARNED' ? 'text-emerald-800' : 'text-stone-800'}`}>
                            {tx.type === 'EARNED' ? `+${tx.points}` : `-${tx.points}`} Coins
                          </span>
                          <span className="block text-[10px] text-stone-500 mt-0.5">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>

      {/* Address Edit / Add Modal */}
      {isAddAddressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingAddress ? 'Edit Saved Address' : 'Add New Delivery Address'}
              </h3>
              <button onClick={() => setIsAddAddressOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address / House No</label>
                <input
                  type="text"
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  placeholder="e.g. 32/8 Beadon Street, College Para"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Local Post Office Name <span className="text-rose-600">* (Required for postal delivery)</span>
                </label>
                <input
                  type="text"
                  value={addressForm.postOffice}
                  onChange={(e) => setAddressForm({ ...addressForm, postOffice: e.target.value })}
                  placeholder="e.g. Beadon Street Sub Post Office (S.O), Bowbazar SO"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="733202"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / District</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                {['HOME', 'WORK', 'OTHER'].map(t => (
                  <label key={t} className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="addrType"
                      checked={addressForm.type === t}
                      onChange={() => setAddressForm({ ...addressForm, type: t })}
                    />
                    {t}
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="rounded-lg bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow"
                >
                  {addressSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Preference Modal (Dormant) */}
      {isAddPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Save Payment Preference</h3>
              <button onClick={() => setIsAddPaymentOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Type</label>
                <select
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                >
                  <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                  <option value="CARD">Card Reference</option>
                  <option value="NETBANKING">Net Banking</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {paymentForm.type === 'UPI' ? 'UPI ID / VPA' : 'Card Masked Number'}
                </label>
                <input
                  type="text"
                  value={paymentForm.maskedData}
                  onChange={(e) => setPaymentForm({ ...paymentForm, maskedData: e.target.value })}
                  placeholder={paymentForm.type === 'UPI' ? 'yourname@okhdfcbank' : '•••• •••• •••• 4242'}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-900">
                🔒 Stored as a reference preference only. External card/UPI debit processing remains dormant until live payment gateway credentials are deployed.
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentSaving}
                  className="rounded-lg bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow"
                >
                  {paymentSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save Preference'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Techno Points Terms & 1-Year Expiry Modal */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl overflow-hidden border border-stone-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
                  <Coins className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base">Techno Points Terms & Rules</h3>
                  <p className="text-xs text-stone-500">Official Customer Rewards &amp; Loyalty Guidelines</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="rounded-md p-1.5 text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3.5 text-xs text-stone-600 leading-relaxed max-h-[75vh] overflow-y-auto">
              <div className="rounded-md bg-stone-50 p-4 border border-stone-200 space-y-1">
                <p className="font-semibold text-stone-900 text-xs sm:text-sm">Reward Earning Formula</p>
                <p className="text-stone-600">
                  You earn <strong className="font-semibold text-stone-900">1 Techno Point</strong> for every <strong className="font-semibold text-stone-900">₹100</strong> net purchase value on all books across our catalog. Each point has an exact value of <strong className="font-semibold text-stone-900">₹1.00</strong>.
                </p>
              </div>

              <div className="rounded-md bg-stone-50 p-4 border border-stone-200 space-y-1">
                <p className="font-semibold text-stone-900 text-xs sm:text-sm">7-Day Replacement Window &amp; Point Verification</p>
                <p className="text-stone-600">
                  Points are credited upon order placement and confirmed after the standard <strong className="font-semibold text-stone-900">7-day replacement window</strong> concludes. Under store policy, delivered items qualify for <strong className="font-semibold text-stone-900">free replacement only</strong> (monetary return refunds are not offered post-delivery). If an order is cancelled prior to physical dispatch, corresponding points are reversed.
                </p>
              </div>

              <div className="rounded-md bg-stone-50 p-4 border border-stone-200 space-y-1">
                <p className="font-semibold text-stone-900 text-xs sm:text-sm">365-Day Validity (1 Year Guarantee)</p>
                <p className="text-stone-600">
                  Every earned Techno Point remains valid for exactly <strong className="font-semibold text-stone-900">365 days (1 year)</strong> from the date of crediting to your account before expiring.
                </p>
              </div>

              <div className="rounded-md bg-stone-50 p-4 border border-stone-200 space-y-1">
                <p className="font-semibold text-stone-900 text-xs sm:text-sm">Direct Checkout Redemption</p>
                <p className="text-stone-600">
                  Points can be redeemed directly on the checkout screen to reduce your payable total amount with zero minimum threshold or complicated percentage limits (1 Point = ₹1.00).
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-stone-200 bg-stone-50/60 px-6 py-3.5 flex items-center justify-between gap-3">
              <Link
                to="/refund-policy"
                onClick={() => setIsTermsModalOpen(false)}
                className="text-xs font-medium text-stone-600 hover:text-stone-900 underline underline-offset-2"
              >
                Replacement Policy →
              </Link>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="rounded-md bg-stone-900 px-5 py-2 text-xs font-medium text-white hover:bg-stone-800 transition-colors shadow-2xs"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}