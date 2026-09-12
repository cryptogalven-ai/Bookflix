module.exports = async (req, res) => {
  try {
    const q = String(req.query?.q || '').trim();
    if (!q) return res.status(400).json({ error: 'Missing q' });
    const u = new URL('https://openlibrary.org/search.json');
    u.searchParams.set('q', q);
    u.searchParams.set('lang', 'fr');
    u.searchParams.set('limit', String(Math.min(50, Math.max(1, Number(req.query?.limit) || 24))));
    u.searchParams.set('fields', String(req.query?.fields || 'key,title,author_name,cover_i,subject,first_publish_year,edition_count,language'));
    const upstream = await fetch(u, {
      headers: { 'User-Agent': 'Bookflix/1.0 (bookflix@vercel.app)' }
    });
    const body = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.send(body);
  } catch (e) {
    return res.status(502).json({ error: 'Open Library unavailable' });
  }
};
