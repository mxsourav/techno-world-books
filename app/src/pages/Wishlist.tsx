import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Heart, Loader2, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { BookCard, BookRow } from '@/components/BookCard';
import { bookService } from '@/services/api';
import type { Book } from '@/types';
import SEOHead from '@/components/SEOHead';

export default function Wishlist() {
  const { wishlist } = useStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [recos, setRecos] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{status: number, message: string} | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        // Load wishlist books
        if (wishlist.length > 0) {
          const ids = wishlist.join(',');
          const res = await bookService.getBooks({ ids, limit: 100 });
          setBooks(res.data || []);
        } else {
          setBooks([]);
        }
        
        // Load recos
        const recosRes = await bookService.getBooks({ bestSeller: true, limit: 12 });
        // filter out wishlist books
        const filteredRecos = recosRes.data.filter((b: Book) => !wishlist.includes(b.id)).slice(0, 8);
        setRecos(filteredRecos);
      } catch (err: any) {
        setError({
          status: err?.status || 500,
          message: err?.status === 0 ? 'Network Error. Please check your connection.' : 'Failed to load wishlist items.'
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [wishlist]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-stone-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-stone-600">
        <AlertCircle className="mx-auto h-12 w-12 text-stone-400 mb-3" />
        <h2 className="text-xl font-bold text-stone-800">Error Loading Wishlist</h2>
        <p className="text-sm mt-2">{error.message}</p>
        <button onClick={() => window.location.reload()} className="mt-4 rounded-md bg-stone-900 px-6 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors cursor-pointer">Retry</button>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <SEOHead
          title="My Wishlist | Techno World Books"
          description="Saved books in your wishlist."
          noIndex={true}
        />
        <Heart className="mx-auto h-16 w-16 text-stone-300" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-stone-900">Your wishlist is empty</h1>
        <p className="mt-1 text-sm text-stone-500">Tap the heart icon on any book to save it here.</p>
        <Link to="/" className="mt-5 inline-block rounded-md bg-emerald-800 hover:bg-emerald-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors shadow-xs">Discover Books</Link>
        <div className="mt-8 text-left"><BookRow title="Best Sellers" books={recos} /></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
      <SEOHead
        title="My Wishlist | Techno World Books"
        description="Saved books in your wishlist."
        noIndex={true}
      />
      <h1 className="mb-4 font-serif text-2xl font-bold text-stone-900 tracking-tight">My Wishlist <span className="text-base font-sans font-normal text-stone-500">({books.length})</span></h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {books.map((b) => (
          <div key={b.id} className="[&>div]:w-full"><BookCard book={b} /></div>
        ))}
      </div>
      <div className="mt-8"><BookRow title="You may also like" books={recos} /></div>
    </div>
  );
}
