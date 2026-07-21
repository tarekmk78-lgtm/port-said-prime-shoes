import { useEffect } from 'react';

interface SEOOptions {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
}

const SITE_NAME = 'Port Said Prime Shoes';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1460353581641-37baddab0f0f?q=80&w=1200';
const SITE_URL = 'https://clarksportsaid.com';

function setMetaByName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setMetaByProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Updates document.title and the relevant <meta>/<link> tags for the current route.
 * No external dependency (e.g. react-helmet) — this app doesn't do SSR, so plain
 * DOM mutation on mount/update is sufficient and keeps the bundle smaller.
 */
export function useSEO(options: SEOOptions) {
  useEffect(() => {
    const fullTitle = options.title ? `${options.title} | ${SITE_NAME}` : SITE_NAME;
    const image = options.image || DEFAULT_IMAGE;
    const url = options.url ? `${SITE_URL}${options.url}` : SITE_URL;

    document.title = fullTitle;

    setMetaByName('description', options.description);
    setMetaByName('robots', options.noindex ? 'noindex, nofollow' : 'index, follow');

    setMetaByProperty('og:title', fullTitle);
    setMetaByProperty('og:description', options.description);
    setMetaByProperty('og:image', image);
    setMetaByProperty('og:url', url);
    setMetaByProperty('og:type', options.type || 'website');
    setMetaByProperty('og:site_name', SITE_NAME);

    setMetaByName('twitter:card', 'summary_large_image');
    setMetaByName('twitter:title', fullTitle);
    setMetaByName('twitter:description', options.description);
    setMetaByName('twitter:image', image);

    setCanonical(url);
  }, [options.title, options.description, options.image, options.url, options.type, options.noindex]);
}

/**
 * Injects one or more JSON-LD <script type="application/ld+json"> tags into <head>
 * for structured data (schema.org). Cleans up on unmount/update.
 */
export function useJsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  useEffect(() => {
    const items = Array.isArray(data) ? data : [data];
    const tags = items.map((item) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(item);
      document.head.appendChild(script);
      return script;
    });

    return () => {
      tags.forEach((tag) => tag.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)]);
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    sameAs: [],
  };
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/shop?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildProductSchema(product: {
  name: string;
  description: string;
  images?: string[];
  price: number;
  sku: string;
  rating?: number;
  reviews_count?: number;
  stock_quantity?: number;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images || [],
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: 'EGP',
      price: product.price,
      availability:
        (product.stock_quantity ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
    ...(product.reviews_count && product.reviews_count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating || 0,
            reviewCount: product.reviews_count,
          },
        }
      : {}),
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
