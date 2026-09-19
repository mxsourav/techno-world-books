import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  BookOpen, ShoppingCart, Heart, User, Menu, Search, Mic, MessageCircle,
  History, TrendingUp, ChevronDown, LogOut, MapPin, Tag, Mail
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
import { searchService, categoryService, authService } from '@/services/api';
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
        authLogin(res.data.accessToken, res.data.user);
        login({
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          phone: res.data.user.phone || '',
          rewardPoints: res.data.user.technoPoints || 120,
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

  const sendOtp = () => {
    if (isPreviewMode) {
      toast.info('Visual Preview is for layout inspection only. Login is disabled.');
      return;
    }
    if (phone.length < 10) return toast.error('Enter a valid 10-digit mobile number');
    setStep('otp');
    toast.success('OTP sent! (any 4 digits work for verification)');
  };

  const verify = async () => {
    if (isPreviewMode) {
      toast.info('Visual Preview is for layout inspection only. Login is disabled.');
      return;
    }
    if (otp.length !== 4) return toast.error('Enter the 4-digit OTP');
    setLoading(true);
    try {
      const phoneEmail = `user${phone}@technoworldbooks.in`;
      const res = await authService.devGoogleBypass({
        email: phoneEmail,
        name: `Reader ${phone.slice(-4)}`,
      });
      if (res.success && res.data) {
        authLogin(res.data.accessToken, res.data.user);
        login({
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          phone: phone,
          rewardPoints: res.data.user.technoPoints || 120,
        });
      } else {
        login({ name: 'Reader', email: phoneEmail, phone, rewardPoints: 120 });
      }
      toast.success('Welcome to Techno World Books!');
      onClose();
    } catch {
      login({ name: 'Reader', email: `user${phone.slice(-4)}@mail.com`, phone, rewardPoints: 120 });
      toast.success('Welcome to Techno World Books!');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setStep('phone'); setOtp(''); } }}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
        {/* Decorative Header with Brand Logo */}
        <div className="relative bg-gradient-to-br from-emerald-800 to-emerald-950 px-6 py-8 text-center overflow-hidden flex flex-col items-center justify-center">
          <svg className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 C30,60 70,60 100,100 L100,0 L0,0 Z" fill="currentColor" className="text-white" />
            <circle cx="80" cy="20" r="15" fill="currentColor" className="text-white" />
            <circle cx="20" cy="80" r="25" fill="currentColor" className="text-white" />
          </svg>
          
          <div className="relative z-10 flex flex-col items-center">
            <DialogTitle className="sr-only">Sign In to Techno World Books</DialogTitle>
            <img
              src="/techno_world.png"
              alt="Techno World Books Logo"
              className="h-12 sm:h-14 w-auto object-contain brightness-0 invert drop-shadow-md"
            />
          </div>
        </div>

        {isPreviewMode && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-center">
            <p className="text-[11px] font-bold text-amber-900">
              Live Preview Mode · User authentication is disabled for preview safety
            </p>
          </div>
        )}

        <div className="px-8 py-6">
          {/* Primary Google Sign-In */}
          <div className="flex flex-col items-center justify-center mb-3">
            <GoogleSignInButton onSuccess={onClose} width={300} />
          </div>

          <div className="relative text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest before:absolute before:left-0 before:top-1/2 before:h-px before:w-[30%] before:bg-slate-200 after:absolute after:right-0 after:top-1/2 after:h-px after:w-[30%] after:bg-slate-200 my-4">
            OR SIGN IN WITH
          </div>

          {/* Method Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
            <button
              type="button"
              onClick={() => setLoginTab('email')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                loginTab === 'email' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Mail className="h-3.5 w-3.5" /> Email Sign In
            </button>
            <button
              type="button"
              onClick={() => setLoginTab('phone')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                loginTab === 'phone' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageCircle className="h-3.5 w-3.5" /> Mobile OTP
            </button>
          </div>

          {loginTab === 'email' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                  Email Address
                </label>
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleEmailLogin(); }}
                    placeholder="Enter your email address"
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 placeholder:font-normal"
                    autoFocus
                  />
                </div>
              </div>

              <button 
                onClick={() => handleEmailLogin()} 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-50"
              >
                <Mail className="h-4 w-4" /> {loading ? 'Signing in...' : 'Sign In with Email'}
              </button>
            </div>
          ) : step === 'phone' ? (
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Mobile Number</label>
                <div className="flex items-center gap-0 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                  <div className="bg-slate-100 px-3.5 py-3 border-r border-slate-200 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-600">+91</span>
                  </div>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    className="w-full bg-transparent px-4 py-3 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 placeholder:font-normal"
                    inputMode="numeric"
                  />
                </div>
              </div>
              
              <button 
                onClick={sendOtp} 
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0"
              >
                <MessageCircle className="h-4 w-4" /> Send OTP Securely
              </button>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Enter the verification code sent to</p>
                <p className="text-sm font-extrabold text-emerald-700 mt-1">+91 {phone}</p>
              </div>
              
              <div className="flex justify-center pt-2">
                <InputOTP maxLength={4} value={otp} onChange={setOtp} className="gap-2">
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="w-12 h-14 text-lg font-bold rounded-xl border-slate-200" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-lg font-bold rounded-xl border-slate-200" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-lg font-bold rounded-xl border-slate-200" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-lg font-bold rounded-xl border-slate-200" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={verify} 
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </div>
              
              <button onClick={() => setStep('phone')} className="text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors">
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
      <div className="flex items-stretch rounded-full bg-white shadow-md h-10 sm:h-11 w-full overflow-hidden border border-slate-200/80 hover:border-emerald-500 focus-within:border-emerald-600 transition-colors">
        <div className="flex-1 flex items-center bg-transparent pl-3 sm:pl-4 min-w-0">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={q}
            autoFocus={autoFocus}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Search by title, author, ISBN, exam, university…"
            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 outline-none placeholder:text-slate-400 self-stretch px-2.5 sm:px-3"
          />
          <button onClick={voice} aria-label="Voice search" className="shrink-0 text-slate-400 hover:text-emerald-700 mx-1.5 sm:mx-2">
            <Mic className="h-4 w-4" />
          </button>
        </div>
        <button onClick={() => submit()} aria-label="Submit search" className="flex shrink-0 items-center justify-center px-4 sm:px-6 bg-[#0a2e1f] text-white hover:bg-emerald-800 transition-colors">
          <Search className="h-4 w-4" />
        </button>
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-[calc(100dvh-160px)] sm:max-h-96 overflow-y-auto overscroll-contain rounded-2xl border border-slate-100 bg-white py-2 shadow-2xl">
          {q.trim().length > 1 ? (
            loading ? (
              <div className="px-4 py-3 text-center text-sm text-slate-500">Loading...</div>
            ) : suggestions.length === 0 ? (
              <div className="px-4 py-3 text-center text-sm text-slate-500">No books found</div>
            ) : (
              <>
                {suggestions.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { addSearchToHistory(b.title); setOpen(false); setQ(''); navigate(`/book/${b.slug}`); }}
                    className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-emerald-50 transition-colors"
                  >
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-800">{b.title}</span>
                      <span className="block truncate text-xs text-slate-500">{b.author} • {b.category}</span>
                    </span>
                  </button>
                ))}
                {Array.from(new Set(suggestions.map(b => b.author).filter(Boolean))).map(author => (
                  <button
                    key={`author-${author}`}
                    onClick={() => submit(author)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-emerald-50 border-t border-slate-50 transition-colors"
                  >
                    <User className="h-4 w-4 shrink-0 text-amber-500" />
                    <span className="truncate text-sm font-medium text-slate-700">Author: {author}</span>
                  </button>
                ))}
                {Array.from(new Set(suggestions.map(b => b.category).filter(Boolean))).map(cat => (
                  <button
                    key={`cat-${cat}`}
                    onClick={() => submit(cat)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-emerald-50 border-t border-slate-50 transition-colors"
                  >
                    <Tag className="h-4 w-4 shrink-0 text-blue-500" />
                    <span className="truncate text-sm font-medium text-slate-700">Category: {cat}</span>
                  </button>
                ))}
              </>
            )
          ) : (
            <>
              {searchHistory.length > 0 && (
                <div className="px-4 pb-1 pt-1">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Recent searches</p>
                  {searchHistory.slice(0, 4).map((h) => (
                    <button key={h} onClick={() => submit(h)} className="flex w-full items-center gap-2 py-1.5 text-sm text-slate-600 hover:text-emerald-700">
                      <History className="h-3.5 w-3.5 text-slate-300" /> {h}
                    </button>
                  ))}
                </div>
              )}
              <div className="px-4 pb-1 pt-1">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Popular right now</p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SEARCHES.slice(0, 6).map((p) => (
                    <button key={p} onClick={() => submit(p)} className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-emerald-300 hover:bg-emerald-50">
                      <TrendingUp className="h-3 w-3 text-emerald-600" /> {p}
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
  const { logout: authLogout } = useAuthStore();
  const { pathname } = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>(WEBSITE_CATEGORIES);
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
          <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white">
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
                <p className="flex items-center gap-2.5 font-bold">
                  <img src="/techno_world_circle_white.png" alt="Techno World Books Logo" className="h-8 w-8 object-contain" />
                  <span className="text-base font-extrabold tracking-wider uppercase text-white">Techno World</span>
                </p>
                <p className="mt-1 text-xs text-emerald-200 truncate">{user ? `Hi, ${user.name}` : <CmsText contentKey="header.sub_tagline" defaultText="India ka apna bookstore" label="Header Tagline" />}</p>
              </div>

              {/* Scrollable Categories & Links */}
              <nav className="flex-1 overflow-y-auto overscroll-contain p-4 pb-20 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Categories</p>
                <div className="space-y-0.5">
                  {categories.map((c: any) => (
                    <SheetClose key={c.slug} asChild>
                      <Link to={`/category/${c.slug}`} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors">
                        {c.icon && <span className="text-emerald-700">{c.icon}</span>}
                        <span>{c.name}</span>
                      </Link>
                    </SheetClose>
                  ))}
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3 space-y-0.5">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Quick Links</p>
                  <SheetClose asChild><Link to="/search?publisher=Techno%20World%20Publications" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors">🏢 Our Publications</Link></SheetClose>
                  <SheetClose asChild><Link to="/track" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors">📦 Track Order</Link></SheetClose>
                  <SheetClose asChild><Link to="/blog" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors">✍️ Blog & Book Lists</Link></SheetClose>
                  <SheetClose asChild><Link to="/help" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors">❓ Help Center</Link></SheetClose>
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
            <SearchBar className="w-full rounded-full shadow-[0_12px_35px_rgba(0,0,0,0.6)] border-none ring-0" />
          </div>
        </div>

        {/* Desktop Sticky Search Bar (Expands Left-to-Right from round shape into pill on scroll) */}
        <div
          className={`hidden md:block rounded-full transition-all duration-500 ease-in-out origin-left ${
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
            <Link to="/cart" className="relative rounded-lg p-1.5 hover:bg-emerald-800 md:p-2" aria-label="Cart">
              <ShoppingCart className="h-5 w-5 sm:h-7 sm:w-7" />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] sm:text-[10px] font-bold text-slate-900">{cartCount}</span>
              )}
            </Link>
            {user ? (
              <Link to="/profile" className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-emerald-800 transition-all border border-emerald-700/50">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-xs font-black text-slate-900 shadow-sm">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden text-left md:block leading-tight">
                  <span className="block max-w-[85px] truncate text-xs font-bold">{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] font-extrabold text-amber-300 flex items-center gap-0.5">
                    🪙 {user.rewardPoints || 0} pts
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
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 hover:bg-emerald-800"
              >
                <User className="h-5 w-5 sm:h-7 sm:w-7" />
                <span className="hidden text-sm font-bold md:block">Login</span>
              </button>
            )}
            {user && (
              <button onClick={logout} title="Logout" className="hidden rounded-lg p-1.5 hover:bg-emerald-800 md:block">
                <LogOut className="h-5 w-5" />
              </button>
            )}
            <Link to="/wishlist" className="relative hidden rounded-lg p-1.5 hover:bg-emerald-800 md:block md:p-2" aria-label="Wishlist">
              <Heart className="h-5 w-5 sm:h-7 sm:w-7" />
              {wishlist?.length > 0 && (
                <span className="absolute right-0 top-0 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] sm:text-[10px] font-bold">{wishlist?.length}</span>
              )}
            </Link>
          </nav>
        </div>
      </div>

      {/* category strip */}
      <nav className="hidden border-t border-white/5 bg-[#0a2e1f] md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-1">
          <div className="flex flex-1 min-w-0 items-center overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 pr-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="mr-1.5 flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold text-emerald-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer outline-none">
                    <ChevronDown className="h-3.5 w-3.5 text-emerald-400" /> Shop by category
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-60 max-h-96 overflow-y-auto bg-[#061d13] border border-emerald-800/80 text-emerald-100 p-1.5 shadow-2xl z-50">
                  <div className="px-2 py-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider border-b border-emerald-900/60 mb-1">
                    All Categories
                  </div>
                  {(categories?.length ? categories : WEBSITE_CATEGORIES).map((c: any) => (
                    <DropdownMenuItem key={c.slug || c.id} asChild className="focus:bg-emerald-800 focus:text-white rounded-md cursor-pointer text-xs py-1.5 px-2">
                      <Link to={`/category/${c.slug}`} className="flex items-center gap-2 w-full">
                        <span className="text-emerald-400 text-sm">📚</span>
                        <span>{c.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {(categories?.length ? categories : WEBSITE_CATEGORIES).map((c: any) => (
                <Link
                  key={c.slug || c.id}
                  to={`/category/${c.slug}`}
                  className="whitespace-nowrap rounded-full px-2 lg:px-2.5 py-0.5 text-xs text-emerald-100 transition hover:bg-white/10 hover:text-white shrink-0"
                >
                  {(c.name || '').replace(' Books', '')}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 pl-4 border-l border-white/10 ml-2">
            <Link to="/search?publisher=Techno%20World%20Publications" className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold text-emerald-100 transition-colors hover:bg-white/10 hover:text-white">Our Publications</Link>
            <Link to="/about" className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold text-emerald-100 transition-colors hover:bg-white/10 hover:text-white">About</Link>
            <Link to="/blog" className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold text-amber-300 transition-colors hover:bg-white/10">Blog</Link>
          </div>
        </div>
      </nav>

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}
