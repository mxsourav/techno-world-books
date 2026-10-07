import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, FileText, ShoppingBag, Star, Loader2 } from 'lucide-react';
import { featuredBooks as manualFeaturedBooks, AUTO_FEATURED_BOOKS } from '@/config/featuredBooks';
import { useAutoFeaturedBooks } from '@/hooks/useAutoFeaturedBooks';
import { Link } from 'react-router';

export default function HeroFeaturedBooks() {
  const { books: autoBooks, loading } = useAutoFeaturedBooks();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const featuredBooks = (AUTO_FEATURED_BOOKS ? autoBooks : manualFeaturedBooks).slice(0, 5);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (featuredBooks.length || 1));
    }, 6000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (!isHovered && featuredBooks.length > 0) startTimer();
    else stopTimer();
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, featuredBooks.length]);

  const next = () => {
    if (featuredBooks.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % featuredBooks.length);
  };

  const prev = () => {
    if (featuredBooks.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + featuredBooks.length) % featuredBooks.length);
  };

  if (AUTO_FEATURED_BOOKS && loading) {
    return (
      <div className="relative flex min-h-[300px] w-full items-center justify-center overflow-hidden rounded-lg border border-stone-800 bg-[#0B2518] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-3 text-stone-300">
          <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
          <p className="text-xs font-semibold tracking-wider uppercase text-stone-400">Loading Featured Books...</p>
        </div>
      </div>
    );
  }

  if (!featuredBooks || featuredBooks.length === 0) return null;

  const activeBook = featuredBooks[currentIndex];
  // Determine if it's an auto-generated book with a slug or fallback to search query
  const shopNowLink = ('slug' in activeBook && activeBook.slug) 
    ? `/book/${activeBook.slug}` 
    : `/search?q=${encodeURIComponent(activeBook.title)}`;

  return (
    <div 
      className="relative w-full overflow-hidden rounded-lg border border-stone-800 bg-[#0B2518] p-6 shadow-sm transition-colors sm:p-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute right-4 top-4 rounded-md border border-stone-700 bg-stone-900/90 px-2.5 py-0.5 text-xs font-semibold text-stone-200 shadow-xs">
        Featured
      </div>

      <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
        {/* Book Cover */}
        <div className="group relative shrink-0 overflow-hidden rounded-md border border-stone-800 bg-stone-900 shadow-xs h-48 w-32 mx-auto sm:mx-0 sm:h-[260px] sm:w-[180px]">
          <img 
            src={activeBook.cover} 
            alt={activeBook.title} 
            key={activeBook.id}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 animate-in fade-in"
            loading="lazy"
          />
        </div>

        {/* Book Details */}
        <div className="flex-1 space-y-4 text-white pl-1 sm:pl-2">
          <div key={`${activeBook.id}-details`} className="animate-in fade-in duration-700">
            <h3 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl line-clamp-2 text-white">
              {activeBook.title}
            </h3>
            <p className="mt-2 text-sm text-stone-300 sm:text-base">
              by <span className="font-semibold text-white">{activeBook.author}</span> • <span className="text-stone-400">{activeBook.publisher}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center text-[#D4A017]">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 text-sm font-semibold">{activeBook.rating}</span>
            </div>
            <span className="text-stone-600">•</span>
            <p className="text-xl font-bold text-white">
              {typeof activeBook.price === 'number' ? `₹${activeBook.price}` : activeBook.price}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {activeBook.pdf && (
              <a 
                href={activeBook.pdf} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 rounded-md border border-stone-700 bg-stone-900/60 px-4 py-2 text-sm font-semibold text-stone-200 transition-colors hover:bg-stone-900 hover:text-white"
              >
                <FileText className="h-4 w-4 text-stone-400" /> Read Preview
              </a>
            )}
            <Link 
              to={shopNowLink}
              className="flex items-center gap-2 rounded-md bg-white px-5 py-2 text-sm font-semibold text-stone-950 transition-colors hover:bg-stone-100 shadow-xs"
            >
              <ShoppingBag className="h-4 w-4" /> Shop Now
            </Link>
          </div>
        </div>
      </div>

      {/* Manual Controls & Pagination */}
      <div className="mt-6 flex items-center justify-between border-t border-stone-800/80 pt-5">
        <div className="flex gap-2">
          {featuredBooks.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-stone-200' : 'w-2 bg-stone-700 hover:bg-stone-500'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={prev}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-stone-800 bg-stone-900 text-stone-300 transition-colors hover:bg-stone-800 hover:text-white cursor-pointer"
            aria-label="Previous book"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={next}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-stone-800 bg-stone-900 text-stone-300 transition-colors hover:bg-stone-800 hover:text-white cursor-pointer"
            aria-label="Next book"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
