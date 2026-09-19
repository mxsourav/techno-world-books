import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CmsText } from '@/components/common/CmsText';
import { useCms } from '@/context/CmsContext';

export default function HomePopupAd() {
  const [isOpen, setIsOpen] = useState(true);
  const [isNearFooter, setIsNearFooter] = useState(false);
  const cms = useCms();

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNearFooter(entry.isIntersecting);
      },
      {
        rootMargin: '80px 0px 0px 0px',
        threshold: 0,
      }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  if (!isOpen) return null;

  return (
    <aside
      role="dialog"
      aria-label="Special offer preview"
      className={`fixed bottom-5 left-4 z-40 max-w-[calc(100vw-88px)] sm:left-6 sm:right-auto sm:w-[340px] transition-all duration-300 ease-in-out ${
        isNearFooter
          ? 'opacity-0 translate-y-8 pointer-events-none'
          : 'opacity-100 translate-y-0 pointer-events-auto'
      }`}
    >
      <div className="relative flex h-[76px] items-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
        <img
          src={cms?.t('popup.image_url', '/home-popup-preview.png') || '/home-popup-preview.png'}
          alt="Book sale offer"
          className="h-full w-16 shrink-0 rounded-xl object-cover object-[center_42%]"
        />
        <div className="min-w-0 px-3 pr-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
            <CmsText contentKey="popup.badge" defaultText="Special offer" label="Offer Popup Badge" />
          </p>
          <p className="mt-0.5 truncate text-sm font-bold text-slate-900">
            <CmsText contentKey="popup.headline" defaultText="Book sale · Up to 60% off" label="Offer Popup Headline" />
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            <CmsText contentKey="popup.subtext" defaultText="Find your next favourite read." label="Offer Popup Subtext" />
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close advertisement"
          className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </aside>
  );
}
