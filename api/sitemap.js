// api/sitemap.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'sitemap.xml');
    const xml = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).send('Sitemap not found');
  }
}
