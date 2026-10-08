import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from 'lucide-react';
import { formatINR } from '@/utils/helpers';
import { useStore } from '@/store/StoreContext';
import { toast } from 'sonner';
import { BookCover } from '@/components/BookCover';
import type { Book } from '@/types';

export interface RecentlyViewedItem {
  id: string;
  title: string;
  slug: string;
  author: string;
  price: number;
  mrp?: number;
  coverUrl?: string;
  coverImage?: string;
  publisher?: string;
  edition?: string;
}

interface RecentlyViewedCarouselProps {
  currentBookId?: string;
}

export const RecentlyViewedCarousel: React.FC<RecentlyViewedCarouselProps> = ({ currentBookId }) => {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useStore();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tw_recently_viewed');
      if (stored) {
        const parsed: RecentlyViewedItem[] = JSON.parse(stored);
        // Filter out current book if provided
        const filtered = currentBookId
          ? parsed.filter((item) => item.id !== currentBookId)
          : parsed;
        setItems(filtered);
      }
    } catch (e) {
      // Ignore localStorage parse issues
    }
  }, [currentBookId]);

  if (items.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleQuickAdd = (e: React.MouseEvent, book: RecentlyViewedItem) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(book.id, 1);
    toast.success(`Added "${book.title.slice(0, 30)}..." to cart`);
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-stone-100 text-stone-700">
            <Clock className="h-3.5 w-3.5 text-stone-700" />
          </span>
          <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900">
            Recently Viewed Books
          </h3>
          <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
            {items.length}
          </span>
        </div>

        {items.length > 3 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
              title="Scroll left"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
              title="Scroll right"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-200"
      >
        {items.map((book) => {
          const discountPercent =
            book.mrp && book.mrp > book.price
              ? Math.round(((book.mrp - book.price) / book.mrp) * 100)
              : null;

          return (
            <div
              key={book.id}
              className="group relative flex flex-col justify-between w-44 sm:w-48 shrink-0 rounded-md border border-stone-200 bg-white p-3 hover:border-stone-400 hover:shadow-xs transition-all"
            >
              <Link to={`/book/${book.slug}`} className="block">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-stone-100 border border-stone-200">
                  <BookCover
                    book={book as any as Book}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {discountPercent && (
                    <span className="absolute top-1.5 left-1.5 rounded-sm bg-emerald-800 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-2xs">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                <div className="mt-2.5 space-y-1">
                  {book.publisher && (
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 truncate">
                      {book.publisher}
                    </div>
                  )}
                  <h4 className="text-xs font-semibold text-stone-900 line-clamp-2 leading-snug group-hover:text-stone-700 transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 truncate">
                    {book.author}
                  </p>
                </div>
              </Link>

              <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-stone-900 font-mono">
                    {formatINR(book.price)}
                  </span>
                  {book.mrp && book.mrp > book.price && (
                    <span className="text-[10px] text-stone-400 line-through font-mono">
                      {formatINR(book.mrp)}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => handleQuickAdd(e, book)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-stone-200 bg-stone-50 text-stone-700 hover:bg-emerald-800 hover:text-white hover:border-emerald-800 transition-colors shadow-2xs"
                  title="Add to cart"
                >
                  <ShoppingCart className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentlyViewedCarousel;
