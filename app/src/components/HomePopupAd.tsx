import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { CmsText } from '@/components/common/CmsText';
import { useCms } from '@/context/CmsContext';

export default function HomePopupAd() {
  const [isOpen, setIsOpen] = useState(true);
  const [isNearFooter, setIsNearFooter] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dismissDirection, setDismissDirection] = useState<'left' | 'right' | null>(null);

  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
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

  // Handle dismiss with slide animation
  const triggerDismiss = (direction: 'left' | 'right') => {
    setDismissDirection(direction);
    setTimeout(() => {
      setIsOpen(false);
    }, 240);
  };

  // Touch Swipe Handlers (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    currentXRef.current = e.touches[0].clientX;
    const deltaX = currentXRef.current - startXRef.current;
    setDragX(deltaX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const deltaX = currentXRef.current - startXRef.current;

    // Swipe threshold to dismiss (60px in either direction)
    if (deltaX > 60) {
      triggerDismiss('right');
    } else if (deltaX < -60) {
      triggerDismiss('left');
    } else {
      // Snap back if threshold not met
      setDragX(0);
    }
  };

  // Mouse Drag Handlers (Desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Avoid triggering drag on close button click
    if ((e.target as HTMLElement).closest('button')) return;
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    currentXRef.current = e.clientX;
    const deltaX = currentXRef.current - startXRef.current;
    setDragX(deltaX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const deltaX = currentXRef.current - startXRef.current;

    if (deltaX > 60) {
      triggerDismiss('right');
    } else if (deltaX < -60) {
      triggerDismiss('left');
    } else {
      setDragX(0);
    }
  };

  if (!isOpen) return null;

  // Compute transform and opacity based on drag or dismissal
  let transformStyle = 'translateX(0)';
  let opacityStyle = 1;

  if (dismissDirection === 'left') {
    transformStyle = 'translateX(-120%)';
    opacityStyle = 0;
  } else if (dismissDirection === 'right') {
    transformStyle = 'translateX(120%)';
    opacityStyle = 0;
  } else if (isDragging) {
    transformStyle = `translateX(${dragX}px)`;
    opacityStyle = Math.max(0.2, 1 - Math.abs(dragX) / 180);
  }

  return (
    <aside
      role="dialog"
      aria-label="Special offer notification"
      className={`fixed bottom-5 left-4 z-40 max-w-[calc(100vw-32px)] sm:left-6 sm:right-auto sm:w-[340px] transition-all duration-300 ease-in-out ${
        isNearFooter
          ? 'opacity-0 translate-y-8 pointer-events-none'
          : 'opacity-100 translate-y-0 pointer-events-auto'
      }`}
    >
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: transformStyle,
          opacity: opacityStyle,
          transition: isDragging ? 'none' : 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms ease-out',
        }}
        className="group relative flex h-[76px] items-center overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-2 shadow-sm hover:shadow transition-shadow select-none cursor-grab active:cursor-grabbing touch-pan-y dark:border-zinc-800 dark:bg-zinc-900"
      >
        {/* Minimal Cover Image */}
        <div className="relative h-full w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <img
            src={cms?.t('popup.image_url', '/home-popup-preview.png') || '/home-popup-preview.png'}
            alt="Offer preview"
            draggable={false}
            className="h-full w-full object-cover object-[center_42%]"
          />
        </div>

        {/* Text Content in Minimal Black & White */}
        <div className="min-w-0 flex-1 px-3 pr-7">
          <div className="flex items-center gap-1.5">
            <span className="inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <CmsText contentKey="popup.badge" defaultText="Special Offer" label="Offer Popup Badge" />
            </span>
          </div>
          <p className="mt-1 truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">
            <CmsText contentKey="popup.headline" defaultText="Book Sale · Up to 60% Off" label="Offer Popup Headline" />
          </p>
          <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
            <CmsText contentKey="popup.subtext" defaultText="Swipe left or right to dismiss" label="Offer Popup Subtext" />
          </p>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerDismiss('left');
          }}
          aria-label="Close notification"
          className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
