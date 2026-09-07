import { useState } from 'react';
import { X } from 'lucide-react';

export default function HomePopupAd() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <aside
      role="dialog"
      aria-label="Special offer preview"
      className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0"
    >
      <div className="relative h-20 overflow-hidden rounded-2xl border border-white/15 bg-[#0a2e1f] shadow-xl shadow-slate-950/35 sm:h-24">
        <img
          src="/home-popup-preview.png"
          alt="Book sale offer"
          className="absolute inset-0 h-full w-full object-cover object-[center_36%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#02120b]/30 via-transparent to-[#02120b]/50" />
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close advertisement"
          className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
