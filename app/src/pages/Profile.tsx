import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  User as UserIcon,
  MapPin,
  CreditCard,
  Coins,
  Wallet,
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
  ChevronRight,
  Package,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';
import { useStore } from '@/store/StoreContext';
import { profileService, authService, shippingService } from '@/services/api';
import { downloadOrderInvoice } from '@/utils/generateInvoice';
import { ExpandableOrderCard } from '@/components/orders/ExpandableOrderCard';
import { toast } from 'sonner';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import SEOHead from '@/components/SEOHead';
import { DeveloperFeedbackBanner } from '@/components/common/DeveloperFeedbackBanner';
import { UserAvatar } from '@/components/UserAvatar';
import { AvatarPicker, validateFullName, validateAge } from '@/components/AvatarPicker';

export default function Profile() {
  const { logout: authLogout, accessToken, user: authUser, login: authLogin } = useAuthStore();
  const { logout: storeLogout, user: storeUser, login: storeLogin } = useStore();
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
  const [avatarKey, setAvatarKey] = useState('reader_open_book');
  const [age, setAge] = useState('');
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
        if (res.data.avatarKey) setAvatarKey(res.data.avatarKey);
        if (res.data.age) setAge(String(res.data.age));
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
    const nameCheck = validateFullName(name);
    if (!nameCheck.valid) {
      return toast.error(nameCheck.error || 'Please enter a genuine name.');
    }
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return toast.error('Enter a valid 10-digit mobile number');
    }
    const ageCheck = validateAge(age);
    if (!ageCheck.valid) {
      return toast.error(ageCheck.error || 'Age must be between 10 and 90 years.');
    }

    setIsUpdatingProfile(true);
    try {
      const res = await profileService.updateProfile({
        name: name.trim(),
        phone: phone || null,
        avatarKey,
        age: age ? parseInt(age, 10) : null,
      });
      if (res.success && res.data) {
        toast.success('Profile updated successfully!');
        setProfileData((prev: any) => ({ ...prev, ...res.data }));
        if (authUser && authLogin && accessToken) {
          authLogin(accessToken, { ...authUser, name: res.data.name, avatarKey: res.data.avatarKey, age: res.data.age });
        }
        if (storeUser && storeLogin) {
          storeLogin({ ...storeUser, name: res.data.name, avatarKey: res.data.avatarKey, age: res.data.age });
        }
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

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await profileService.setDefaultAddress(id);
      toast.success('Default delivery address updated');
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }))
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update default address');
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
    setProfileData(null);
    setUserOrders([]);
    setUserNotifs([]);
    setAddresses([]);
    setPaymentMethods([]);
    setPointsData(null);
    setName('');
    setPhone('');
    authLogout();
    storeLogout();
    localStorage.removeItem('tw_customer_token');
    localStorage.removeItem('tw_customer_refresh_token');
    localStorage.removeItem('tw_token');
    localStorage.removeItem('twb_user');
    localStorage.removeItem('twb_orders');
    localStorage.removeItem('twb_addresses');
    sessionStorage.clear();
    authService.logout().catch(() => {});
    toast.success('Signed out successfully');
    navigate('/', { replace: true });
  };

  // Sync state if logged out externally
  useEffect(() => {
    const hasAnyToken = !!(accessToken || storeUser || localStorage.getItem('tw_customer_token') || localStorage.getItem('tw_token'));
    if (!hasAnyToken && profileData) {
      setProfileData(null);
      setUserOrders([]);
      setUserNotifs([]);
      setAddresses([]);
      setPaymentMethods([]);
      setPointsData(null);
      setName('');
      setPhone('');
    }
  }, [accessToken, storeUser, profileData]);

  // If not logged in, prompt user to log in via Developer Google OAuth Bypass
  const hasToken = !!(accessToken || storeUser || localStorage.getItem('tw_customer_token') || localStorage.getItem('tw_token'));
  const isLoggedIn = !!(hasToken && (profileData || storeUser));

  if (!loading && !isLoggedIn) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <SEOHead
          title="Account Login | Techno World Books"
          description="Sign in to your Techno World Books account."
          noIndex={true}
        />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-stone-100 border border-stone-200 text-stone-800 shadow-xs">
          <UserIcon className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-serif font-bold text-stone-900">Account Access Required</h1>
        <p className="mt-2 text-sm text-stone-500">
          Sign in to view your profile, manage delivery addresses, and track your Techno Points loyalty coins.
        </p>

        <div className="mt-8 space-y-4">
          <GoogleSignInButton onSuccess={fetchFullProfile} width={320} />
          
          <Link to="/" className="block text-xs font-semibold text-stone-500 hover:text-stone-800">
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
        <SEOHead
          title="Account Profile | Techno World Books"
          description="Account profile."
          noIndex={true}
        />
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-stone-200 shadow-xs ${
            isSessionExpired ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-serif font-bold text-stone-900">
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

  const navigationTabs = [
    { id: 'orders', label: 'My Orders', count: userOrders.length, icon: ShoppingCart },
    { id: 'notifications', label: 'Alerts', count: userNotifs.filter(n => !n.isRead).length > 0 ? userNotifs.filter(n => !n.isRead).length : null, icon: Bell, isNew: userNotifs.filter(n => !n.isRead).length > 0 },
    { id: 'profile', label: 'Personal Info', count: null, icon: UserIcon },
    { id: 'addresses', label: 'Addresses', count: addresses.length, icon: MapPin },
    { id: 'points', label: 'Wallet & Coins', count: `₹${(technoWallet + technoPoints).toFixed(0)}`, icon: Wallet },
    { id: 'payments', label: 'Saved Payments', count: null, icon: CreditCard },
  ];


  return (
    <div className="min-h-screen bg-stone-50/50 py-6 sm:py-10 font-sans text-stone-900 ph-no-capture data-mask" data-mask="true" data-private="true">
      <SEOHead
        title="My Profile & Account | Techno World Books"
        description="Manage your customer account and addresses."
        noIndex={true}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Header / Quick Identity Banner (< lg screens) */}
        <div className="lg:hidden mb-6 rounded-lg border border-stone-200 bg-white p-4 space-y-3.5">
          <div className="flex items-center gap-3">
            <UserAvatar name={displayName} email={profileData?.email || storeUser?.email} size="lg" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base font-bold text-stone-900 truncate">{displayName}</h1>
                <span className="inline-flex items-center gap-1 text-[11px] text-brand-base font-medium">
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

        {/* Bug Bounty & Developer Feedback Banner (Static Crowdsourced QA) */}
        <div className="mb-6">
          <DeveloperFeedbackBanner />
        </div>

        {/* 2-Column Dashboard Layout (Desktop) */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          
          {/* LEFT SIDEBAR (col-span-3) - Sticky on desktop */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 space-y-5">
            {/* User Profile Card */}
            <div className="rounded-lg border border-stone-200 bg-white p-5 space-y-4">
              <div className="flex items-center gap-3.5">
                <UserAvatar name={displayName} email={profileData?.email || storeUser?.email} avatarKey={profileData?.avatarKey || avatarKey} size="xl" />

                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-stone-900 truncate leading-snug">
                    {displayName}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-brand-base font-medium mt-0.5">
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
                          ? 'border-l-2 border-brand-base bg-stone-100/70 text-stone-900 font-semibold pl-2.5 rounded-l-none'
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
                <div className="space-y-4">
                  {userOrders.map((ord: any, idx: number) => (
                    <ExpandableOrderCard
                      key={ord.id}
                      order={ord}
                      defaultExpanded={idx === 0}
                      onDownloadInvoice={async (orderToDownload) => {
                        try {
                          await downloadOrderInvoice(orderToDownload);
                          toast.success('Invoice downloaded');
                        } catch (err: any) {
                          toast.error(err.message || 'Failed to download invoice');
                        }
                      }}
                      onNeedHelp={(orderHelp) => setHelpOrderModal(orderHelp)}
                    />
                  ))}
                </div>
              )}

              {/* Need Help? Order Support Modal */}
              {helpOrderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                  <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl space-y-4 border border-stone-200">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-stone-100 text-stone-700">
                          <HelpCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-serif font-bold text-stone-900">Need Help with Order?</h3>
                          <p className="text-xs text-stone-500 font-mono">Order #{helpOrderModal.orderNumber}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHelpOrderModal(null)}
                        className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
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
                        className="group flex items-start gap-3.5 rounded-lg border border-stone-200 bg-stone-50/70 p-3.5 hover:bg-stone-100/70 hover:border-stone-300 transition-all"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-base text-white shadow-xs">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-stone-900">WhatsApp 24/7 (Faster Support)</p>
                            <span className="rounded-md bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-800">24/7</span>
                          </div>
                          <p className="text-xs text-stone-700 font-mono font-medium mt-0.5">+91 747 913 5626</p>
                          <p className="text-[11px] text-stone-600 mt-1">Usually replies within minutes for order updates, changes & delivery tracking.</p>
                        </div>
                      </a>

                      {/* Option 2: Call Support 9am to 8pm */}
                      <a
                        href="tel:+917479135626"
                        className="group flex items-start gap-3.5 rounded-lg border border-stone-200 bg-stone-50/70 p-3.5 hover:bg-stone-100/70 hover:border-stone-300 transition-all"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-stone-800 text-white shadow-xs">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-stone-900">Call Support Desk</p>
                            <span className="rounded-md bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-800">Mon – Sat, 10 AM – 8 PM</span>
                          </div>
                          <p className="text-xs text-stone-700 font-mono font-medium mt-0.5">+91 747 913 5626 / 033 2257 1650</p>
                          <p className="text-[11px] text-stone-600 mt-1">Direct phone assistance from our College Street office team (Usually replies within hours).</p>
                        </div>
                      </a>

                      {/* Option 3: Support Form (Direct Prefilled) */}
                      <Link
                        to={`/contact?orderId=${encodeURIComponent(helpOrderModal.orderNumber)}&name=${encodeURIComponent(storeUser?.name || profileData?.name || '')}&email=${encodeURIComponent(storeUser?.email || profileData?.email || '')}`}
                        onClick={() => setHelpOrderModal(null)}
                        className="group flex items-start gap-3.5 rounded-lg border border-stone-200 bg-stone-50/70 p-3.5 hover:bg-stone-100/70 hover:border-stone-300 transition-all"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-stone-800 text-white shadow-xs">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-stone-900">Fill Help &amp; Support Form</p>
                            <span className="text-[10px] font-semibold text-stone-700 bg-stone-200 px-2 py-0.5 rounded-md">Auto-prefilled</span>
                          </div>
                          <p className="text-xs text-stone-600 mt-0.5">Submit an official inquiry with your order details prefilled.</p>
                          <p className="text-[11px] text-stone-500 mt-1">Saves directly to system & sends confirmation to your email.</p>
                        </div>
                      </Link>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setHelpOrderModal(null)}
                        className="w-full rounded-md border border-stone-200 bg-white py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
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
              <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-brand-base" /> Order Updates & Store Notifications
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">Live notices from the bookstore regarding order confirmations, stock delays, and delivery updates.</p>
                </div>
                <button
                  onClick={fetchUserNotifs}
                  disabled={isLoadingNotifs}
                  className="rounded-md border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1.5"
                >
                  {isLoadingNotifs ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
                  Refresh Alerts
                </button>
              </div>

              {userNotifs.length === 0 ? (
                <div className="rounded-lg border border-stone-200 bg-white p-16 text-center shadow-xs">
                  <Bell className="mx-auto h-12 w-12 text-stone-300 mb-3" />
                  <h3 className="text-base font-serif font-bold text-stone-900">No new notifications</h3>
                  <p className="text-xs text-stone-500 mt-1">You will receive updates here as your orders are processed and dispatched.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userNotifs.map((notif: any) => {
                    const isDispatched =
                      notif.type?.includes('ship') ||
                      notif.title?.toLowerCase().includes('dispatch') ||
                      notif.message?.toLowerCase().includes('dispatch');

                    const trackMatch = notif.message?.match(/(?:Tracking(?:\s*No)?|AWB|Consignment(?:\s*No)?)\s*[:#-]?\s*([A-Za-z0-9_-]+)/i);
                    let rawTrack = trackMatch ? trackMatch[1].trim() : '';
                    if (rawTrack.toLowerCase() === 'active' || rawTrack.toLowerCase().includes('generated')) {
                      rawTrack = '';
                    }
                    const orderMatch = notif.title?.match(/#([A-Za-z0-9_-]+)/) || notif.message?.match(/#([A-Za-z0-9_-]+)/);
                    const orderNum = orderMatch ? orderMatch[1].trim() : '';
                    const trackTarget = rawTrack || orderNum;

                    const isCancel = notif.type?.includes('cancel') || notif.title?.toLowerCase().includes('cancel');
                    const isDelay = notif.type?.includes('delay') || notif.title?.toLowerCase().includes('delay');
                    const isPoints = notif.type?.includes('point') || notif.title?.toLowerCase().includes('point');
                    const isWallet = notif.type?.includes('wallet') || notif.title?.toLowerCase().includes('wallet');

                    return (
                      <div
                        key={notif.id}
                        className={`rounded-lg border p-5 transition-all ${
                          notif.isRead
                            ? 'bg-white border-stone-200/90 shadow-xs'
                            : 'bg-stone-50/80 border-stone-300 shadow-xs ring-1 ring-stone-900/5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3.5">
                            <div className="h-9 w-9 rounded-xl bg-stone-100 border border-stone-200/90 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                              {isCancel ? (
                                <X className="h-4 w-4 text-red-600" />
                              ) : isDelay ? (
                                <Clock className="h-4 w-4 text-amber-600" />
                              ) : isDispatched ? (
                                <Truck className="h-4 w-4 text-stone-800" />
                              ) : isPoints ? (
                                <Coins className="h-4 w-4 text-amber-600" />
                              ) : isWallet ? (
                                <Wallet className="h-4 w-4 text-stone-800" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-stone-800" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-stone-900">{notif.title}</h4>
                                {!notif.isRead && (
                                  <span className="inline-block h-2 w-2 rounded-full bg-stone-900 shrink-0" title="Unread" />
                                )}
                              </div>
                              <p className="text-xs text-stone-600 mt-1 whitespace-pre-line leading-relaxed">
                                {notif.message}
                              </p>

                              {/* Dedicated Live Tracking Action for Dispatched Orders */}
                              {isDispatched && trackTarget && (
                                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-stone-200/90 bg-white p-3 shadow-2xs">
                                  <div className="flex items-center gap-2 text-xs text-stone-600">
                                    <Truck className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                                    <span>
                                      {rawTrack ? (
                                        <>Consignment ID: <strong className="font-mono text-stone-900 font-semibold">{rawTrack}</strong></>
                                      ) : (
                                        <>Order No: <strong className="font-mono text-stone-900 font-semibold">#{orderNum}</strong></>
                                      )}
                                    </span>
                                  </div>
                                  <Link
                                    to={`/track?id=${encodeURIComponent(trackTarget)}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-stone-800"
                                  >
                                    <span>Track Live Consignment</span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  </Link>
                                </div>
                              )}

                              <p className="text-[11px] text-stone-400 font-medium mt-2.5">
                                {new Date(notif.createdAt).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>

                          {!notif.isRead && (
                            <button
                              onClick={async () => {
                                await profileService.markNotificationRead(notif.id);
                                fetchUserNotifs();
                              }}
                              className="text-xs font-semibold text-stone-500 hover:text-stone-900 underline underline-offset-2 shrink-0 transition-colors"
                            >
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 1. Personal Information Tab */}
          {activeTab === 'profile' && (
            <div className="rounded-lg border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="max-w-xl">
                <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-brand-base" /> Personal Information
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">Manage your display name and contact details.</p>

                <form onSubmit={handleUpdateProfile} className="mt-6 space-y-5">
                  {/* DPDP Compliance Notice & UI Avatar Display */}
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                    <div className="flex items-center gap-3.5">
                      <UserAvatar name={displayName} email={profileData?.email || storeUser?.email} avatarKey={avatarKey} size="xl" />
                      <div className="text-xs text-stone-600 space-y-0.5">
                        <div className="font-semibold text-stone-900">Silhouette Avatar &amp; Privacy</div>
                        <p className="text-[11px] text-stone-500">
                          In accordance with DPDP Act 2023 data minimization, select from our curated copyright-free faceless silhouettes below.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Curated Faceless Silhouette Avatar Selector */}
                  <AvatarPicker value={avatarKey} onChange={setAvatarKey} className="pt-1 pb-2" />

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-brand-base focus:ring-2 focus:ring-brand-base/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Age (10–90 Years)</label>
                    <input
                      type="number"
                      min="10"
                      max="90"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Enter your age (e.g. 24)"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-brand-base focus:ring-2 focus:ring-brand-base/20"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Simple numerical age box, between 10 and 90 years.</span>
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
                    <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-brand-base focus-within:ring-2 focus-within:ring-brand-base/20">
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
                    className="flex items-center gap-2 rounded-xl bg-brand-base px-6 py-2.5 text-xs font-bold text-white hover:bg-brand-base shadow-md transition-all disabled:opacity-50"
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
                  className="flex items-center gap-1.5 rounded-md bg-brand-base px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-light shadow-xs transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="rounded-lg border border-stone-200 bg-white p-12 text-center text-stone-500 shadow-xs">
                  <MapPin className="mx-auto h-12 w-12 text-stone-300 mb-3" />
                  <p className="font-bold text-stone-800">No saved addresses yet.</p>
                  <p className="text-xs text-stone-500 mt-1">Add your address to enjoy one-click Speed Post deliveries.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`relative rounded-lg border p-5 bg-white shadow-xs transition-all ${
                        addr.isDefault ? 'border-brand-base ring-1 ring-brand-base/15' : 'border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">{addr.fullName}</span>
                          <span className="rounded bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-700 uppercase">
                            {addr.type || 'HOME'}
                          </span>
                          {addr.isDefault ? (
                            <span className="rounded bg-brand-50 border border-brand-200 text-brand-base text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-brand-base" /> Default
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-[10px] font-semibold text-stone-500 hover:text-brand-base transition-colors border border-dashed border-stone-300 rounded px-2 py-0.5 hover:border-brand-base hover:bg-brand-50 cursor-pointer"
                              title="Set as your primary delivery address"
                            >
                              Set as Default
                            </button>
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
                            className="p-1.5 text-stone-400 hover:text-brand-base rounded-md hover:bg-stone-100 transition-colors"
                            title="Edit Address"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                            title="Delete Address"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                        {addr.postOffice ? <span>PO: <b className="text-stone-800">{addr.postOffice}</b> · </span> : null}
                        {addr.city}, {addr.state} — <b className="text-stone-800">{addr.pincode}</b>
                      </p>
                      <p className="text-xs text-stone-500 mt-2 flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-stone-400" />
                        <span>Mobile: <span className="font-semibold text-stone-700">+91 {addr.phone}</span></span>
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
                  <h2 className="text-lg font-serif font-bold text-stone-900">Saved Payment Preferences</h2>
                  <p className="text-xs text-stone-500">
                    Saved UPI handles and card preferences. <span className="text-amber-800 font-medium">(External payment processing currently dormant until Razorpay live keys are configured).</span>
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
                  className="flex items-center gap-1.5 rounded-md bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 shadow-xs transition-colors"
                >
                  <Plus className="h-4 w-4" /> Save Payment Preference
                </button>
              </div>

              {paymentMethods.length === 0 ? (
                <div className="rounded-lg border border-stone-200 bg-white p-12 text-center text-stone-500 shadow-xs">
                  <CreditCard className="mx-auto h-12 w-12 text-stone-300 mb-3" />
                  <p className="font-bold text-stone-800">No payment methods saved.</p>
                  <p className="text-xs text-stone-500 mt-1">You can save your preferred UPI VPA for faster reference during checkout.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((pm) => (
                    <div key={pm.id} className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-stone-100 text-stone-800 font-semibold text-xs border border-stone-200">
                          {pm.type === 'UPI' ? 'UPI' : 'CARD'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-stone-900">{pm.maskedData}</p>
                          <p className="text-xs text-stone-500">{pm.provider || 'UPI VPA'} · Dormant Mode</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePayment(pm.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
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
                          <span className={`font-semibold font-mono text-sm ${tx.type === 'CREDIT' ? 'text-brand-base' : 'text-stone-800'}`}>
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
                          <span className={`font-semibold font-mono text-sm ${tx.type === 'EARNED' ? 'text-brand-base' : 'text-stone-800'}`}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl overflow-hidden border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50">
              <h3 className="font-serif font-bold text-stone-900 text-base">
                {editingAddress ? 'Edit Saved Address' : 'Add New Delivery Address'}
              </h3>
              <button onClick={() => setIsAddAddressOpen(false)} className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-md transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full rounded-md border border-stone-200 p-2.5 text-xs font-medium text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full rounded-md border border-stone-200 p-2.5 text-xs font-medium text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Street Address / House No</label>
                <input
                  type="text"
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  placeholder="e.g. 32/8 Beadon Street, College Para"
                  className="w-full rounded-md border border-stone-200 p-2.5 text-xs font-medium text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Local Post Office Name <span className="text-rose-600">* (Required for postal delivery)</span>
                </label>
                <input
                  type="text"
                  value={addressForm.postOffice}
                  onChange={(e) => setAddressForm({ ...addressForm, postOffice: e.target.value })}
                  placeholder="e.g. Beadon Street Sub Post Office (S.O), Bowbazar SO"
                  className="w-full rounded-md border border-stone-200 p-2.5 text-xs font-medium text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="733202"
                    className="w-full rounded-md border border-stone-200 p-2.5 text-xs font-medium text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">City / District</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full rounded-md border border-stone-200 p-2.5 text-xs font-medium text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full rounded-md border border-stone-200 p-2.5 text-xs font-medium text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                {['HOME', 'WORK', 'OTHER'].map(t => (
                  <label key={t} className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 cursor-pointer">
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

              <div className="flex items-center justify-end gap-2.5 border-t border-stone-200 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(false)}
                  className="rounded-md border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="rounded-md bg-brand-base px-5 py-2 text-xs font-semibold text-white hover:bg-brand-light shadow-xs transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl overflow-hidden border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50">
              <h3 className="font-serif font-bold text-stone-900 text-base">Save Payment Preference</h3>
              <button onClick={() => setIsAddPaymentOpen(false)} className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-md transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Payment Type</label>
                <select
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                  className="w-full rounded-md border border-stone-200 p-2.5 text-xs font-medium text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
                >
                  <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                  <option value="CARD">Card Reference</option>
                  <option value="NETBANKING">Net Banking</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {paymentForm.type === 'UPI' ? 'UPI ID / VPA' : 'Card Masked Number'}
                </label>
                <input
                  type="text"
                  value={paymentForm.maskedData}
                  onChange={(e) => setPaymentForm({ ...paymentForm, maskedData: e.target.value })}
                  placeholder={paymentForm.type === 'UPI' ? 'yourname@okhdfcbank' : '•••• •••• •••• 4242'}
                  className="w-full rounded-md border border-stone-200 p-2.5 text-xs font-medium text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
                  required
                />
              </div>

              <div className="rounded-md bg-stone-50 border border-stone-200 p-3 text-[11px] text-stone-700 flex items-start gap-2">
                <Lock className="h-3.5 w-3.5 text-stone-500 shrink-0 mt-0.5" />
                <span>Stored as a reference preference only. External card/UPI debit processing remains dormant until live payment gateway credentials are deployed.</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-stone-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentOpen(false)}
                  className="rounded-md border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentSaving}
                  className="rounded-md bg-stone-900 px-5 py-2 text-xs font-semibold text-white hover:bg-stone-800 shadow-xs transition-colors"
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