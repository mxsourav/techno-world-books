import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Star, Building2, ArrowRight } from 'lucide-react';
import { bookService } from '@/services/api';
import { BookCover } from '@/components/BookCover';
import { useAutoFeaturedBooks } from '@/hooks/useAutoFeaturedBooks';
import type { Book } from '@/types';

export default function PublishedByTechnoWorld() {
  const [dbBooks, setDbBooks] = useState<Book[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const { books: ocrBooks, loading: loadingOcr } = useAutoFeaturedBooks();

  useEffect(() => {
    let isMounted = true;
    bookService
      .getBooks({ publisher: 'Techno World Publications', limit: 12 })
      .then((res) => {
        if (isMounted && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setDbBooks(res.data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load published books from database, using fallback:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingDb(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayBooks = dbBooks.length > 0 ? dbBooks : ocrBooks;
  const isLoading = loadingDb && loadingOcr;

  if (isLoading || displayBooks.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-brand-dark px-4 py-8 text-white sm:px-6 lg:py-12 border-y border-stone-800/80">
      {/* Ambient Lighting Gradient */}
      <div 
        className="pointer-events-none absolute inset-0 z-0" 
        style={{
          background: 'radial-gradient(circle at 50% -20%, rgba(34, 197, 94, 0.22) 0%, transparent 65%), radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.14) 0%, transparent 45%), linear-gradient(180deg, #051d10 0%, #0B2B19 50%, #04160c 100%)',
        }}
      />

      {/* Crosshatch & Fine Dot Academic Texture Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `
            radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px),
            url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.16' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")
          `,
          backgroundSize: '20px 20px, 40px 40px',
        }}
      />

      {/* Subtle Fine Paper Grain Texture Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 max-w-full">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-400/30 backdrop-blur-xs">
              <Building2 className="h-3.5 w-3.5 text-emerald-400" /> In-House Publications
            </div>
            <h2 className="font-serif text-xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
              Published by Techno World
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-300">
              Official publications authored for universities, colleges, and competitive exams across India.
            </p>
          </div>
          <Link
            to="/search?publisher=Techno%20World%20Publications"
            className="group inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white transition-all backdrop-blur-xs shrink-0 shadow-xs hover:scale-105 active:scale-95"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* High-Visibility, Clean White Book Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {displayBooks.slice(0, 6).map((book: any) => {
            const bookPrice = book.price === 'On Request' || book.price === undefined ? 'On Request' : `₹${book.price}`;

            return (
              <Link
                key={book.id || book.slug}
                to={`/book/${book.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-xl bg-white border border-stone-200/90 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-brand-light/50"
              >
                {/* Cover Image Container */}
                <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-stone-50 p-2 sm:p-2.5 border-b border-stone-100 flex items-center justify-center">
                  <BookCover book={book} className="w-full h-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.02]" />

                  {book.edition && (
                    <span className="absolute top-2 left-2 z-30 bg-stone-900/85 backdrop-blur-xs text-[9px] font-extrabold text-white px-1.5 py-0.5 rounded shadow-xs">
                      {book.edition}
                    </span>
                  )}
                </div>

                {/* Content Container */}
                <div className="flex flex-1 flex-col p-3 bg-white">
                  <h3 className="line-clamp-2 min-h-[2.5em] text-xs font-bold leading-snug text-stone-900 group-hover:text-brand-base transition-colors">
                    {book.title}
                  </h3>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 border border-amber-200/70 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                      <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                      {book.rating || 4.8}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">In-House</span>
                  </div>

                  <div className="mt-auto pt-2.5 flex items-baseline justify-between border-t border-stone-100">
                    <span className="text-xs sm:text-sm font-black text-brand-dark">
                      {bookPrice}
                    </span>
                    {book.mrp && Number(book.mrp) > Number(book.price) && (
                      <span className="text-[10px] text-stone-400 line-through">
                        ₹{book.mrp}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
