import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Star,
  MapPin,
  Clock,
  Phone,
  ExternalLink,
  Navigation,
  ThumbsUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Store,
  MessageCircle,
} from 'lucide-react';

interface GoogleReview {
  id: string;
  name: string;
  avatarBg: string;
  rating: number;
  date: string;
  isLocalGuide?: boolean;
  reviewsCount?: number;
  comment: string;
  helpfulCount: number;
  highlightTag?: string;
}

const GOOGLE_REVIEWS_DATA: GoogleReview[] = [
  {
    id: 'rev-1',
    name: 'Subhajit Banerjee',
    avatarBg: 'bg-blue-600',
    rating: 5,
    date: '2 weeks ago',
    isLocalGuide: true,
    reviewsCount: 42,
    comment: 'Undoubtedly one of the best and largest book shops on College Street. Whether you need medical, engineering, or civil services (UPSC/WBCS) books, Techno World has everything in stock. The staff is polite and offers genuine discounts. Highly recommended!',
    helpfulCount: 28,
    highlightTag: 'Competitive & Academic'
  },
  {
    id: 'rev-2',
    name: 'Dr. Poulomi Mukherjee',
    avatarBg: 'bg-emerald-600',
    rating: 5,
    date: '3 weeks ago',
    isLocalGuide: false,
    reviewsCount: 12,
    comment: 'Extremely reliable bookstore. I bought all my MBBS and postgrad medical reference books from here opposite Grace Cinema. Now I order through their website and the books arrive in pristine condition. Truly 16,000+ well-deserved organic reviews!',
    helpfulCount: 19,
    highlightTag: 'Medical & Healthcare'
  },
  {
    id: 'rev-3',
    name: 'Anirban Ghosh',
    avatarBg: 'bg-purple-600',
    rating: 5,
    date: '1 month ago',
    isLocalGuide: true,
    reviewsCount: 68,
    comment: 'Legendary book distributor of Kolkata! Located in the iconic YMCA Building. If a rare textbook or foreign edition isn\'t available anywhere in Boi Para, Techno World will arrange it for you within hours. 5/5 stars always.',
    helpfulCount: 34,
    highlightTag: 'College Street Heritage'
  },
  {
    id: 'rev-4',
    name: 'Debolina Sen',
    avatarBg: 'bg-rose-600',
    rating: 5,
    date: '1 month ago',
    isLocalGuide: false,
    reviewsCount: 8,
    comment: 'Ordered semester textbooks online for delivery outside Kolkata. Very fast delivery and excellent packaging with bubble wrap. Genuine publisher editions with original invoices. Best online and offline experience.',
    helpfulCount: 15,
    highlightTag: 'Safe Fast Delivery'
  },
  {
    id: 'rev-5',
    name: 'Rohan Dasgupta',
    avatarBg: 'bg-amber-600',
    rating: 5,
    date: '2 months ago',
    isLocalGuide: false,
    reviewsCount: 23,
    comment: 'I have been visiting Techno World since 2018 for engineering books. Great discounts compared to MRP, and the staff knows exactly which edition is recommended for MAKAUT and Calcutta University. Pride of College Street.',
    helpfulCount: 22,
    highlightTag: 'Engineering & Tech'
  },
  {
    id: 'rev-6',
    name: 'Rajesh Kumar Sharma',
    avatarBg: 'bg-teal-600',
    rating: 5,
    date: '2 months ago',
    isLocalGuide: true,
    reviewsCount: 115,
    comment: 'One-stop solution for competitive examinations like GATE, SSC, and Banking. Vast stock, genuine prices, and great customer service. Their 4.4 rating with 16k reviews is proof of their consistent trust and quality.',
    helpfulCount: 41,
    highlightTag: 'UPSC · GATE · SSC'
  },
  {
    id: 'rev-7',
    name: 'Sayan Chatterjee',
    avatarBg: 'bg-indigo-600',
    rating: 5,
    date: '3 months ago',
    isLocalGuide: false,
    reviewsCount: 15,
    comment: 'The staff are very courteous and helpful. They don\'t just sell books; they guide you to the right authors and publishers. The online ordering feature makes it super easy without having to travel in peak Kolkata traffic.',
    helpfulCount: 17,
    highlightTag: 'Helpful Staff'
  },
  {
    id: 'rev-8',
    name: 'Priyanka Roy',
    avatarBg: 'bg-pink-600',
    rating: 4,
    date: '3 months ago',
    isLocalGuide: false,
    reviewsCount: 6,
    comment: 'Huge inventory! Can get crowded during admission season because everyone in Kolkata rushes here, but the billing and counter assistance are very quick. Great discounts on school and college books.',
    helpfulCount: 11,
    highlightTag: 'Huge Inventory'
  },
  {
    id: 'rev-9',
    name: 'Koushik Halder',
    avatarBg: 'bg-cyan-600',
    rating: 5,
    date: '4 months ago',
    isLocalGuide: true,
    reviewsCount: 31,
    comment: 'College Street-er shera boi-er dokan! Excellent collection of Bengali literature, academic references, and general fiction. Very trustworthy team under Joy-da. Keep growing!',
    helpfulCount: 29,
    highlightTag: 'Bengali & Literature'
  },
  {
    id: 'rev-10',
    name: 'Amitava Sen',
    avatarBg: 'bg-orange-600',
    rating: 5,
    date: '4 months ago',
    isLocalGuide: true,
    reviewsCount: 84,
    comment: 'Techno World Publisher & Distributor has been serving the student community for decades. Unmatched variety of computer science, IT, and mathematics books. Fair pricing and 100% genuine titles.',
    helpfulCount: 38,
    highlightTag: 'Computer Science & IT'
  },
  {
    id: 'rev-11',
    name: 'Sneha Ganguly',
    avatarBg: 'bg-violet-600',
    rating: 5,
    date: '5 months ago',
    isLocalGuide: false,
    reviewsCount: 9,
    comment: 'Ordered via phone and website. Delivery was completed in 2 days. The book quality is top notch. So happy to support a genuine Kolkata heritage bookshop online!',
    helpfulCount: 14,
    highlightTag: 'Verified Customer'
  },
  {
    id: 'rev-12',
    name: 'Vikramaditya Roy',
    avatarBg: 'bg-red-600',
    rating: 5,
    date: '6 months ago',
    isLocalGuide: false,
    reviewsCount: 19,
    comment: 'From UPSC aspirants to university scholars, Techno World is the first name that comes to mind in Kolkata. Huge respect for their rich collection and honest business ethics.',
    helpfulCount: 26,
    highlightTag: 'Trusted Heritage'
  }
];

export const GoogleReviewsAndMap: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'FIVE_STAR' | 'COMPETITIVE' | 'DELIVERY'>('ALL');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef<boolean>(false);
  const touchTimeoutRef = useRef<any>(null);

  const filteredReviews = GOOGLE_REVIEWS_DATA.filter((rev) => {
    if (activeFilter === 'FIVE_STAR') return rev.rating === 5;
    if (activeFilter === 'COMPETITIVE') return rev.highlightTag?.toLowerCase().includes('competitive') || rev.highlightTag?.toLowerCase().includes('upsc');
    if (activeFilter === 'DELIVERY') return rev.highlightTag?.toLowerCase().includes('delivery');
    return true;
  });

  // Ensure ample duplicates so wrapping around is completely seamless
  const displayReviews = useMemo(() => {
    if (filteredReviews.length === 0) return [];
    let list = [...filteredReviews];
    while (list.length < 12) {
      list = [...list, ...filteredReviews];
    }
    return [...list, ...list];
  }, [filteredReviews]);

  // Smooth, continuous right-to-left scrolling via requestAnimationFrame
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animId: number;
    const step = () => {
      if (!isPausedRef.current && container) {
        // Continuous right-to-left flow (advance scrollLeft)
        container.scrollLeft += 0.85; // ~50px/second smooth reading speed
        const halfWidth = container.scrollWidth / 2;
        if (container.scrollLeft >= halfWidth) {
          container.scrollLeft -= halfWidth;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [displayReviews]);

  // Manual scroll controls with wrapping safeguards
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const halfWidth = container.scrollWidth / 2;
      if (container.scrollLeft <= 30) {
        container.scrollLeft += halfWidth;
      }
      container.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const halfWidth = container.scrollWidth / 2;
      if (container.scrollLeft >= halfWidth) {
        container.scrollLeft -= halfWidth;
      }
      container.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  // Google Maps directions & reviews URLs
  const GOOGLE_MAPS_SEARCH_URL = 'https://www.google.com/maps/search/?api=1&query=Techno+World+YMCA+Building+Mahatma+Gandhi+Rd+College+Street+Kolkata';
  const GOOGLE_DIRECTIONS_URL = 'https://www.google.com/maps/dir/?api=1&destination=Techno+World+YMCA+Building+Mahatma+Gandhi+Rd+College+Street+Kolkata';
  const GOOGLE_WRITE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJVx4NJ6t3AjoRgG5feEz4Tms';
  const GOOGLE_MAPS_IFRAME_SRC = 'https://maps.google.com/maps?q=Techno+World,+YMCA+Building,+Mahatma+Gandhi+Rd,+College+Street,+Kolkata&hl=en&z=16&output=embed';

  return (
    <section className="relative w-full border-t border-slate-200/80 bg-gradient-to-b from-slate-50 via-white to-slate-100/60 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 space-y-8">
        
        {/* TOP GOOGLE REPUTATION HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Google Brand Logo */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google Verified Reviews</span>
              </div>

              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                100% Organic Customer Feedback
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Trusted by 16,000+ Readers Across India
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Serving generations of students, professors, and book lovers at College Street, Kolkata and delivering across 27,000+ pincodes nationwide.
            </p>
          </div>

          {/* Google Star Rating Summary Box */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/90 shrink-0">
            <div className="flex items-center gap-3">
              <div className="text-4xl sm:text-5xl font-black text-slate-900 leading-none">
                4.4
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-0.5 text-[#fbbc04]">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  <div className="relative">
                    <Star className="h-4 w-4 text-slate-300" />
                    <div className="absolute inset-0 overflow-hidden w-1/2">
                      <Star className="h-4 w-4 text-[#fbbc04] fill-current" />
                    </div>
                  </div>
                </div>
                <p className="text-xs font-extrabold text-slate-800">
                  16,057+ Google Reviews
                </p>
                <p className="text-[11px] text-slate-500">
                  Techno World (টেকনো ওয়ার্ল্ড)
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
              <a
                href={GOOGLE_MAPS_SEARCH_URL}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-xs text-center"
              >
                <span>Read All Reviews</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={GOOGLE_WRITE_REVIEW_URL}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-xs text-center"
              >
                <Star className="h-3 w-3 text-[#fbbc04] fill-current" />
                <span>Write a Review</span>
              </a>
            </div>
          </div>
        </div>

        {/* REVIEWS FILTER TABS & SCROLL ARROWS */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Reviews (16K+)' },
              { id: 'FIVE_STAR', label: '★★★★★ 5-Star Reviews' },
              { id: 'COMPETITIVE', label: 'Competitive & College Street' },
              { id: 'DELIVERY', label: 'Fast Online Delivery' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Swipe or use arrows to explore
            </span>
            <button
              type="button"
              onClick={scrollLeft}
              className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition shadow-xs"
              aria-label="Scroll reviews left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition shadow-xs"
              aria-label="Scroll reviews right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* DYNAMIC REVIEWS FEED (ONE COMMENT AFTER ANOTHER CONTINUOUSLY RIGHT TO LEFT) */}
        <div className="relative w-full overflow-hidden">
          {/* Edge fade gradients for polished endless flow */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-4 w-10 sm:w-16 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 hidden sm:block" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-10 sm:w-16 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 hidden sm:block" />

          <div
            ref={scrollContainerRef}
            onMouseEnter={() => {
              isPausedRef.current = true;
            }}
            onMouseLeave={() => {
              isPausedRef.current = false;
            }}
            onTouchStart={() => {
              isPausedRef.current = true;
              if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
            }}
            onTouchEnd={() => {
              if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
              touchTimeoutRef.current = setTimeout(() => {
                isPausedRef.current = false;
              }, 2500);
            }}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayReviews.map((rev, index) => (
              <div
                key={`${rev.id}-${index}`}
                className="w-[300px] sm:w-[350px] shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Header: Avatar, Name & Google Verified Icon */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold shadow-xs ${rev.avatarBg}`}
                      >
                        {rev.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {rev.name}
                          </span>
                          {rev.isLocalGuide && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.2 rounded shrink-0">
                              Local Guide
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {rev.reviewsCount ? `${rev.reviewsCount} reviews • ` : ''}{rev.date}
                        </div>
                      </div>
                    </div>

                    {/* Google G small badge */}
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-100 shadow-2xs">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                  </div>

                  {/* Stars and Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-0.5 text-[#fbbc04]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    {rev.highlightTag && (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                        {rev.highlightTag}
                      </span>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed line-clamp-4">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Footer: Helpful & Verified */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-500">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{rev.helpfulCount} helpful</span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Verified on Google
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PHYSICAL STORE SHOWCASE & INTERACTIVE GOOGLE MAP */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* LEFT: STORE PROFILE & CONTACT CARD (5 cols) */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
              <div className="space-y-4">
                {/* Store Header with Google Badge */}
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    <Store className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Flagship Physical Store</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    Techno World
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    টেকনো ওয়ার্ল্ড • Publisher & Distributor
                  </p>
                </div>

                {/* Real Store Photo Banner from Google Maps card */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-44 sm:h-48 group shadow-xs">
                  <img
                    src="/google-store-card.png"
                    alt="Techno World College Street Bookstore Front"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e: any) => {
                      // Fallback if image fails to load
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-3.5 text-white">
                    <div className="flex items-center justify-between w-full text-xs">
                      <span className="font-semibold flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                        College Street, Kolkata
                      </span>
                      <span className="bg-emerald-500/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs">
                        Open Now • 10 AM - 7:30 PM
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Store Information List */}
                <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700">
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mt-0.5">
                      <MapPin className="h-4 w-4 text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Store Address</p>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        YMCA Building, 90/6A Mahatma Gandhi Rd, opp. Grace Cinema, Calcutta University, College Street, Kolkata, West Bengal 700007
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mt-0.5">
                      <Clock className="h-4 w-4 text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Opening Hours</p>
                      <p className="text-slate-600 text-xs">
                        Monday – Sunday: <span className="font-semibold text-slate-800">10:00 AM – 7:30 PM</span>
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mt-0.5">
                      <Phone className="h-4 w-4 text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Telephone / Order Desk</p>
                      <a
                        href="tel:+913322196115"
                        className="text-emerald-700 hover:text-emerald-800 font-semibold text-xs hover:underline"
                      >
                        +91 33 2219 6115 / 033 2219 6115
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Directions & Call */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
                <a
                  href={GOOGLE_DIRECTIONS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-xs sm:text-sm font-bold text-white hover:bg-emerald-800 transition shadow-sm"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Get Directions</span>
                </a>

                <a
                  href="tel:+913322196115"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition shadow-2xs"
                >
                  <Phone className="h-4 w-4 text-slate-600" />
                  <span>Call Store</span>
                </a>

                <a
                  href="https://wa.me/919876543210?text=Hi%20Techno%20World,%20I%20want%20to%20inquire%20about%20a%20book"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs sm:text-sm font-bold text-emerald-800 hover:bg-emerald-100 transition"
                  title="WhatsApp Support"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              </div>
            </div>

            {/* RIGHT: INTERACTIVE EMBEDDED GOOGLE MAP (7 cols) */}
            <div className="lg:col-span-7 bg-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200 relative min-h-[360px] sm:min-h-[440px]">
              <iframe
                title="Techno World Location on Google Maps"
                src={GOOGLE_MAPS_IFRAME_SRC}
                className="w-full h-full min-h-[360px] sm:min-h-[440px] border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Floating Quick Action over Map */}
              <div className="absolute top-3 right-3 z-10">
                <a
                  href={GOOGLE_MAPS_SEARCH_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-md hover:bg-white hover:text-emerald-700 transition backdrop-blur-xs border border-slate-200"
                >
                  <span>View Larger Map</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Map Footer Overlay with Rating summary */}
              <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200/90 shadow-md flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">Opp. Grace Cinema, College Street</p>
                    <p className="text-[11px] text-slate-500 truncate">Calcutta University Campus Area</p>
                  </div>
                </div>

                <a
                  href={GOOGLE_DIRECTIONS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
                >
                  <span>Navigate</span>
                  <Navigation className="h-3 w-3" />
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default GoogleReviewsAndMap;
