/**
 * SEO Utilities for ShopEasy
 * Handles dynamic meta tag updates for better search engine optimization and social media sharing
 */

// Default SEO configuration for ShopEasy
export const DEFAULT_SEO = {
  siteName: 'ShopEasy',
  defaultTitle: 'ShopEasy - Your Ultimate Online Shopping Destination',
  titleTemplate: '%s | ShopEasy',
  description: 'ShopEasy - Your ultimate destination for online shopping. Discover amazing deals, quality products, and seamless shopping experience. Shop electronics, fashion, home goods, and more with fast delivery and secure checkout.',
  keywords: 'online shopping, ecommerce, electronics, fashion, home goods, deals, fast delivery, secure shopping, ShopEasy',
  author: 'ShopEasy Team',
  url: 'https://shopeasy.com',
  image: '/og-image.jpg',
  twitterImage: '/twitter-image.jpg',
  twitterHandle: '@shopeasy',
  themeColor: '#3B82F6',
  locale: 'en_US'
};

// SEO configurations for different pages
export const PAGE_SEO_CONFIG = {
  home: {
    title: 'ShopEasy - Your Ultimate Online Shopping Destination',
    description: 'Discover amazing deals on electronics, fashion, home goods, and more. Fast delivery, secure checkout, and excellent customer service at ShopEasy.',
    keywords: 'online shopping, ecommerce, best deals, electronics, fashion, home goods, ShopEasy',
    path: '/'
  },
  products: {
    title: 'All Products - ShopEasy',
    description: 'Browse our extensive collection of quality products. From electronics to fashion, find everything you need at ShopEasy with great prices and fast delivery.',
    keywords: 'products, shopping, electronics, fashion, home goods, deals, ShopEasy',
    path: '/products'
  },
  categories: {
    title: 'Categories - ShopEasy',
    description: 'Explore our product categories. Shop by category to find exactly what you need - electronics, fashion, home goods, and more at ShopEasy.',
    keywords: 'categories, product categories, electronics, fashion, home goods, ShopEasy',
    path: '/categories'
  },
  cart: {
    title: 'Shopping Cart - ShopEasy',
    description: 'Review your selected items and proceed to checkout. Secure payment options and fast delivery available at ShopEasy.',
    keywords: 'shopping cart, checkout, secure payment, ShopEasy',
    path: '/cart'
  },
  wishlist: {
    title: 'Wishlist - ShopEasy',
    description: 'Save your favorite items for later. Keep track of products you love and get notified of price drops at ShopEasy.',
    keywords: 'wishlist, favorites, saved items, ShopEasy',
    path: '/wishlist'
  },
  orders: {
    title: 'My Orders - ShopEasy',
    description: 'Track your orders and view order history. Stay updated on delivery status and manage your purchases at ShopEasy.',
    keywords: 'orders, order history, order tracking, my orders, ShopEasy',
    path: '/orders'
  },
  profile: {
    title: 'My Profile - ShopEasy',
    description: 'Manage your account settings, addresses, and preferences. Update your profile information at ShopEasy.',
    keywords: 'profile, account settings, user profile, ShopEasy',
    path: '/profile'
  },
  login: {
    title: 'Login - ShopEasy',
    description: 'Sign in to your ShopEasy account to access your orders, wishlist, and personalized shopping experience.',
    keywords: 'login, sign in, account access, ShopEasy',
    path: '/login'
  },
  register: {
    title: 'Create Account - ShopEasy',
    description: 'Join ShopEasy today! Create your account to enjoy personalized shopping, order tracking, and exclusive deals.',
    keywords: 'register, sign up, create account, join, ShopEasy',
    path: '/register'
  }
};

/**
 * Updates the page title
 * @param {string} title - The page title
 * @param {boolean} useTemplate - Whether to use the title template
 */
export const updateTitle = (title, useTemplate = true) => {
  if (typeof document === 'undefined') return;
  
  const finalTitle = useTemplate && title !== DEFAULT_SEO.defaultTitle
    ? DEFAULT_SEO.titleTemplate.replace('%s', title)
    : title || DEFAULT_SEO.defaultTitle;
  
  document.title = finalTitle;
};

/**
 * Updates or creates a meta tag
 * @param {string} name - The name or property attribute
 * @param {string} content - The content value
 * @param {string} attribute - The attribute type ('name' or 'property')
 */
export const updateMetaTag = (name, content, attribute = 'name') => {
  if (typeof document === 'undefined') return;
  
  let meta = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
};

/**
 * Updates the canonical URL
 * @param {string} url - The canonical URL
 */
export const updateCanonicalUrl = (url) => {
  if (typeof document === 'undefined') return;
  
  let canonical = document.querySelector('link[rel="canonical"]');
  
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  
  canonical.setAttribute('href', url);
};

/**
 * Updates all SEO meta tags for a page
 * @param {Object} seoData - The SEO data for the page
 */
export const updateSEO = (seoData = {}) => {
  const {
    title = DEFAULT_SEO.defaultTitle,
    description = DEFAULT_SEO.description,
    keywords = DEFAULT_SEO.keywords,
    image = DEFAULT_SEO.image,
    url = DEFAULT_SEO.url,
    type = 'website',
    useTemplate = true
  } = seoData;

  // Update title
  updateTitle(title, useTemplate);

  // Update basic meta tags
  updateMetaTag('description', description);
  updateMetaTag('keywords', keywords);

  // Update Open Graph tags
  updateMetaTag('og:title', useTemplate && title !== DEFAULT_SEO.defaultTitle 
    ? DEFAULT_SEO.titleTemplate.replace('%s', title) 
    : title, 'property');
  updateMetaTag('og:description', description, 'property');
  updateMetaTag('og:image', image, 'property');
  updateMetaTag('og:url', url, 'property');
  updateMetaTag('og:type', type, 'property');
  updateMetaTag('og:site_name', DEFAULT_SEO.siteName, 'property');

  // Update Twitter Card tags
  updateMetaTag('twitter:title', useTemplate && title !== DEFAULT_SEO.defaultTitle 
    ? DEFAULT_SEO.titleTemplate.replace('%s', title) 
    : title);
  updateMetaTag('twitter:description', description);
  updateMetaTag('twitter:image', seoData.twitterImage || DEFAULT_SEO.twitterImage);

  // Update canonical URL
  updateCanonicalUrl(url);
};

/**
 * Gets SEO data for a specific page
 * @param {string} pageName - The page name
 * @param {Object} additionalData - Additional SEO data to merge
 * @returns {Object} The complete SEO data
 */
export const getPageSEO = (pageName, additionalData = {}) => {
  const pageConfig = PAGE_SEO_CONFIG[pageName] || {};
  
  return {
    ...pageConfig,
    url: `${DEFAULT_SEO.url}${pageConfig.path || ''}`,
    image: DEFAULT_SEO.image,
    twitterImage: DEFAULT_SEO.twitterImage,
    ...additionalData
  };
};

/**
 * Updates SEO for product pages
 * @param {Object} product - The product data
 */
export const updateProductSEO = (product) => {
  if (!product) return;
  
  const seoData = {
    title: `${product.name} - Buy Online at ShopEasy`,
    description: `${product.name} - ${product.description?.substring(0, 150) || 'Available at ShopEasy'}. ${product.price ? `Starting at $${product.price}` : ''} with fast delivery and secure checkout.`,
    keywords: `${product.name}, ${product.category || ''}, buy online, ShopEasy, ${DEFAULT_SEO.keywords}`,
    image: product.image || product.images?.[0] || DEFAULT_SEO.image,
    url: `${DEFAULT_SEO.url}/product/${product.id || product._id}`,
    type: 'product'
  };
  
  updateSEO(seoData);
  
  // Add product-specific structured data
  addProductStructuredData(product);
};

/**
 * Updates SEO for category pages
 * @param {Object} category - The category data
 */
export const updateCategorySEO = (category) => {
  if (!category) return;
  
  const seoData = {
    title: `${category.name} - ShopEasy`,
    description: `Shop ${category.name} at ShopEasy. ${category.description || `Discover the best ${category.name.toLowerCase()} products`} with great prices and fast delivery.`,
    keywords: `${category.name}, ${category.name.toLowerCase()}, shop ${category.name.toLowerCase()}, ShopEasy`,
    url: `${DEFAULT_SEO.url}/category/${category.slug || category.id}`,
    type: 'website'
  };
  
  updateSEO(seoData);
};

/**
 * Adds structured data (JSON-LD) to the page
 * @param {Object} structuredData - The structured data object
 */
export const addStructuredData = (structuredData) => {
  if (typeof document === 'undefined') return;
  
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
};

/**
 * Adds product structured data
 * @param {Object} product - The product data
 */
export const addProductStructuredData = (product) => {
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image || product.images,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "ShopEasy"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "ShopEasy"
      }
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount || 1
    } : undefined
  };
  
  addStructuredData(structuredData);
};

/**
 * Adds organization structured data
 */
export const addOrganizationStructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ShopEasy",
    "url": "https://shopeasy.com",
    "logo": "https://shopeasy.com/logo.png",
    "description": "ShopEasy - Your ultimate destination for online shopping. Discover amazing deals, quality products, and seamless shopping experience.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-SHOPEASY",
      "contactType": "Customer Service"
    },
    "sameAs": [
      "https://facebook.com/shopeasy",
      "https://twitter.com/shopeasy",
      "https://instagram.com/shopeasy"
    ]
  };
  
  addStructuredData(structuredData);
};

export default {
  DEFAULT_SEO,
  PAGE_SEO_CONFIG,
  updateTitle,
  updateMetaTag,
  updateCanonicalUrl,
  updateSEO,
  getPageSEO,
  updateProductSEO,
  updateCategorySEO,
  addStructuredData,
  addProductStructuredData,
  addOrganizationStructuredData
};
