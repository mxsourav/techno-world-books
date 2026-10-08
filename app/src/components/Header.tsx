import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  BookOpen, ShoppingCart, Heart, User, Menu, Search, Mic, MessageCircle,
  History, TrendingUp, ChevronDown, LogOut, MapPin, Tag, Mail, Truck, FileText, HelpCircle
} from 'lucide-react';
import { POPULAR_SEARCHES } from '@/data/blog';
import { CATEGORIES as WEBSITE_CATEGORIES } from '@/data/books';
import { useStore } from '@/store/StoreContext';
import { useAuthStore } from '@/store/AuthStore';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { searchService, categoryService, authService, getImageUrl } from '@/services/api';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { CmsText } from '@/components/common/CmsText';

function LoginDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useStore();
  const { login: authLogin } = useAuthStore();
  const [loginTab, setLoginTab] = useState<'email' | 'phone'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const isPreviewMode = typeof window !== 'undefined' && (
    window.self !== window.top ||
    window.location.search.includes('cms_edit=true')
  );

  const handleEmailLogin = async (overrideEmail?: string) => {
    if (isPreviewMode) {
      toast.info('Visual Preview is for layout inspection only. Account login is disabled.');
      return;
    }
    const targetEmail = (overrideEmail || emailInput).trim().toLowerCase();
    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const userName = targetEmail.split('@')[0];
    setLoading(true);
    try {
      const res = await authService.devGoogleBypass({
        name: userName,
        email: targetEmail,
      });
      if (res.success && res.data) {
        authLogin(res.data.accessToken, res.data.user, res.data.refreshToken);
        login({
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          phone: res.data.user.phone || '',
          rewardPoints: Number(res.data.user.technoPoints ?? 0),
        });
        toast.success(`Welcome, ${res.data.user.name}! Signed in successfully.`);
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    if (isPreviewMode) {
      toast.info('Visual Preview is for layout inspection only. Login is disabled.');
      return;
    }
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) return toast.error('Enter a valid 10-digit mobile number');
    setLoading(true);
    try {
      const res = await authService.sendOtp(clean);
      if (res.success) {
        setStep('otp');
        const isSandbox = (res as any).sandboxMode || res.data?.sandboxMode;
        const devCode = (res as any).devOtp || res.data?.devOtp || '1234';
        if (isSandbox) {
          toast.success(`OTP sent to mobile! (Sandbox Code: ${devCode})`);
        } else {
          toast.success(res.message || 'OTP sent successfully to your mobile!');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (isPreviewMode) {
      toast.info('Visual Preview is for layout inspection only. Login is disabled.');
      return;
    }
    if (otp.length !== 4) return toast.error('Enter the 4-digit OTP');
    setLoading(true);
    try {
      const res = await authService.verifyOtp({
        phone: phone.trim(),
        otp: otp.trim(),
      });
      if (res.success && res.data) {
        const user = res.data.user;
        authLogin(res.data.accessToken, user, res.data.refreshToken);
        login({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || phone,
          rewardPoints: Number(user.technoPoints ?? 0),
        });
        toast.success(`Welcome back, ${user.name}!`);
        onClose();
      } else {
        toast.error(res.message || 'OTP verification failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setStep('phone'); setOtp(''); } }}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-white border border-stone-200 shadow-lg rounded-lg">
        {/* Decorative Header with Brand Logo */}
        <div className="relative bg-[#0B2518] px-6 py-8 text-center overflow-hidden flex flex-col items-center justify-center border-b border-stone-800">
          <div className="relative z-10 flex flex-col items-center">
            <DialogTitle className="sr-only">Sign In to Techno World Books</DialogTitle>
            <img
              src="/techno_world.png"
              alt="Techno World Books Logo"
              className="h-12 sm:h-14 w-auto object-contain brightness-0 invert drop-shadow-sm"
            />
          </div>
        </div>

        {isPreviewMode && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
            <p className="text-[11px] font-semibold text-amber-900">
              Live Preview Mode · User authentication is disabled for preview safety
            </p>
          </div>
        )}

        <div className="px-7 py-6">
          {/* Primary Google Sign-In */}
          <div className="flex flex-col items-center justify-center mb-3">
            <GoogleSignInButton onSuccess={onClose} width={300} />
          </div>

          <div className="relative text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest before:absolute before:left-0 before:top-1/2 before:h-px before:w-[28%] before:bg-stone-200 after:absolute after:right-0 after:top-1/2 after:h-px after:w-[28%] after:bg-stone-200 my-4">
            OR SIGN IN WITH
          </div>

          {/* Method Tabs */}
          <div className="flex rounded-md bg-stone-100 p-1 mb-5 border border-stone-200">
            <button
              type="button"
              onClick={() => setLoginTab('email')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded transition-all ${
                loginTab === 'email' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Mail className="h-3.5 w-3.5" /> Email Sign In
            </button>
            <button
              type="button"
              onClick={() => setLoginTab('phone')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded transition-all ${
                loginTab === 'phone' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <MessageCircle className="h-3.5 w-3.5" /> Mobile OTP
            </button>
          </div>

          {loginTab === 'email' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="flex items-center gap-2.5 rounded-md border border-stone-300 bg-white px-3 py-2.5 overflow-hidden focus-within:ring-1 focus-within:ring-stone-900 focus-within:border-stone-900 transition-colors">
                  <Mail className="h-4 w-4 text-stone-400 shrink-0" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleEmailLogin(); }}
                    placeholder="Enter your email address"
                    className="w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
                    autoFocus
                  />
                </div>
              </div>

              <button 
                onClick={() => handleEmailLogin()} 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-emerald-800 py-3 text-sm font-semibold text-white hover:bg-emerald-900 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Mail className="h-4 w-4" /> {loading ? 'Signing in...' : 'Sign In with Email'}
              </button>
            </div>
          ) : step === 'phone' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Mobile Number</label>
                <div className="flex items-center gap-0 rounded-md border border-stone-300 bg-white overflow-hidden focus-within:ring-1 focus-within:ring-stone-900 focus-within:border-stone-900 transition-colors">
                  <div className="bg-stone-50 px-3 py-2.5 border-r border-stone-200 flex items-center justify-center">
                    <span className="text-sm font-semibold text-stone-700">+91</span>
                  </div>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    className="w-full bg-transparent px-3 py-2.5 text-sm text-stone-900 outline-none placeholder:text-stone-400"
                    inputMode="numeric"
                  />
                </div>
              </div>
              
              <button 
                onClick={sendOtp} 
                className="w-full flex items-center justify-center gap-2 rounded-md bg-emerald-800 py-3 text-sm font-semibold text-white hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" /> Send OTP Securely
              </button>
            </div>
          ) : (
            <div className="space-y-5 text-center">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-stone-100 text-stone-800 border border-stone-200 mb-1">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-700">Enter the verification code sent to</p>
                <p className="text-sm font-bold text-stone-900 mt-0.5">+91 {phone}</p>
              </div>
              
              <div className="flex justify-center pt-1">
                <InputOTP maxLength={4} value={otp} onChange={setOtp} className="gap-2">
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="w-11 h-12 text-lg font-bold rounded-md border-stone-300" />
                    <InputOTPSlot index={1} className="w-11 h-12 text-lg font-bold rounded-md border-stone-300" />
                    <InputOTPSlot index={2} className="w-11 h-12 text-lg font-bold rounded-md border-stone-300" />
                    <InputOTPSlot index={3} className="w-11 h-12 text-lg font-bold rounded-md border-stone-300" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={verify} 
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-emerald-800 py-3 text-sm font-semibold text-white hover:bg-emerald-900 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </div>
              
              <button onClick={() => setStep('phone')} className="text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors">
                ← Change mobile number
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Search bar component with suggestions and voice search
export function SearchBar({ autoFocus = false, className = '', id }: { autoFocus?: boolean; className?: string; id?: string }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { searchHistory, addSearchToHistory } = useStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: Event) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('touchstart', onClick);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('touchstart', onClick);
    };
  }, []);

  useEffect(() => {
    if (q.trim().length > 1) {
      setLoading(true);
      const timer = setTimeout(() => {
        searchService.instant(q.trim())
          .then(res => {
            if (res.success) setSuggestions(res.data);
          })
          .catch(() => setSuggestions([]))
          .finally(() => setLoading(false));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setLoading(false);
    }
  }, [q]);

  const submit = (term?: string) => {
    const t = (term ?? q).trim();
    if (!t) return;
    addSearchToHistory(t);
    setOpen(false);
    setQ('');
    navigate(`/search?q=${encodeURIComponent(t)}`);
  };

  const voice = () => {
    type SpeechRec = { lang: string; onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null; start: () => void };
    const SR = (window as unknown as { webkitSpeechRecognition?: new () => SpeechRec }).webkitSpeechRecognition;
    if (!SR) return toast.error('Voice search is not supported in this browser');
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.onresult = (e: { results: { 0: { 0: { transcript: string } } } }) => { const t = e.results[0][0].transcript; setQ(t); submit(t); };
    rec.start();
    toast.info('Listening… speak a book title or author');
  };

  return (
    <div ref={ref} id={id} className={`relative ${className}`}>
      <div className="flex items-stretch rounded-md bg-white shadow-xs h-10 sm:h-11 w-full overflow-hidden border border-stone-300 focus-within:border-stone-900 transition-colors">
        <div className="flex-1 flex items-center bg-transparent pl-3 sm:pl-4 min-w-0">
          <Search className="h-4 w-4 shrink-0 text-stone-400" />
          <input
            value={q}
            autoFocus={autoFocus}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Search by title, author, ISBN, exam, university…"
            className="w-full bg-transparent text-xs sm:text-sm text-stone-900 outline-none placeholder:text-stone-400 self-stretch px-2.5 sm:px-3"
          />
          <button onClick={voice} aria-label="Voice search" className="shrink-0 text-stone-400 hover:text-stone-700 mx-1.5 sm:mx-2 cursor-pointer">
            <Mic className="h-4 w-4" />
          </button>
        </div>
        <button onClick={() => submit()} aria-label="Submit search" className="flex shrink-0 items-center justify-center px-4 sm:px-6 bg-[#0B2518] text-white hover:bg-[#071910] transition-colors cursor-pointer">
          <Search className="h-4 w-4" />
        </button>
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-full z-[60] mt-1.5 max-h-[calc(100dvh-160px)] sm:max-h-96 overflow-y-auto overscroll-contain rounded-md border border-stone-200 bg-white py-1.5 shadow-md">
          {q.trim().length > 1 ? (
            loading ? (
              <div className="px-4 py-3 text-center text-xs text-stone-500">Loading...</div>
            ) : suggestions.length === 0 ? (
              <div className="px-4 py-3 text-center text-xs text-stone-500">No books found</div>
            ) : (
              <>
                {suggestions.map((b) => {
                  let rawCover = b.coverUrl || b.coverImage;
                  if (!rawCover && Array.isArray(b.galleryUrls) && b.galleryUrls[0]) {
                    rawCover = b.galleryUrls[0];
                  } else if (!rawCover && typeof b.galleryUrls === 'string' && b.galleryUrls.startsWith('[')) {
                    try {
                      const p = JSON.parse(b.galleryUrls);
                      if (Array.isArray(p) && p[0]) rawCover = p[0];
                    } catch {}
                  }
                  if (!rawCover && Array.isArray(b.images) && b.images[0]?.secureUrl) {
                    rawCover = b.images[0].secureUrl;
                  }
                  const coverSrc = getImageUrl(rawCover);
                  return (
                    <button
                      key={b.id}
                      onClick={() => { addSearchToHistory(b.title); setOpen(false); setQ(''); navigate(`/book/${b.slug}`); }}
                      className="group flex w-full items-center gap-3.5 px-3.5 py-2 text-left hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-0"
                    >
                      <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded bg-stone-50 border border-stone-200 shadow-2xs flex items-center justify-center p-0.5">
                        {coverSrc ? (
                          <img
                            src={coverSrc}
                            alt={b.title}
                            className="h-full w-full object-contain rounded"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <BookOpen className="h-4 w-4 text-emerald-800" />
                        )}
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-emerald-900 transition-colors">
                          {b.title}
                        </span>
                        <span className="block truncate text-[11px] text-stone-500 mt-0.5">
                          {b.author && b.author !== 'Unknown' ? <span>{b.author}</span> : null}
                          {b.author && b.author !== 'Unknown' && b.category ? <span> • </span> : null}
                          {b.category ? <span className="text-stone-400">{b.category}</span> : null}
                        </span>
                      </span>
                      {b.price !== undefined && (
                        <span className="shrink-0 text-right pl-2">
                          <span className="block text-xs sm:text-sm font-bold text-stone-900">₹{b.price}</span>
                          {b.mrp && Number(b.mrp) > Number(b.price) && (
                            <span className="block text-[10px] text-stone-400 line-through">₹{b.mrp}</span>
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
                {Array.from(new Set(suggestions.map(b => b.author).filter(Boolean))).map(author => (
                  <button
                    key={`author-${author}`}
                    onClick={() => submit(author)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-stone-50 border-t border-stone-100 transition-colors"
                  >
                    <User className="h-4 w-4 shrink-0 text-stone-500" />
                    <span className="truncate text-xs font-medium text-stone-700">Author: {author}</span>
                  </button>
                ))}
                {Array.from(new Set(suggestions.map(b => b.category).filter(Boolean))).map(cat => (
                  <button
                    key={`cat-${cat}`}
                    onClick={() => submit(cat)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-stone-50 border-t border-stone-100 transition-colors"
                  >
                    <Tag className="h-4 w-4 shrink-0 text-stone-500" />
                    <span className="truncate text-xs font-medium text-stone-700">Category: {cat}</span>
                  </button>
                ))}
              </>
            )
          ) : (
            <>
              {searchHistory.length > 0 && (
                <div className="px-4 pb-1 pt-1">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">Recent searches</p>
                  {searchHistory.slice(0, 4).map((h) => (
                    <button key={h} onClick={() => submit(h)} className="flex w-full items-center gap-2 py-1.5 text-xs text-stone-600 hover:text-stone-900">
                      <History className="h-3.5 w-3.5 text-stone-400" /> {h}
                    </button>
                  ))}
                </div>
              )}
              <div className="px-4 pb-1 pt-1">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">Popular right now</p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SEARCHES.slice(0, 6).map((p) => (
                    <button key={p} onClick={() => submit(p)} className="flex items-center gap-1 rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 text-xs text-stone-700 hover:border-stone-300 hover:bg-stone-100 transition-colors">
                      <TrendingUp className="h-3 w-3 text-emerald-800" /> {p}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}


export default function Header() {
  const { cart, wishlist, user, logout } = useStore();
  const { logout: authLogout, user: authUser } = useAuthStore();
  const { pathname } = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>(WEBSITE_CATEGORIES);
  const [avatarError, setAvatarError] = useState(false);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const [isScrolled, setIsScrolled] = useState(false);

  const isPreviewMode = typeof window !== 'undefined' && (
    window.self !== window.top ||
    window.location.search.includes('cms_edit=true')
  );

  const handleLogout = () => {
    logout();
    authLogout();
    authService.logout().catch(() => {});
    toast.success('Logged out successfully');
  };

  useEffect(() => {
    if (pathname !== '/') {
      setIsScrolled(true);
      return;
    }

    const hero = document.getElementById('home-hero');
    const heroSearch = document.getElementById('home-hero-search');
    const observedElement = heroSearch || hero;
    if (!observedElement) {
      setIsScrolled(window.scrollY > 200);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      {
        rootMargin: '-90px 0px 0px 0px',
      }
    );
    observer.observe(observedElement);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    categoryService.getCategories().then((res: any) => setCategories(res.data)).catch(() => {});
  }, []);

  const validCategories = useMemo(() => {
    return (categories?.length ? categories : WEBSITE_CATEGORIES)
      .filter((c: any) => {
        const slug = (c.slug || '').toLowerCase();
        const name = (c.name || '').toLowerCase();
        return slug !== 'techno-world' && !name.includes('our publication');
      });
  }, [categories]);

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-[#0a2e1f] text-white shadow-md transition-colors duration-300">
      {/* top strip */}
      <div className="hidden w-full items-center justify-between gap-4 bg-[#061d13] px-6 py-1.5 text-[11px] text-emerald-200 md:flex">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <CmsText contentKey="header.top_strip" defaultText="Delivering across India — 27,000+ pincodes" label="Header Announcement" />
        </span>
        <div className="flex items-center gap-4">
          <Link to="/track" className="hover:text-white">Track Order</Link>
          <Link to="/help" className="hover:text-white">Help Center</Link>
          <a href="https://wa.me/917479135626?text=Hi%20Techno%20World%20Books!%20I%20need%20assistance." target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white">
            <MessageCircle className="h-3 w-3" /> WhatsApp Support
          </a>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl min-w-0 items-center px-4 py-2.5 sm:px-6 sm:py-3 gap-3 sm:gap-4 lg:gap-6">
        {/* Mobile header: menu on the left; profile access stays on the right. */}
        <div className="flex w-auto md:w-[220px] lg:w-[260px] shrink-0 items-center justify-start gap-3 sm:gap-5">
          <Sheet>
            <SheetTrigger className="md:hidden" aria-label="Menu"><Menu className="h-6 w-6" /></SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 flex flex-col h-full max-h-[100dvh] overflow-hidden bg-white">
              {/* Top Branding Strip (Fixed) */}
              <div className="shrink-0 bg-[#0a2e1f] p-4 pr-12 text-white relative">
                <SheetClose asChild>
                  <Link to="/" className="flex items-center gap-2.5 font-bold">
                    <img src="/techno_world_circle_white.png" alt="Techno World Books Logo" className="h-8 w-8 object-contain" />
                    <span className="text-base font-extrabold tracking-wider uppercase text-white">Techno World</span>
                  </Link>
                </SheetClose>
                <p className="mt-1 text-xs text-emerald-200 truncate">{user ? `Hi, ${user.name}` : <CmsText contentKey="header.sub_tagline" defaultText="India ka apna bookstore" label="Header Tagline" />}</p>
              </div>

              {/* Scrollable Categories & Links */}
              <nav className="flex-1 overflow-y-auto overscroll-contain p-4 pb-20 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Categories</p>
                <div className="space-y-0.5">
                  {categories.map((c: any) => (
                    <SheetClose key={c.slug} asChild>
                      <Link to={`/category/${c.slug}`} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors">
                        {c.icon && <span className="text-stone-600">{c.icon}</span>}
                        <span>{c.name}</span>
                      </Link>
                    </SheetClose>
                  ))}
                </div>
                <div className="mt-4 border-t border-stone-100 pt-3 space-y-0.5">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-400">Quick Links</p>
                  <SheetClose asChild>
                    <Link to="/search?publisher=Techno%20World%20Publications" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors">
                      <BookOpen className="h-4 w-4 text-emerald-800 shrink-0" />
                      <span>Our Publications</span>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/track" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors">
                      <Truck className="h-4 w-4 text-emerald-800 shrink-0" />
                      <span>Track Order</span>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/blog" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors">
                      <FileText className="h-4 w-4 text-emerald-800 shrink-0" />
                      <span>Blog & Book Lists</span>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/help" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors">
                      <HelpCircle className="h-4 w-4 text-emerald-800 shrink-0" />
                      <span>Help Center</span>
                    </Link>
                  </SheetClose>
                </div>
              </nav>
              {user && (
                <div className="shrink-0 border-t border-slate-200 p-4">
                  <SheetClose asChild>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </SheetClose>
                </div>
              )}
            </SheetContent>
          </Sheet>

          {/* Desktop Brand Anchor: Always visible on desktop on the left */}
          <Link
            to="/"
            className="hidden shrink-0 items-center gap-2 md:flex"
          >
            <img
              src="/techno_world_black.png"
              alt="Techno World Books Logo"
              className="h-8 sm:h-[50px] w-auto object-contain brightness-0 invert"
            />
          </Link>
        </div>

        {/* Mobile Center Zone: Mobile Logo (!isScrolled) and Mobile Sticky Search Bar (isScrolled) */}
        <div className="md:hidden flex-1 flex items-center justify-center min-w-0 mx-2 relative h-11 sm:h-12">
          {/* Mobile-Only Center Brand Logo (Active when !isScrolled at top of homepage) */}
          <div
            className={`transition-all duration-300 ease-in-out flex items-center justify-center ${
              !isScrolled
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 scale-90 -translate-y-2 pointer-events-none absolute inset-0'
            }`}
          >
            <Link
              to="/"
              aria-label="Techno World Books Home"
              className="flex items-center justify-center"
            >
              <img
                src="/techno_world_black.png"
                alt="Techno World Books Logo"
                className="h-9 sm:h-10 w-auto max-w-[240px] xs:max-w-[270px] object-contain brightness-0 invert drop-shadow-sm"
              />
            </Link>
          </div>

          {/* Mobile Sticky Search Bar (Active when isScrolled on mobile) */}
          <div
            className={`w-full transition-all duration-300 ease-in-out ${
              isScrolled
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 scale-95 translate-y-2 pointer-events-none absolute inset-0 flex items-center justify-center'
            }`}
          >
            <SearchBar className="w-full shadow-xs" />
          </div>
        </div>

        {/* Desktop Sticky Search Bar */}
        <div
          className={`hidden md:block transition-all duration-500 ease-in-out origin-left ${
            isScrolled
              ? 'flex-1 max-w-xl lg:max-w-2xl opacity-100 mx-3 lg:mx-6 pointer-events-auto overflow-visible'
              : 'flex-none max-w-0 opacity-0 pointer-events-none mx-0 overflow-hidden'
          }`}
        >
          <SearchBar className="w-full" />
        </div>
        
        {/* Right Section (Fixed width matches Left, ml-auto pushes it to right edge) */}
        <div className="flex w-auto md:w-[220px] lg:w-[260px] shrink-0 items-center justify-end ml-auto">
          <nav className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Link to="/cart" className="relative rounded-md p-1.5 hover:bg-emerald-800/80 md:p-2 transition-colors" aria-label="Cart">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-[#D4A017] text-[9px] sm:text-[10px] font-bold text-stone-900">{cartCount}</span>
              )}
            </Link>
            {user ? (
              <Link to="/profile" className="flex items-center gap-2 rounded-md px-2.5 py-1.5 border border-emerald-800/60 hover:bg-emerald-800/60 transition-colors text-white">
                <div className="relative h-6 w-6 shrink-0">
                  {(authUser?.avatarUrl || user?.avatarUrl) && !(authUser?.avatarUrl || user?.avatarUrl)?.includes('unsplash') && !avatarError ? (
                    <img
                      src={(authUser?.avatarUrl || user?.avatarUrl) ?? undefined}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarError(true)}
                      className="h-6 w-6 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-900 border border-white/20 text-[11px] font-bold text-white shadow-xs">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="hidden text-left md:block leading-tight">
                  <span className="block max-w-[85px] truncate text-xs font-medium text-white">{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] font-medium text-emerald-200/70 flex items-center gap-1">
                    <span>•</span>
                    <span>{user.rewardPoints || 0} pts</span>
                  </span>
                </div>
              </Link>
            ) : (
              <button
                onClick={() => {
                  if (isPreviewMode) {
                    toast.info('Visual Preview Mode is for inspection only. User login is disabled.');
                    return;
                  }
                  setLoginOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-emerald-800/80 transition-colors cursor-pointer"
              >
                <User className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="hidden text-sm font-semibold md:block">Login</span>
              </button>
            )}
            {user && (
              <button onClick={logout} title="Logout" className="hidden rounded-md p-1.5 hover:bg-emerald-800/80 md:block transition-colors cursor-pointer">
                <LogOut className="h-5 w-5" />
              </button>
            )}
            <Link to="/wishlist" className="relative hidden rounded-md p-1.5 hover:bg-emerald-800/80 md:block md:p-2 transition-colors" aria-label="Wishlist">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
              {wishlist?.length > 0 && (
                <span className="absolute right-0 top-0 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] sm:text-[10px] font-bold text-white">{wishlist?.length}</span>
              )}
            </Link>
          </nav>
        </div>
      </div>

      {/* category strip */}
      <nav className="hidden border-t border-white/10 bg-[#071F15] md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-1.5 gap-2">
          <div className="flex flex-1 min-w-0 items-center overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center gap-1 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="mr-2 flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold text-emerald-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer outline-none">
                    <ChevronDown className="h-3.5 w-3.5 text-emerald-400" /> Shop by category
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-60 max-h-96 overflow-y-auto bg-emerald-950/80 backdrop-blur-md border border-emerald-300/20 text-emerald-50 p-1.5 shadow-xl shadow-emerald-950/30 rounded-lg z-50">
                  <div className="px-2 py-1.5 text-[10px] font-bold text-emerald-200 uppercase tracking-wider border-b border-emerald-300/20 mb-1">
                    All Categories
                  </div>
                  {(categories?.length ? categories : WEBSITE_CATEGORIES).map((c: any) => (
                    <DropdownMenuItem key={c.slug || c.id} asChild className="focus:bg-white/15 focus:text-white rounded-md cursor-pointer text-xs py-1.5 px-2">
                      <Link to={`/category/${c.slug}`} className="flex items-center gap-2 w-full">
                        <BookOpen className="h-3.5 w-3.5 text-emerald-200 shrink-0" />
                        <span>{c.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {validCategories.slice(0, 8).map((c: any) => (
                <Link
                  key={c.slug || c.id}
                  to={`/category/${c.slug}`}
                  className="whitespace-nowrap rounded-md px-2 lg:px-2.5 py-0.5 text-xs text-emerald-100/90 transition hover:bg-white/10 hover:text-white shrink-0"
                >
                  {(c.name || '').replace(' Books', '')}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 pl-4 border-l border-white/10 ml-2">
            <Link to="/search?publisher=Techno%20World%20Publications" className="whitespace-nowrap rounded-md px-2.5 py-0.5 text-xs font-semibold text-emerald-100/90 transition-colors hover:bg-white/10 hover:text-white">Our Publications</Link>
            <Link to="/about" className="whitespace-nowrap rounded-md px-2.5 py-0.5 text-xs font-semibold text-emerald-100/90 transition-colors hover:bg-white/10 hover:text-white">About</Link>
            <Link to="/blog" className="whitespace-nowrap rounded-md px-2.5 py-0.5 text-xs font-semibold text-[#D4A017] transition-colors hover:bg-white/10">Blog</Link>
          </div>
        </div>
      </nav>

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}
