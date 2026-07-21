// Generates public/sitemap.xml from live Supabase data (products + categories)
// plus the static public pages. Run with: npm run generate-sitemap
//
// This reads VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY straight out of .env
// (no dotenv dependency needed) since this runs outside of Vite's import.meta.env.

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://clarksportsaid.com';

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  const env = {};
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env — skipping sitemap generation.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/shop', changefreq: 'daily', priority: '0.9' },
    { url: '/categories', changefreq: 'weekly', priority: '0.7' },
    { url: '/offers', changefreq: 'daily', priority: '0.8' },
    { url: '/about', changefreq: 'monthly', priority: '0.5' },
    { url: '/contact', changefreq: 'monthly', priority: '0.5' },
  ];

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true);

  if (productsError) {
    console.error('Failed to fetch products:', productsError.message);
  }

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('slug, created_at')
    .eq('is_active', true);

  if (categoriesError) {
    console.error('Failed to fetch categories:', categoriesError.message);
  }

  const urls = [
    ...staticPages.map((p) => ({ ...p, lastmod: new Date().toISOString().split('T')[0] })),
    ...(products || []).map((p) => ({
      url: `/product/${p.slug}`,
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: (p.updated_at || new Date().toISOString()).split('T')[0],
    })),
    ...(categories || []).map((c) => ({
      url: `/shop?category=${c.slug}`,
      changefreq: 'weekly',
      priority: '0.6',
      lastmod: (c.created_at || new Date().toISOString()).split('T')[0],
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${SITE_URL}${u.url}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), xml);
  console.log(`✓ sitemap.xml generated with ${urls.length} URLs (${(products || []).length} products, ${(categories || []).length} categories)`);
}

main().catch((err) => {
  console.error('Sitemap generation failed (continuing build anyway):', err.message);
});

