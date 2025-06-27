// src/routes/seo.js

const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const Bookmark = require('../models/Bookmark');
const config = require('../config');

// GET /sitemap.xml
router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const baseUrl = config.publicUrl;
    // Fetch public bookmarks and collections
    const [bookmarks, collections] = await Promise.all([
      Bookmark.find({ isPublic: true }, 'updatedAt'),
      Collection.find({ isPublic: true }, 'updatedAt')
    ]);

    const urls = [];
    // Homepage
    urls.push(
      `<url><loc>${baseUrl}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`
    );
    // Bookmarks
    bookmarks.forEach(b => {
      urls.push(
        `<url><loc>${baseUrl}/api/bookmarks/${b._id}</loc><lastmod>${b.updatedAt.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`
      );
    });
    // Collections
    collections.forEach(c => {
      urls.push(
        `<url><loc>${baseUrl}/api/collections/${c._id}</loc><lastmod>${c.updatedAt.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`
      );
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

// GET /robots.txt
router.get('/robots.txt', (req, res) => {
  const content = `User-agent: *
Allow: /

Sitemap: ${config.publicUrl}/sitemap.xml`;
  res.header('Content-Type', 'text/plain');
  res.send(content);
});

module.exports = router;