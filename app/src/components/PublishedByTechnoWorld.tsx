import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Star, Building2, ArrowRight, BookOpen } from 'lucide-react';
import { bookService, getImageUrl } from '@/services/api';
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
    <section className="bg-slate-900 px-4 py-8 text-white sm:px-6 lg:py-10 border-y border-slate-800">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 max-w-full">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              <Building2 className="h-3.5 w-3.5" /> In-House Publications
            </div>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
              Published by Techno World
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Official publications authored for universities, colleges, and competitive exams across India.
            </p>
          </div>
          <Link
            to="/search?publisher=Techno%20World%20Publications"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Compact, Sleek Book Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {displayBooks.slice(0, 6).map((book: any) => {
            const coverSrc = getImageUrl(book.coverUrl || book.coverImage || book.cover || book.coverDataUrl);
            const bookPrice = book.price === 'On Request' || book.price === undefined ? 'On Request' : `₹${book.price}`;

            return (
              <Link
                key={book.id || book.slug}
                to={`/book/${book.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-lg bg-slate-800/90 border border-slate-700/60 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/40"
              >
                {/* Compact Cover Image */}
                <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-slate-800 flex items-center justify-center">
                  {coverSrc ? (
                    <img
                      src={coverSrc}
                      alt={book.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.classList.add('bg-slate-800', 'flex', 'items-center', 'justify-center');
                          e.currentTarget.parentElement.innerHTML = '<div class="text-emerald-400 text-xs font-bold p-2 text-center">Techno World</div>';
                        }
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center text-slate-500">
                      <BookOpen className="h-6 w-6 text-slate-600 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400">Techno World</span>
                    </div>
                  )}

                  {book.edition && (
                    <span className="absolute top-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-[9px] font-extrabold text-emerald-300 px-1.5 py-0.5 rounded shadow">
                      {book.edition}
                    </span>
                  )}
                </div>

                {/* Compact Content */}
                <div className="flex flex-1 flex-col p-2.5">
                  <h3 className="line-clamp-2 text-xs font-bold leading-snug text-slate-100 group-hover:text-emerald-300 transition-colors">
                    {book.title}
                  </h3>

                  <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-400">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="font-bold text-slate-300">{book.rating || 4.8}</span>
                  </div>

                  <div className="mt-auto pt-2 flex items-baseline justify-between">
                    <span className="text-xs sm:text-sm font-black text-emerald-400">
                      {bookPrice}
                    </span>
                    {book.mrp && Number(book.mrp) > Number(book.price) && (
                      <span className="text-[10px] text-slate-500 line-through">
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
