import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITEMAP_PATH = path.resolve(__dirname, '../public/sitemap.xml');
const API_URL = process.env.VITE_API_URL ? process.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') : 'https://api.technoworldbooks.in';

async function syncSitemap() {
  try {
    console.log(`[syncSitemap] Fetching live sitemap from ${API_URL}/sitemap.xml...`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${API_URL}/sitemap.xml`, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const xml = await res.text();
      if (xml.includes('<urlset') && xml.includes('</urlset>')) {
        fs.writeFileSync(SITEMAP_PATH, xml, 'utf-8');
        console.log(`[syncSitemap] Successfully updated app/public/sitemap.xml (${xml.length} bytes)`);
        return;
      }
    }
    console.warn(`[syncSitemap] API returned status ${res.status}. Keeping existing sitemap.xml`);
  } catch (err) {
    console.warn(`[syncSitemap] Notice: Could not refresh sitemap from ${API_URL} (${err.message}). Using existing static sitemap.xml`);
  }
}

syncSitemap();
