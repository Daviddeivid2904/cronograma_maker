// /api/sitemap.ts

type Route = { url: string; priority?: number; changefreq?: 'daily'|'weekly'|'monthly'|'yearly' };

const BASE = 'https://myweekly.online';

const routes: Route[] = [
  { url: 'es',            priority: 1.0, changefreq: 'weekly' },
  { url: 'es/privacy',    priority: 0.8, changefreq: 'monthly' },
  { url: 'es/terms',      priority: 0.8, changefreq: 'monthly' },
  { url: 'es/faq',        priority: 0.7, changefreq: 'monthly' },
  { url: 'es/history',    priority: 0.7, changefreq: 'monthly' },
  { url: 'es/how-to-use', priority: 0.7, changefreq: 'monthly' },
];

const lastmod = new Date().toISOString().slice(0, 10);

export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    routes.map(({ url, priority = 0.5, changefreq = 'monthly' }) => `
      <url>
        <loc>${BASE}/${url.replace(/^\/+/, '')}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>${changefreq}</changefreq>
        <priority>${priority.toFixed(1)}</priority>
      </url>`).join('') +
    `</urlset>`;

  res.status(200).send(body.trim());
}
