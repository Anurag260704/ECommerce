/**
 * Image utility functions for handling image URLs in the application
 */

/**
 * Constructs a full image URL from a potentially relative path
 * @param {string} imagePath - The image path from API or local
 * @param {string} fallback - Fallback image path
 * @returns {string} - Full image URL
 */
export const getImageUrl = (imagePath, fallback = '/placeholder-product.jpg') => {
  if (!imagePath) return fallback;
  
  // Handle case where imagePath is an object (e.g., {url: '...', alt: '...'})
  if (typeof imagePath === 'object' && imagePath.url) {
    imagePath = imagePath.url;
  }
  
  // Ensure imagePath is a string
  if (typeof imagePath !== 'string') {
    console.warn('Invalid image path type:', typeof imagePath, imagePath);
    return fallback;
  }
  
  // If it's already a full URL (starts with http), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a data URL (base64), return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // If it's already an absolute path starting with /, return as is (for public assets)
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the API base URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const cleanBaseUrl = baseUrl.replace('/api', ''); // Remove /api if present
  const cleanImagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${cleanBaseUrl}${cleanImagePath}`;
};

/**
 * Preloads an image to check if it exists
 * @param {string} src - Image source URL
 * @returns {Promise<boolean>} - Promise that resolves to true if image loads
 */
export const preloadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
};

/**
 * Gets optimized image URL with size parameters if supported
 * @param {string} imagePath - Original image path
 * @param {object} options - Options for image optimization
 * @param {number} options.width - Desired width
 * @param {number} options.height - Desired height
 * @param {string} options.quality - Image quality (low, medium, high)
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (imagePath, options = {}) => {
  const baseUrl = getImageUrl(imagePath);
  
  // If it's a local asset or external URL, return as is
  if (baseUrl.startsWith('/') || !baseUrl.startsWith(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')) {
    return baseUrl;
  }
  
  // Add query parameters for optimization (if your backend supports it)
  const params = new URLSearchParams();
  if (options.width) params.append('w', options.width);
  if (options.height) params.append('h', options.height);
  if (options.quality) params.append('q', options.quality);
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * Creates a placeholder image data URL
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} text - Text to display (optional)
 * @returns {string} - Data URL for placeholder image
 */
export const createPlaceholder = (width = 400, height = 400, text = 'No Image') => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, width, height);
  
  // Text
  ctx.fillStyle = '#9ca3af';
  ctx.font = `${Math.min(width, height) / 10}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  return canvas.toDataURL();
};
