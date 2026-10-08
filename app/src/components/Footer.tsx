import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { MapPin, Phone, Globe, Camera } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { useAuthStore } from '@/store/AuthStore';
import { toast } from 'sonner';
import { CmsText } from '@/components/common/CmsText';
import { InstitutionalModal } from '@/components/InstitutionalModal';

const DEVELOPERS = [
  {
    handle: '@mxsourav',
    githubUrl: 'https://github.com/mxsourav',
    portfolioLabel: 'mxsourav.dev',
    portfolioUrl: 'https://mxsourav.dev',
  },
  {
    handle: '@joyxcode2005',
    githubUrl: 'https://github.com/joyxcode2005',
    portfolioLabel: 'portfolio.joycodes.me',
    portfolioUrl: 'https://portfolio.joycodes.me',
  },
];

export default function Footer() {
  const { user, logout: storeLogout } = useStore();
  const { logout: authLogout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('b2b') === 'true' || params.get('quote') === 'true') {
      setIsB2BModalOpen(true);
    }
  }, [location.search]);

  const handleLogout = () => {
    storeLogout();
    authLogout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <footer className="mt-8 border-t border-stone-800 bg-[#0B1710] text-stone-300">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-3 sm:px-6 py-8 md:grid-cols-12 md:gap-6 lg:gap-8">
        
        {/* Col 1: Address (Takes more space) */}
        <div className="col-span-2 space-y-3 md:col-span-12 lg:col-span-3">
          <div className="flex items-start gap-2 text-sm leading-relaxed text-stone-400">
            <MapPin className="mt-1 h-4 w-4 shrink-0 text-stone-500" />
            <p>
              Address: <CmsText contentKey="footer.address" defaultText="90/6A, Mahatma Gandhi Rd, opp. Grace Cinema, Calcutta University, College Street, Kolkata, West Bengal 700007" label="Footer Address" />
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold mt-2 text-stone-300">
            <Phone className="h-4 w-4 shrink-0 text-stone-500" />
            <p>Call Us : <CmsText contentKey="footer.phone" defaultText="033 2219 6115" label="Footer Phone" /></p>
          </div>
          
          {/* Payment Icons */}
          <div className="mt-3 flex items-center gap-2 pt-1">
            <div className="flex h-7 w-12 items-center justify-center rounded border border-stone-700 bg-stone-900 text-[9px] font-bold text-stone-200">AMEX</div>
            <div className="flex h-7 w-12 items-center justify-center rounded border border-stone-700 bg-stone-900 text-[11px] font-bold text-stone-200 italic">VISA</div>
            <div className="flex h-7 w-12 relative items-center justify-center rounded border border-stone-700 bg-white shadow-xs overflow-hidden">
               <div className="w-3.5 h-3.5 rounded-full bg-red-600/90 absolute left-1.5 mix-blend-multiply"></div>
               <div className="w-3.5 h-3.5 rounded-full bg-amber-500/90 absolute right-1.5 mix-blend-multiply"></div>
            </div>
          </div>
        </div>

        {/* Col 2: Useful Links */}
        <div className="col-span-1 md:col-span-3 lg:col-span-2">
          <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-stone-100">Useful Links</h3>
          <ul className="space-y-1.5 text-sm text-stone-400">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link to="/track" className="hover:text-white transition-colors">Track Order</Link></li>
            <li>
              <button
                type="button"
                onClick={() => setIsB2BModalOpen(true)}
                className="hover:text-white text-left transition-colors cursor-pointer"
              >
                Bulk & Institutional Sales
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Policies */}
        <div className="col-span-1 md:col-span-3 lg:col-span-3">
          <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-stone-100">Policies</h3>
          <ul className="space-y-1.5 text-sm text-stone-400">
            <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
            <li><Link to="/refund-policy" className="hover:text-white transition-colors">Replacement & Refund Policy</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Col 4: My Account */}
        <div className="col-span-1 md:col-span-3 lg:col-span-2">
          <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-stone-100">My Account</h3>
          <ul className="space-y-1.5 text-sm text-stone-400">
            <li><Link to="/profile" className="hover:text-white transition-colors">My Account</Link></li>
            <li><Link to="/checkout" className="hover:text-white transition-colors">Checkout</Link></li>
            <li>
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hover:text-rose-400 text-left transition-colors"
                >
                  Log out
                </button>
              ) : (
                <Link to="/profile" className="hover:text-white transition-colors">Login / Sign In</Link>
              )}
            </li>
          </ul>
        </div>

        {/* Col 5: Follow Us */}
        <div className="col-span-1 md:col-span-3 lg:col-span-2">
          <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-stone-100">Follow Us</h3>
          <ul className="space-y-2 text-sm text-stone-400">
            <li>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <Globe className="h-4 w-4 text-stone-500" /> Facebook
              </a>
            </li>
            <li>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <Camera className="h-4 w-4 text-stone-500" /> Instagram
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Developer Credits Strip */}
      <div className="border-t border-stone-800/80 bg-[#070e0a]">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-3 flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex flex-col items-center lg:items-start gap-1 text-center lg:text-left">
            <span className="text-[11px] font-bold tracking-[0.08em] text-stone-400 uppercase">
              © {new Date().getFullYear()} Techno World Books. All rights reserved.
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-stone-500 uppercase">
              Official Online Bookstore • College Street, Kolkata
            </span>
            <span className="text-[10px] text-stone-500 max-w-xl leading-normal">
              *Promotional discounts, including &apos;Up to 50%/60% Off&apos;, include applicable coupon codes and promotional discounts on selected category books. Subject to terms &amp; conditions.
            </span>
          </div>

          <div className="flex flex-row flex-wrap items-center gap-2.5 justify-center">
            {DEVELOPERS.map((dev) => (
              <div
                key={dev.handle}
                className="relative inline-flex items-center justify-between min-h-[38px] min-w-[144px] px-2.5 py-1.5 pr-8 rounded-md border border-stone-800 bg-stone-900/70 hover:border-stone-700 transition-colors"
              >
                <div className="flex flex-col items-start justify-center leading-none gap-0.5">
                  <span className="text-[8px] font-bold tracking-[0.08em] text-stone-500 uppercase">
                    DEVELOPER
                  </span>
                  <a
                    href={dev.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-stone-200 hover:text-white transition-colors"
                  >
                    {dev.handle}
                  </a>
                  <a
                    href={dev.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-medium text-stone-400 hover:text-stone-300 inline-flex items-center gap-1 transition-colors"
                  >
                    <Globe className="h-2.5 w-2.5 text-stone-500" />
                    {dev.portfolioLabel}
                  </a>
                </div>
                <a
                  href={dev.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${dev.handle} GitHub`}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white flex items-center justify-center overflow-hidden hover:opacity-90 transition-opacity"
                >
                  <img src="/github-logo.png" alt="GitHub" className="h-4 w-4 object-contain" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pristine Minimalist White B2B Institutional Dialog */}
      <InstitutionalModal
        isOpen={isB2BModalOpen}
        onClose={() => setIsB2BModalOpen(false)}
      />
    </footer>
  );
}
