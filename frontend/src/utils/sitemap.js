/**
 * Sitemap Generator for ShopEasy
 * Generates XML sitemaps for better search engine indexing
 */

// Static pages configuration
const STATIC_PAGES = [
  {
    url: '/',
    priority: 1.0,
    changefreq: 'daily'
  },
  {
    url: '/products',
    priority: 0.9,
    changefreq: 'daily'
  },
  {
    url: '/categories',
    priority: 0.8,
    changefreq: 'weekly'
  }
];

/**
 * Generates sitemap XML content
 * @param {Array} pages - Array of page objects with url, priority, changefreq, lastmod
 * @param {string} baseUrl - Base URL of the site
 * @returns {string} XML sitemap content
 */
export const generateSitemap = (pages = STATIC_PAGES, baseUrl = 'https://shopeasy.com') => {
  const urls = pages.map(page => {
    const lastmod = page.lastmod || new Date().toISOString().split('T')[0];
    const priority = page.priority || 0.5;
    const changefreq = page.changefreq || 'monthly';
    
    return `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
};

/**
 * Generates sitemap with products
 * @param {Array} products - Array of product objects
 * @param {Array} categories - Array of category objects
 * @param {string} baseUrl - Base URL of the site
 * @returns {string} XML sitemap content
 */
export const generateFullSitemap = (products = [], categories = [], baseUrl = 'https://shopeasy.com') => {
  const allPages = [...STATIC_PAGES];

  // Add product pages
  products.forEach(product => {
    allPages.push({
      url: `/product/${product.id || product._id}`,
      priority: 0.7,
      changefreq: 'weekly',
      lastmod: product.updatedAt || product.createdAt
    });
  });

  // Add category pages
  categories.forEach(category => {
    allPages.push({
      url: `/category/${category.slug || category.id}`,
      priority: 0.8,
      changefreq: 'weekly',
      lastmod: category.updatedAt || category.createdAt
    });
  });

  return generateSitemap(allPages, baseUrl);
};

/**
 * Generates robots.txt content
 * @param {string} baseUrl - Base URL of the site
 * @returns {string} robots.txt content
 */
export const generateRobotsTxt = (baseUrl = 'https://shopeasy.com') => {
  return `# Robots.txt for ShopEasy
# Allow all search engines to crawl the site

User-agent: *
Allow: /
Allow: /products/
Allow: /categories/
Allow: /product/
Allow: /category/

# Disallow admin and user-specific pages
Disallow: /admin/
Disallow: /api/
Disallow: /login
Disallow: /register
Disallow: /profile
Disallow: /cart
Disallow: /checkout
Disallow: /orders
Disallow: /wishlist

# Disallow search and filter URLs with parameters
Disallow: /*?*
Disallow: /search?*
Disallow: /products?*

# Allow CSS and JS files for proper rendering
Allow: /assets/css/
Allow: /assets/js/
Allow: /assets/images/

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling (optional)
Crawl-delay: 1`;
};

/**
 * Downloads sitemap as XML file (for development/testing)
 * @param {string} content - XML sitemap content
 * @param {string} filename - Filename for the download
 */
export const downloadSitemap = (content, filename = 'sitemap.xml') => {
  const blob = new Blob([content], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Validates sitemap XML
 * @param {string} xmlContent - XML sitemap content
 * @returns {boolean} Whether the sitemap is valid
 */
export const validateSitemap = (xmlContent) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      console.error('Sitemap XML parsing error:', parserError[0].textContent);
      return false;
    }
    
    // Check for required elements
    const urlset = xmlDoc.getElementsByTagName('urlset')[0];
    if (!urlset) {
      console.error('Sitemap missing urlset element');
      return false;
    }
    
    const urls = xmlDoc.getElementsByTagName('url');
    if (urls.length === 0) {
      console.error('Sitemap contains no URLs');
      return false;
    }
    
    // Validate each URL entry
    for (let i = 0; i < urls.length; i++) {
      const loc = urls[i].getElementsByTagName('loc')[0];
      if (!loc || !loc.textContent) {
        console.error(`URL entry ${i + 1} missing loc element`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error validating sitemap:', error);
    return false;
  }
};

export default {
  generateSitemap,
  generateFullSitemap,
  generateRobotsTxt,
  downloadSitemap,
  validateSitemap,
  STATIC_PAGES
};
