import { useState } from 'react';
import type { Book } from '@/types';
import { getImageUrl } from '@/services/api';

// Classic cloth-bound publisher palettes for realistic paperback / hardcover appearance
const REAL_BOOK_PALETTES = [
  {
    gradient: 'from-[#0f172a] via-[#1e293b] to-[#0a0f1d]',
    dividerColor: '#38bdf8',
    frameBorder: 'border-blue-400/20',
    foilColor: '#bfdbfe',
    seriesTag: 'ACADEMIC MONOGRAPH',
  },
  {
    gradient: 'from-[#2b0d12] via-[#4c111c] to-[#1c060a]',
    dividerColor: '#fb7185',
    frameBorder: 'border-rose-400/20',
    foilColor: '#fecdd3',
    seriesTag: 'CLASSIC REFERENCE',
  },
  {
    gradient: 'from-[#08241c] via-[#0d3b2e] to-[#041611]',
    dividerColor: '#34d399',
    frameBorder: 'border-emerald-400/20',
    foilColor: '#a7f3d0',
    seriesTag: 'STANDARD TEXTBOOK',
  },
  {
    gradient: 'from-[#171330] via-[#26204d] to-[#0e0c20]',
    dividerColor: '#818cf8',
    frameBorder: 'border-indigo-400/20',
    foilColor: '#ddd6fe',
    seriesTag: 'UNIVERSITY PRESS',
  },
  {
    gradient: 'from-[#18181b] via-[#27272a] to-[#09090b]',
    dividerColor: '#a1a1aa',
    frameBorder: 'border-stone-400/20',
    foilColor: '#f4f4f5',
    seriesTag: 'AUTHORITATIVE EDITION',
  },
  {
    gradient: 'from-[#28170d] via-[#3f2416] to-[#170c06]',
    dividerColor: '#fbbf24',
    frameBorder: 'border-amber-400/20',
    foilColor: '#fef08a',
    seriesTag: 'COMPREHENSIVE SERIES',
  },
];

function formatCleanCategory(raw?: string, language?: string): string {
  if (language === 'Bengali') return 'বাংলা সাহিত্য ও অধ্যয়ন';
  if (!raw || typeof raw !== 'string') return 'Academic & Technical';

  // Clean raw database codes like -rc90, -rc12, etc. and hyphens/underscores
  const clean = raw
    .replace(/[-_]rc\d+$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();

  if (!clean) return 'Academic Studies';

  // Capitalize nicely
  return clean
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function BookCover({ book, className = '' }: { book: Partial<Book> & Record<string, any>; className?: string }) {
  const [imageError, setImageError] = useState(false);

  // Fallback hierarchy: coverUrl -> galleryUrls[0] -> images[0] -> coverImage
  let rawCover: string | null = null;
  if (book.coverUrl && typeof book.coverUrl === 'string' && !book.coverUrl.includes('placeholder-book.jpg')) {
    rawCover = book.coverUrl;
  } else if (book.galleryUrls && Array.isArray(book.galleryUrls)) {
    rawCover = book.galleryUrls.find((u: string) => typeof u === 'string' && u.trim() && !u.includes('placeholder-book.jpg')) || null;
  } else if (typeof (book as any).galleryUrls === 'string') {
    try {
      const parsed = JSON.parse((book as any).galleryUrls);
      if (Array.isArray(parsed)) {
        rawCover = parsed.find((u: string) => typeof u === 'string' && u.trim() && !u.includes('placeholder-book.jpg')) || null;
      }
    } catch {}
  }

  if (!rawCover && (book as any).images && Array.isArray((book as any).images)) {
    const firstImg = (book as any).images.find((img: any) => img?.secureUrl && !img.secureUrl.includes('placeholder-book.jpg'));
    if (firstImg) rawCover = firstImg.secureUrl;
  }

  if (!rawCover && book.coverImage && typeof book.coverImage === 'string' && !book.coverImage.includes('placeholder-book.jpg')) {
    rawCover = book.coverImage;
  }

  const imageUrl = getImageUrl(rawCover || undefined);

  if (imageUrl && !imageError) {
    if (imageUrl.toLowerCase().endsWith('.pdf')) {
      return (
        <div className={`relative overflow-hidden rounded-[4px] shadow-[2px_4px_10px_rgba(0,0,0,0.14)] ${className}`} style={{ aspectRatio: '3 / 4.2' }}>
          <iframe
            src={`${imageUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            className="w-full h-full border-0 pointer-events-none"
            title={`Cover of ${book.title}`}
          />
          <div className="absolute inset-0 bg-transparent" />
        </div>
      );
    }

    return (
      <div className={`relative overflow-hidden rounded-[4px] shadow-[2px_4px_10px_rgba(0,0,0,0.14)] ${className}`} style={{ aspectRatio: '3 / 4.2' }}>
        <img
          src={imageUrl}
          alt={`Cover of ${book.title}`}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => {
            setImageError(true);
          }}
        />
      </div>
    );
  }

  // Deterministic palette based on title / ID
  const seed = (book.id || book.title || 'Book')
    .split('')
    .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const palette = REAL_BOOK_PALETTES[Math.abs(seed) % REAL_BOOK_PALETTES.length];

  const categoryText = formatCleanCategory(book.category, book.language);

  // Author sanitation: NEVER display "Unknown Author", "Unknown", or "N/A"
  const rawAuthor = typeof book.author === 'string' ? book.author.trim() : '';
  const isAuthorInvalid =
    !rawAuthor ||
    rawAuthor.toLowerCase().includes('unknown') ||
    rawAuthor.toLowerCase() === 'n/a' ||
    rawAuthor.toLowerCase() === 'none';
  const displayAuthor = isAuthorInvalid ? null : rawAuthor;

  const rawPublisher = typeof book.publisher === 'string' ? book.publisher.trim() : '';
  const isPublisherInvalid =
    !rawPublisher ||
    rawPublisher.toLowerCase().includes('unknown') ||
    rawPublisher.toLowerCase() === 'n/a';
  const displayPublisher = isPublisherInvalid
    ? 'Techno World'
    : (rawPublisher.toLowerCase().includes('techno world') ? 'Techno World' : (rawPublisher.length > 16 ? rawPublisher.slice(0, 15) + '…' : rawPublisher));

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-[4px] shadow-[2px_6px_14px_rgba(0,0,0,0.18),1px_2px_4px_rgba(0,0,0,0.12)] bg-gradient-to-br ${palette.gradient} select-none ${className}`}
      style={{ aspectRatio: '3 / 4.2' }}
      aria-label={`Cover of ${book.title}`}
    >
      {/* 3D Realistic Spine Crease (Left edge book fold and joint indentation) */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-[14px] z-20"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.08) 25%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.05) 100%)',
        }}
      />
      {/* Spine score lines (where the paper cover hinges when opened) */}
      <div className="pointer-events-none absolute left-[14px] top-0 bottom-0 w-px bg-black/40 z-20" />
      <div className="pointer-events-none absolute left-[15px] top-0 bottom-0 w-px bg-white/10 z-20" />

      {/* Right Edge Page Block Depth (Simulates paper thickness under the cover) */}
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-[4px] z-20"
        style={{
          background: 'linear-gradient(to left, rgba(0,0,0,0.3) 0%, transparent 100%)',
        }}
      />

      {/* Top and Bottom subtle paper edge highlight */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-white/15 z-20" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-black/40 z-20" />

      {/* Elegant publisher debossed border frame */}
      <div className={`absolute inset-[7px] left-[20px] rounded-[2px] border ${palette.frameBorder} pointer-events-none z-10`} />

      {/* Cover Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-[9%] pl-[16%] pr-[9%]">
        {/* Header / Category Block */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span
              className="text-[0.48em] font-bold uppercase tracking-[0.22em] text-white/75 truncate"
              title={categoryText}
            >
              {categoryText}
            </span>
          </div>
          <div
            className="h-[1px] w-[70%]"
            style={{
              background: `linear-gradient(to right, ${palette.dividerColor}, transparent)`,
            }}
          />

          {/* Title in Dignified Academic Serif */}
          <h3 className="mt-[8%] font-serif text-[0.98em] font-bold leading-[1.25] text-stone-100 tracking-tight line-clamp-4 drop-shadow-xs">
            {book.title}
          </h3>
        </div>

        {/* Footer / Author & Publisher Imprint */}
        <div className="pt-2">
          {displayAuthor && (
            <div className="mb-2">
              <div
                className="mb-1.5 h-px w-[30%]"
                style={{ background: `linear-gradient(to right, ${palette.foilColor}, transparent)` }}
              />
              <p className="font-serif text-[0.62em] font-medium text-stone-200/90 line-clamp-1 italic tracking-wide">
                {displayAuthor}
              </p>
            </div>
          )}

          {/* Publisher Imprint Seal */}
          <div className="flex items-center justify-between border-t border-white/10 pt-1.5 mt-1">
            <span className="text-[0.46em] uppercase tracking-[0.16em] font-semibold text-stone-300/60 truncate">
              {displayPublisher}
            </span>
            <span className="text-[0.42em] uppercase tracking-wider text-amber-300/70 font-mono shrink-0">
              {palette.seriesTag}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
