import api from './api';

// Product API endpoints
const productService = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });

    const queryString = searchParams.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    
    return await api.get(url);
  },

  // Get single product by ID
  getProduct: async (id) => {
    return await api.get(`/products/${id}`);
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    return await api.get(`/products/featured?limit=${limit}`);
  },

  // Get products by category
  getProductsByCategory: async (category, params = {}) => {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const url = queryString 
      ? `/products/category/${category}?${queryString}` 
      : `/products/category/${category}`;
    
    return await api.get(url);
  },

  // Get all categories
  getCategories: async () => {
    return await api.get('/products/categories');
  },

  // Search products
  searchProducts: async (query, filters = {}) => {
    const params = { q: query, ...filters };
    return await productService.getProducts(params);
  },

  // Create product (Admin only)
  createProduct: async (productData) => {
    return await api.post('/products', productData);
  },

  // Update product (Admin/Owner only)
  updateProduct: async (id, productData) => {
    return await api.put(`/products/${id}`, productData);
  },

  // Delete product (Admin/Owner only)
  deleteProduct: async (id) => {
    return await api.delete(`/products/${id}`);
  },

  // Add product review
  addReview: async (productId, reviewData) => {
    return await api.post(`/products/${productId}/reviews`, reviewData);
  },

  // Get product reviews
  getReviews: async (productId, params = {}) => {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const url = queryString 
      ? `/products/${productId}/reviews?${queryString}` 
      : `/products/${productId}/reviews`;
    
    return await api.get(url);
  },

  // Delete review (Admin/Owner only)
  deleteReview: async (productId, reviewId) => {
    return await api.delete(`/products/${productId}/reviews/${reviewId}`);
  },

  // Get product filters for UI
  getFilters: async () => {
    try {
      const [categoriesResponse] = await Promise.all([
        productService.getCategories()
      ]);

      return {
        categories: categoriesResponse.categories || [],
        priceRanges: [
          { label: 'Under $25', min: 0, max: 25 },
          { label: '$25 - $50', min: 25, max: 50 },
          { label: '$50 - $100', min: 50, max: 100 },
          { label: '$100 - $200', min: 100, max: 200 },
          { label: 'Over $200', min: 200, max: null }
        ],
        sortOptions: [
          { value: 'createdAt', label: 'Newest', order: 'desc' },
          { value: 'price', label: 'Price: Low to High', order: 'asc' },
          { value: 'price', label: 'Price: High to Low', order: 'desc' },
          { value: 'name', label: 'Name: A to Z', order: 'asc' },
          { value: 'name', label: 'Name: Z to A', order: 'desc' },
          { value: 'rating', label: 'Highest Rated', order: 'desc' }
        ]
      };
    } catch (error) {
      console.error('Error fetching filters:', error);
      return {
        categories: [],
        priceRanges: [],
        sortOptions: []
      };
    }
  }
};

export default productService;
