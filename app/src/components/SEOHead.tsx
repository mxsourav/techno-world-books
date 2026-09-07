import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'product' | 'article' | 'book';
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  /** Additional meta tags */
  meta?: Array<{ name?: string; property?: string; content: string }>;
}

const SITE_NAME = 'Techno World Books';
const SITE_URL = 'https://technoworldbooks.in';
const DEFAULT_OG_IMAGE = `${SITE_URL}/techno_world.png`;

/**
 * SEOHead — Dynamically manages <head> meta tags for SEO.
 *
 * Sets: document.title, meta description, canonical URL,
 * Open Graph tags, Twitter Card tags, and JSON-LD structured data.
 *
 * Uses direct DOM manipulation via useEffect (no react-helmet needed).
 * Each tag is identified by a data attribute to avoid duplicates.
 */
export default function SEOHead({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  ogImageAlt,
  noIndex = false,
  structuredData,
  meta,
}: SEOHeadProps) {
  useEffect(() => {
    // --- Title ---
    document.title = title;

    // --- Helper to set/create a <meta> tag ---
    const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // --- Description ---
    setMeta('name', 'description', description);

    // --- Robots ---
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // --- Canonical URL ---
    const fullCanonical = canonicalUrl
      ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${SITE_URL}${canonicalUrl}`)
      : SITE_URL;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullCanonical);

    // --- Open Graph ---
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:url', fullCanonical);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:image', ogImage || DEFAULT_OG_IMAGE);
    if (ogImageAlt || title) {
      setMeta('property', 'og:image:alt', ogImageAlt || title);
    }

    // --- Twitter Card ---
    setMeta('name', 'twitter:card', ogImage ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage || DEFAULT_OG_IMAGE);

    // --- Additional custom meta ---
    if (meta) {
      for (const m of meta) {
        if (m.property) setMeta('property', m.property, m.content);
        else if (m.name) setMeta('name', m.name, m.content);
      }
    }

    // --- JSON-LD Structured Data ---
    // Remove any previously injected SEO JSON-LD (keep the static BookStore one from index.html)
    const existingLd = document.querySelector('script[data-seo-jsonld]');
    if (existingLd) existingLd.remove();

    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      script.textContent = JSON.stringify(
        Array.isArray(structuredData) ? structuredData : structuredData
      );
      document.head.appendChild(script);
    }

    // Cleanup: remove dynamic JSON-LD on unmount
    return () => {
      const ld = document.querySelector('script[data-seo-jsonld]');
      if (ld) ld.remove();
    };
  }, [title, description, canonicalUrl, ogType, ogImage, ogImageAlt, noIndex, structuredData, meta]);

  return null; // This component renders nothing — it only manipulates <head>
}

/**
 * Build a schema.org/Book JSON-LD object from book data.
 */
export function buildBookJsonLd(book: {
  title: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  price: number;
  mrp?: number;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  thumbnail?: string;
  slug: string;
  description?: string;
  language?: string;
  edition?: string;
  pubDate?: string;
  pages?: number;
}) {
  const offers: Record<string, unknown> = {
    '@type': 'Offer',
    price: book.price.toString(),
    priceCurrency: 'INR',
    availability: (book.stock ?? 1) > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'Organization',
      name: 'Techno World Books',
      url: SITE_URL,
    },
    url: `${SITE_URL}/book/${book.slug}`,
  };

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    url: `${SITE_URL}/book/${book.slug}`,
    offers,
  };

  if (book.author) {
    jsonLd.author = { '@type': 'Person', name: book.author };
  }
  if (book.isbn) {
    jsonLd.isbn = book.isbn;
  }
  if (book.publisher) {
    jsonLd.publisher = { '@type': 'Organization', name: book.publisher };
  }
  if (book.thumbnail) {
    jsonLd.image = book.thumbnail;
  }
  if (book.description) {
    jsonLd.description = book.description.slice(0, 500);
  }
  if (book.language) {
    jsonLd.inLanguage = book.language;
  }
  if (book.edition) {
    jsonLd.bookEdition = book.edition;
  }
  if (book.pages) {
    jsonLd.numberOfPages = book.pages;
  }
  if (book.pubDate) {
    jsonLd.datePublished = book.pubDate;
  }
  if (book.rating && book.reviewCount && book.reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: book.rating.toFixed(1),
      reviewCount: book.reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return jsonLd;
}

/**
 * Build a schema.org/WebSite JSON-LD with SearchAction (for Google Sitelinks Search Box).
 */
export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
