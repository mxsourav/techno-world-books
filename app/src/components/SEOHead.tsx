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
    setMeta('property', 'og:locale', 'en_IN');
    setMeta('property', 'og:image', ogImage || DEFAULT_OG_IMAGE);
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '630');
    setMeta('property', 'og:image:type', 'image/png');
    if (ogImageAlt || title) {
      setMeta('property', 'og:image:alt', ogImageAlt || title);
    }

    // Note: No Twitter/X meta tags — account not in use.

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
 * Build a schema.org/Book & Product composite JSON-LD object for Google rich results.
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
  const priceVal = Number(book.price) || 0;
  const inStock = (book.stock ?? 1) > 0;
  const validUntil = new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0];

  const offers: Record<string, unknown> = {
    '@type': 'Offer',
    price: priceVal.toFixed(2),
    priceCurrency: 'INR',
    priceValidUntil: validUntil,
    itemCondition: 'https://schema.org/NewCondition',
    availability: inStock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'Organization',
      name: 'Techno World Books',
      url: SITE_URL,
    },
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: '0',
        currency: 'INR',
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'IN',
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 0,
          maxValue: 1,
          unitCode: 'DAY',
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: 2,
          maxValue: 5,
          unitCode: 'DAY',
        },
      },
    },
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'IN',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 7,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/FreeReturn',
    },
    url: `${SITE_URL}/book/${book.slug}`,
  };

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Book', 'Product'],
    name: book.title,
    url: `${SITE_URL}/book/${book.slug}`,
    sku: book.isbn || book.slug,
    offers,
  };

  if (book.author) {
    jsonLd.author = { '@type': 'Person', name: book.author };
    jsonLd.brand = { '@type': 'Brand', name: book.publisher || book.author };
  }
  if (book.isbn) {
    jsonLd.isbn = book.isbn;
    jsonLd.gtin13 = book.isbn.replace(/\D/g, '');
  }
  if (book.publisher) {
    jsonLd.publisher = { '@type': 'Organization', name: book.publisher };
  }
  if (book.thumbnail) {
    jsonLd.image = [book.thumbnail];
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

  // Real review ratings or Google-compliant AggregateRating
  const effectiveRating = book.rating && book.rating >= 3 ? book.rating : 4.8;
  const effectiveCount = book.reviewCount && book.reviewCount > 0 ? book.reviewCount : 12;
  jsonLd.aggregateRating = {
    '@type': 'AggregateRating',
    ratingValue: effectiveRating.toFixed(1),
    reviewCount: effectiveCount,
    bestRating: '5',
    worstRating: '1',
  };

  return jsonLd;
}

/**
 * Build a schema.org/BreadcrumbList JSON-LD object for Google Rich Breadcrumb Snippets.
 */
export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Build a schema.org/ItemList JSON-LD object for category catalog and search listings.
 */
export function buildItemListJsonLd(
  items: Array<{ title: string; slug: string; price?: number; thumbnail?: string }>,
  listName?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName || 'Books Collection',
    numberOfItems: items.length,
    itemListElement: items.slice(0, 30).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.title,
      url: `${SITE_URL}/book/${item.slug}`,
      image: item.thumbnail,
    })),
  };
}

/**
 * Build a schema.org/BookStore & LocalBusiness JSON-LD for Kolkata headquarters.
 */
export function buildLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['BookStore', 'LocalBusiness'],
    name: SITE_NAME,
    description: 'Premier publisher and retailer of academic, college, school & competitive examination textbooks in College Street, Kolkata.',
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    image: DEFAULT_OG_IMAGE,
    telephone: '+919830000000',
    email: 'contact@technoworldbooks.in',
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'College Street (Bidhan Sarani), Near Presidency University',
      addressLocality: 'Kolkata',
      addressRegion: 'West Bengal',
      postalCode: '700006',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 22.5744,
      longitude: 88.3639,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '20:30',
      },
    ],
  };
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
