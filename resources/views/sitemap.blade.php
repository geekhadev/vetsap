<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://vetsap.app/</loc>
        <changefreq>monthly</changefreq>
        <priority>1.0</priority>
        <lastmod>{{ $updatedAt }}</lastmod>
    </url>
    @foreach($slugs as $slug)
    <url>
        <loc>https://vetsap.app/clinica/{{ $slug }}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
        <lastmod>{{ $updatedAt }}</lastmod>
    </url>
    @endforeach
</urlset>
