import { Link, useNavigate } from 'react-router';
import { BadgePercent, Truck, Gift, Sparkles, ArrowRight, Trophy, Flame, TrendingUp, Sparkle, Stethoscope, Settings, GraduationCap, Library, BookOpen, Quote, Languages, Globe2, Gem, Heart, Clock, Tag } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import { bookService, heroService, getImageUrl } from '@/services/api';
import type { Book } from '@/types';
import { useStore } from '@/store/StoreContext';
import { BookRow } from '@/components/BookCard';
import { SearchBar } from '@/components/Header';
import HeroFeaturedBooks from '@/components/HeroFeaturedBooks';
import PublishedByTechnoWorld from '@/components/PublishedByTechnoWorld';
import StudyGuides from '@/components/StudyGuides';
import PromoBanners from '@/components/PromoBanners';
import { useAutoFeaturedBooks } from '@/hooks/useAutoFeaturedBooks';
import { SEARCH_SUGGESTIONS } from '@/data/constants';
import SEOHead, { buildWebsiteJsonLd } from '@/components/SEOHead';

const PUBLISHERS = ['NCERT', 'Arihant Publications', 'McGraw Hill', 'Elsevier', 'Penguin', 'Ananda Publishers', 'MTG Learning Media', 'Dhanpat Rai'];

import { BOOK_PRESETS, type BookPresetId } from '@/types/hero';

export default function Home() {
  const { recentlyViewed } = useStore();
  const navigate = useNavigate();

  const [books, setBooks] = useState<Book[]>([]);

  const CACHED_COVER_KEY = 'tw_hero_cover_url';
  const CACHED_MODEL_KEY = 'tw_hero_book_model';

  // Synchronously initialize from localStorage so the image renders on millisecond 0 with zero delay
  const [heroCoverUrl, setHeroCoverUrl] = useState<string | null>(() => {
    try {
      const cached = localStorage.getItem(CACHED_COVER_KEY);
      if (cached) return cached;
    } catch {}
    return getImageUrl('/uploads/hero/hero-book-cover-1788824544793.webp');
  });

  const [activePresetId, setActivePresetId] = useState<BookPresetId>(() => {
    try {
      const cached = localStorage.getItem(CACHED_MODEL_KEY);
      if (cached && (cached in BOOK_PRESETS)) return cached as BookPresetId;
    } catch {}
    return 'academic';
  });

  const [isManualModelChosen, setIsManualModelChosen] = useState(true);
  const heroCanvasRef = useRef<HTMLDivElement>(null);
  const [bookScale, setBookScale] = useState(1);

  const activePreset = BOOK_PRESETS[activePresetId] || BOOK_PRESETS.academic;

  useEffect(() => {
    heroService.getHeroConfig()
      .then((res) => {
        if (res.success && res.data?.hero_book_cover_url) {
          const baseUrl = getImageUrl(res.data.hero_book_cover_url);
          const fullUrl = res.data.hero_book_cover_updated_at 
            ? `${baseUrl}?v=${new Date(res.data.hero_book_cover_updated_at).getTime()}` 
            : baseUrl;
          
          setHeroCoverUrl((prev) => {
            if (prev && (prev === fullUrl || prev === baseUrl)) return prev;
            return fullUrl;
          });
          try {
            localStorage.setItem(CACHED_COVER_KEY, baseUrl);
          } catch {}

          if (res.data.hero_book_model && (res.data.hero_book_model in BOOK_PRESETS)) {
            const modelId = res.data.hero_book_model as BookPresetId;
            setActivePresetId(modelId);
            setIsManualModelChosen(true);
            try {
              localStorage.setItem(CACHED_MODEL_KEY, modelId);
            } catch {}
          }
        } else {
          setHeroCoverUrl(null);
        }
      })
      .catch(() => {
        // Keep cached cover on error
      });
  }, []);

  useEffect(() => {
    if (!heroCanvasRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          setBookScale(width / 1672);
        }
      }
    });
    observer.observe(heroCanvasRef.current);
    return () => observer.disconnect();
  }, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { books: autoBooks } = useAutoFeaturedBooks();

  useEffect(() => {
    // Keep for any future featured slider logic
  }, [autoBooks.length]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    bookService.getBooks({ limit: 100 })
      .then((booksRes) => {
        if (booksRes.success && Array.isArray(booksRes.data)) {
          setBooks(booksRes.data);
        } else if (!booksRes.success) {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const bestsellers = books.filter((b) => b.bestseller);
  const trending = books.filter((b) => b.trending);
  const newReleases = books.filter((b) => b.newRelease);
  const recent = recentlyViewed.map((id) => books.find((b) => b.id === id)).filter(Boolean) as Book[];
  const recommended = [...books].sort((a, b) => b.rating * b.ratingsCount - a.rating * a.ratingsCount).slice(0, 10);

  const byCategory = (slug: string) => books.filter((b) => b.category === slug).slice(0, 10);

  // const featuredBook = books.find((b) => b.featured) || books[0];

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-slate-50 selection:bg-emerald-500/30">
      <SEOHead
        title="Techno World Books — Buy Academic, School & College Books Online"
        description="Every book India reads, one search away. Fast delivery across India on genuine textbooks, reference materials, and publications."
        canonicalUrl="https://technoworldbooks.in/"
        structuredData={buildWebsiteJsonLd()}
      />
      {/* Hero Section */}
      <section id="home-hero" className="relative flex min-h-[620px] w-full max-w-full min-w-0 flex-col justify-center overflow-x-hidden bg-[#02120b] pb-24 pt-7 text-white sm:min-h-[85vh] sm:pb-32 sm:pt-14 lg:pt-16 lg:pb-40">
        {/* Synchronized Hero Canvas with Pure CSS 3D Perspective Book Cover & Paperback Texture */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div
            ref={heroCanvasRef}
            className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-[45%]"
            style={{
              aspectRatio: '1672 / 941',
              minWidth: '100%',
              minHeight: '100%',
              width: 'auto',
              height: 'auto',
            }}
          >
            {/* Base Hero Mockup Image */}
            <img
              src="/hero_mockup.png"
              alt="Techno World Books Hero Mockup"
              className="absolute inset-0 h-full w-full object-fill pointer-events-none select-none"
              loading="eager"
              decoding="async"
            />

            {/* Realistic Physical Multi-Vector Shadow on Wooden Riser */}
            <div
              className="absolute hidden lg:block pointer-events-none"
              style={{
                left: activePreset.shadow.diffuse.left,
                top: activePreset.shadow.diffuse.top,
                width: activePreset.shadow.diffuse.width,
                height: activePreset.shadow.diffuse.height,
                transform: `rotate(${activePreset.shadow.diffuse.angle})`,
                background: 'radial-gradient(ellipse at 50% 50%, rgba(5,2,1,0.88) 0%, rgba(15,8,3,0.50) 55%, transparent 75%)',
                filter: 'blur(6px)',
              }}
            />
            {/* Front Cover Bottom Contact Shadow */}
            <div
              className="absolute hidden lg:block pointer-events-none"
              style={{
                left: activePreset.shadow.contact.left,
                top: activePreset.shadow.contact.top,
                width: activePreset.shadow.contact.width,
                height: activePreset.shadow.contact.height,
                transformOrigin: '0% 50%',
                transform: `rotate(${activePreset.shadow.contact.angle})`,
                background: 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.98) 40%, rgba(0,0,0,0.90) 85%, rgba(0,0,0,0.60) 100%)',
                filter: 'blur(2px)',
              }}
            />
            {/* Page Block Bottom Contact Shadow */}
            {activePreset.shadow.pageBlock && (
              <div
                className="absolute hidden lg:block pointer-events-none"
                style={{
                  left: activePreset.shadow.pageBlock.left,
                  top: activePreset.shadow.pageBlock.top,
                  width: activePreset.shadow.pageBlock.width,
                  height: activePreset.shadow.pageBlock.height,
                  transformOrigin: '0% 0%',
                  transform: `rotate(${activePreset.shadow.pageBlock.angle})`,
                  background: 'linear-gradient(90deg, rgba(0,0,0,0.98) 0%, rgba(10,5,2,0.92) 40%, rgba(20,10,5,0.75) 80%, rgba(0,0,0,0.40) 100%)',
                  filter: 'blur(1.5px)',
                }}
              />
            )}

            {/* Page Block Soft Cast Shadow on Wooden Table */}
            {activePreset.shadow.pageBlockCast && (
              <div
                className="absolute hidden lg:block pointer-events-none"
                style={{
                  left: activePreset.shadow.pageBlockCast.left,
                  top: activePreset.shadow.pageBlockCast.top,
                  width: activePreset.shadow.pageBlockCast.width,
                  height: activePreset.shadow.pageBlockCast.height,
                  transformOrigin: '0% 50%',
                  transform: activePreset.shadow.pageBlockCast.angle ? `rotate(${activePreset.shadow.pageBlockCast.angle})` : undefined,
                  background: 'radial-gradient(ellipse at 40% 50%, rgba(0,0,0,0.85) 0%, rgba(10,5,2,0.50) 60%, transparent 85%)',
                  filter: 'blur(4px)',
                }}
              />
            )}

            {/* Dynamic 3D Book on Wooden Pedestal */}
            <div
              className="absolute hidden lg:block"
              style={{
                left: activePreset.container.left,
                top: activePreset.container.top,
                width: activePreset.container.width,
                height: activePreset.container.height,
              }}
            >
              {/* Base Transparent 3D Book Model (Spine & Page Block with Realistic Shading) */}
              <img
                src={activePreset.imageSrc}
                alt={activePreset.name}
                className="absolute inset-0 h-full w-full object-contain pointer-events-none select-none"
                loading="eager"
                decoding="async"
              />

              {/* Dynamic Spine Wrap: Blurred & Darkened Primary Tone Blend */}
              {heroCoverUrl && activePreset.spine && (
                <div
                  className="absolute pointer-events-none select-none overflow-hidden"
                  style={{
                    left: activePreset.spine.left,
                    top: activePreset.spine.top,
                    width: activePreset.spine.width,
                    height: activePreset.spine.height,
                    transformOrigin: '0% 0%',
                    transform: activePreset.spine.matrix(bookScale),
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <img
                    src={heroCoverUrl}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover scale-125 filter blur-[3px] brightness-70 contrast-110 saturate-105"
                    loading="eager"
                    decoding="async"
                  />
                  {/* 3D Spine Cylindrical Shading Gradient */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, rgba(0,0,0,0.70) 0%, rgba(255,220,150,0.12) 30%, rgba(0,0,0,0.40) 85%, rgba(0,0,0,0.80) 100%)',
                    }}
                  />
                </div>
              )}

              {/* Dynamic Book Cover Overlay */}
              {heroCoverUrl && (
                <div
                  className="absolute pointer-events-none select-none overflow-hidden"
                  style={{
                    left: activePreset.overlay.left,
                    top: activePreset.overlay.top,
                    width: activePreset.overlay.width,
                    height: activePreset.overlay.height,
                    transformOrigin: '0% 0%',
                    transform: activePreset.overlay.matrix(bookScale),
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {/* Darkened & Blurred Underlayer for edge bleed so background color blends seamlessly */}
                  <img
                    src={heroCoverUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover scale-110 filter blur-sm brightness-60 pointer-events-none select-none"
                    loading="eager"
                    decoding="async"
                  />

                  {/* Book Cover Image: mapped 100% across the perspective plane with ZERO cropping, matte paper grading */}
                  <img
                    src={heroCoverUrl}
                    alt="Featured Book Cover"
                    className="relative z-10 h-full w-full object-fill block select-none"
                    style={{
                      filter: 'brightness(0.96) saturate(0.95) contrast(0.98)',
                    }}
                    onLoad={(e) => {
                      if (!isManualModelChosen) {
                        const img = e.currentTarget;
                        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                          const ratio = img.naturalHeight / img.naturalWidth;
                          if (ratio < 1.42) {
                            setActivePresetId('novel');
                          } else if (ratio > 1.58) {
                            setActivePresetId('reference');
                          } else {
                            setActivePresetId('academic');
                          }
                        }
                      }
                    }}
                    loading="eager"
                    decoding="async"
                  />

                  {/* Ambient Warm Incandescent Room Lighting Overlay */}
                  <div
                    className="absolute inset-0 z-20 pointer-events-none"
                    style={{
                      background: 'linear-gradient(145deg, rgba(255, 215, 125, 0.15) 0%, rgba(200, 140, 50, 0.07) 45%, rgba(15, 8, 3, 0.28) 100%)',
                      mixBlendMode: 'soft-light',
                    }}
                  />

                  {/* Physical Spine Crease & Page Seam Ambient Occlusion */}
                  <div
                    className="absolute inset-0 z-20 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.12) 3%, transparent 8%, transparent 92%, rgba(0,0,0,0.22) 100%)',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Gradient Overlay: constrained to left text column so the 3D book on the right remains 100% crisp, vibrant, and un-tinted */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b sm:bg-gradient-to-r from-[#03150b] via-[#0a2e16]/95 to-transparent pointer-events-none w-full lg:w-[50%]"></div>

        {/* Subtle Geometric Texture Overlay (Fades out early on left text column) */}
        <div
          className="absolute inset-0 z-0 pointer-events-none w-full lg:w-[50%] opacity-80"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M64 0H0v64' fill='none' stroke='%23ffffff' stroke-width='1.5' stroke-opacity='0.12'/%3E%3C/svg%3E")`,
            WebkitMaskImage: 'linear-gradient(to right, black, transparent 75%)'
          }}
        ></div>

        {/* Content Container - Exactly matches Header.tsx alignment */}
        <div className="relative z-10 mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:ml-[4%] lg:mr-auto">

          {/* Left Column (Right is empty because book is in the image) */}
          <div className="flex w-full min-w-0 max-w-[750px] flex-col overflow-visible text-left lg:w-[60%]">

            {/* Top Sale Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0a2e1f] border border-[#D4A017] px-3.5 py-1.5 mb-5 shadow-sm max-w-full">
              <Tag className="h-3.5 w-3.5 text-[#D4A017] shrink-0" />
              <span className="text-[11px] sm:text-[13px] font-medium text-[#D4A017] truncate sm:whitespace-normal">Grand Book Sale — Up to 60% off 10,000+ titles</span>
            </div>

            {/* Main Heading */}
            <h1
              className="font-bold drop-shadow-md max-w-[800px]"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(1.8rem, 5vw, 3.75rem)",
                lineHeight: "1.15",
                letterSpacing: "-0.01em"
              }}
            >
              <span
                className="block"
                style={{
                  backgroundImage: "linear-gradient(to bottom, #FFFFFF 0%, #B8C4BE 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.8))"
                }}
              >
                Every book India reads,
              </span>
              <span
                className="block mt-1"
                style={{
                  backgroundImage: "linear-gradient(to bottom, #FFE885 0%, #E6A300 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0px 5px 10px rgba(0,0,0,0.9))"
                }}
              >
                one search away.
              </span>
            </h1>

            {/* Description */}
            <p
              className="mt-4 font-normal drop-shadow"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(0.95rem, 2.5vw, 1.05rem)",
                lineHeight: "1.55",
                color: "rgba(255, 255, 255, 0.85)",
                maxWidth: "520px",
                textAlign: "left"
              }}
            >
              From academic textbooks to bestselling fiction, get genuine books delivered straight to your doorstep with guaranteed lowest prices.
            </p>

            {/* Search Bar */}
            <SearchBar
              id="home-hero-search"
              className="mt-6 h-[48px] w-full min-w-0 shadow-[0_12px_35px_rgba(0,0,0,0.4)] sm:h-[54px] [&_button]:px-4 [&_input]:min-w-0 [&_input]:text-[12px] sm:[&_button]:px-8 sm:[&_input]:text-[14px]"
            />

            {/* Category Chips */}
            <div className="relative mt-[18px] w-full min-w-0">
              <div
                className="hero-chip-container flex w-full min-w-0 flex-wrap items-center justify-start gap-2 overflow-visible"
              >
                {SEARCH_SUGGESTIONS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                    className="flex max-w-full items-center gap-1.5 rounded-[999px] px-[16px] py-[8px] text-[12px] text-[#F5F5F5] transition-all duration-250 ease-in-out whitespace-normal sm:text-[13px]"
                    style={{
                      background: 'rgba(15,55,38,0.65)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(8px)'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#0E5A3A'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15,55,38,0.65)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Offer Highlights Bar (White Card Look) */}
            <div className="mt-[28px] w-full rounded-[20px] bg-[#f8f5ef] py-3 px-4 sm:px-6 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-stretch md:items-center justify-around border border-[#e5e0d8] gap-3.5 md:gap-0">
              <div className="flex items-center gap-3 px-2 sm:px-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shadow-xs">
                  <BadgePercent className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-[13px] leading-tight">STUDENT15 — 15% off</div>
                  <div className="text-slate-600 text-[11px] leading-tight mt-0.5 font-medium">For students on exam & academic books</div>
                </div>
              </div>

              <div className="hidden md:block w-px h-8 bg-slate-200"></div>
              <div className="block md:hidden h-px w-full bg-slate-200/80"></div>

              <div className="flex items-center gap-3 px-2 sm:px-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shadow-xs">
                  <Truck className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-[13px] leading-tight">Free Delivery</div>
                  <div className="text-slate-600 text-[11px] leading-tight mt-0.5 font-medium">On all orders above ₹999 across India</div>
                </div>
              </div>

              <div className="hidden md:block w-px h-8 bg-slate-200"></div>
              <div className="block md:hidden h-px w-full bg-slate-200/80"></div>

              <div className="flex items-center gap-3 px-2 sm:px-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-800 shadow-xs">
                  <Gift className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-[13px] leading-tight">Techno Rewards</div>
                  <div className="text-slate-600 text-[11px] leading-tight mt-0.5 font-medium">Earn 1 Techno Coin per ₹100 spent (excl. delivery)</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PROMO BANNERS SECTION */}
      <PromoBanners />

      <PublishedByTechnoWorld />

      {error ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-slate-500 text-center">
          <span className="text-4xl mb-4">⚠️</span>
          <h2 className="text-lg font-bold text-slate-700">Failed to load books</h2>
          <p className="text-sm max-w-xs">We couldn't reach the server. Please try again later.</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-emerald-600 px-6 py-2 font-bold text-white">Retry</button>
        </div>
      ) : !loading && books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-slate-500 text-center">
          <span className="text-4xl mb-4">📚</span>
          <h2 className="text-lg font-bold text-slate-700">No books available</h2>
          <p className="text-sm">Check back later for new arrivals.</p>
        </div>
      ) : (
        <>
          {/* PUBLISHERS */}
          <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
            <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">Shop by Publisher</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PUBLISHERS.map((p) => (
                <Link
                  key={p}
                  to={`/search?q=${encodeURIComponent(p)}`}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-5 text-center text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800"
                >
                  {p}
                </Link>
              ))}
            </div>
          </section>

          <BookRow icon={<Heart className="h-5 w-5 text-rose-500" />} title="Recommended For You" books={recommended} loading={loading} />
          {(recent.length > 0 || loading) && <BookRow icon={<Clock className="h-5 w-5 text-slate-500" />} title="Recently Viewed" books={recent} loading={loading} />}

          <HeroFeaturedBooks />
          <BookRow icon={<Flame className="h-5 w-5 text-orange-500" />} title="Best Sellers" books={bestsellers} viewAllLink="/search?q=bestseller" loading={loading} />
          <BookRow icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} title="Trending Now" books={trending} loading={loading} />
          <BookRow icon={<Sparkle className="h-5 w-5 text-amber-500" />} title="New Releases" books={newReleases} loading={loading} />

          {/* EXAM ZONE BANNER */}
          <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6">
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-violet-800 p-5 text-white sm:flex-row sm:items-center sm:p-8">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-300"><Trophy className="h-4 w-4" /> Exam Zone</p>
                <h3 className="mt-1 text-lg font-extrabold sm:text-2xl leading-snug">NEET · JEE · UPSC · GATE · SSC — all prep books in one place</h3>
                <p className="mt-1 text-xs sm:text-sm text-violet-200">Previous year papers, toppers' booklists and combo packs at the best prices.</p>
              </div>
              <Link to="/category/competitive-exams" className="flex shrink-0 items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-300 w-full sm:w-auto justify-center sm:justify-start">
                Shop Exam Books <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <BookRow icon={<Trophy className="h-5 w-5 text-violet-500" />} title="Competitive Exam Books" books={byCategory('competitive-exams')} viewAllLink="/category/competitive-exams" loading={loading} />
          <BookRow icon={<Stethoscope className="h-5 w-5 text-blue-500" />} title="Medical Books" books={byCategory('medical')} viewAllLink="/category/medical" loading={loading} />
          <BookRow icon={<Settings className="h-5 w-5 text-slate-500" />} title="Engineering Books" books={byCategory('engineering')} viewAllLink="/category/engineering" loading={loading} />
          <BookRow icon={<Library className="h-5 w-5 text-pink-500" />} title="School Books" books={byCategory('school')} viewAllLink="/category/school" loading={loading} />
          <BookRow icon={<GraduationCap className="h-5 w-5 text-emerald-600" />} title="University Books" books={byCategory('university')} viewAllLink="/category/university" loading={loading} />
          <BookRow icon={<BookOpen className="h-5 w-5 text-amber-600" />} title="Fiction" books={byCategory('fiction')} viewAllLink="/category/fiction" loading={loading} />
          <BookRow icon={<Quote className="h-5 w-5 text-indigo-500" />} title="Non-Fiction" books={byCategory('non-fiction')} viewAllLink="/category/non-fiction" loading={loading} />
          <BookRow icon={<Languages className="h-5 w-5 text-rose-500" />} title="Bengali Story Books" books={byCategory('bengali')} viewAllLink="/category/bengali" loading={loading} />
          <BookRow icon={<Globe2 className="h-5 w-5 text-teal-500" />} title="International Books" books={byCategory('international')} viewAllLink="/category/international" loading={loading} />
          <BookRow icon={<Gem className="h-5 w-5 text-amber-500" />} title="Rare & Collector's Editions" books={byCategory('rare')} viewAllLink="/category/rare" loading={loading} />

          <StudyGuides />
        </>
      )}

      {/* LOYALTY CTA */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 p-5 text-slate-900 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest"><Sparkles className="h-4 w-4" /> Techno Rewards</p>
              <h3 className="mt-1 text-lg font-extrabold sm:text-2xl leading-snug">Earn points on every order. Redeem on your next.</h3>
              <p className="mt-1 text-xs sm:text-sm font-medium opacity-80">Refer a friend and both of you get ₹100 in points.</p>
            </div>
            <Link to="/account" className="shrink-0 rounded-xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white hover:bg-slate-800 w-full sm:w-auto text-center">
              Check My Rewards
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
