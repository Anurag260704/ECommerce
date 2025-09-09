import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  updateSEO, 
  getPageSEO, 
  updateProductSEO, 
  updateCategorySEO,
  addOrganizationStructuredData 
} from '../utils/seo';

/**
 * Custom hook for managing SEO in React components
 * Automatically updates page SEO based on component props and route changes
 */
export const useSEO = (seoData = {}, dependencies = []) => {
  const location = useLocation();

  useEffect(() => {
    // If specific SEO data is provided, use it
    if (Object.keys(seoData).length > 0) {
      updateSEO(seoData);
      return;
    }

    // Otherwise, determine SEO data based on current route
    const pathname = location.pathname;
    let pageName = 'home';

    if (pathname.startsWith('/products')) {
      pageName = 'products';
    } else if (pathname.startsWith('/categories')) {
      pageName = 'categories';
    } else if (pathname.startsWith('/cart')) {
      pageName = 'cart';
    } else if (pathname.startsWith('/wishlist')) {
      pageName = 'wishlist';
    } else if (pathname.startsWith('/orders')) {
      pageName = 'orders';
    } else if (pathname.startsWith('/profile')) {
      pageName = 'profile';
    } else if (pathname.startsWith('/login')) {
      pageName = 'login';
    } else if (pathname.startsWith('/register')) {
      pageName = 'register';
    }

    const pageData = getPageSEO(pageName);
    updateSEO(pageData);
    
    // Add organization structured data on home page
    if (pageName === 'home') {
      addOrganizationStructuredData();
    }
  }, [location.pathname, ...dependencies]);

  return {
    updateSEO,
    updateProductSEO,
    updateCategorySEO
  };
};

/**
 * Hook specifically for product pages
 */
export const useProductSEO = (product) => {
  useEffect(() => {
    if (product) {
      updateProductSEO(product);
    }
  }, [product]);
};

/**
 * Hook specifically for category pages
 */
export const useCategorySEO = (category) => {
  useEffect(() => {
    if (category) {
      updateCategorySEO(category);
    }
  }, [category]);
};

/**
 * Hook for dynamic page SEO (e.g., search results)
 */
export const useDynamicSEO = (title, description, keywords, additionalData = {}) => {
  const location = useLocation();
  
  useEffect(() => {
    if (title || description) {
      const seoData = {
        title,
        description,
        keywords,
        url: `https://shopeasy.com${location.pathname}`,
        ...additionalData
      };
      updateSEO(seoData);
    }
  }, [title, description, keywords, location.pathname, additionalData]);
};

export default useSEO;
