import { useState } from 'react';
import { X } from 'lucide-react';

export default function HomePopupAd() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <aside
      role="dialog"
      aria-label="Special offer preview"
      className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-5 sm:w-[340px]"
    >
      <div className="relative flex h-[76px] items-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
        <img
          src="/home-popup-preview.png"
          alt="Book sale offer"
          className="h-full w-16 shrink-0 rounded-xl object-cover object-[center_42%]"
        />
        <div className="min-w-0 px-3 pr-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Special offer</p>
          <p className="mt-0.5 truncate text-sm font-bold text-slate-900">Book sale · Up to 60% off</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">Find your next favourite read.</p>
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
