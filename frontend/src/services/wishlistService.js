import api from './api';

// Wishlist API endpoints
const wishlistService = {
  // Get user's wishlist
  getWishlist: async () => {
    return await api.get('/wishlist');
  },

  // Add product to wishlist
  addToWishlist: async (productId) => {
    return await api.post(`/wishlist/${productId}`);
  },

  // Remove product from wishlist
  removeFromWishlist: async (productId) => {
    return await api.delete(`/wishlist/${productId}`);
  },

  // Check if product is in wishlist
  checkInWishlist: async (productId) => {
    return await api.get(`/wishlist/check/${productId}`);
  },

  // Get wishlist count
  getWishlistCount: async () => {
    return await api.get('/wishlist/count');
  },

  // Clear entire wishlist
  clearWishlist: async () => {
    return await api.delete('/wishlist');
  },

  // Move wishlist items to cart
  moveToCart: async (productIds) => {
    return await api.post('/wishlist/move-to-cart', { productIds });
  },

  // Toggle product in wishlist (add if not present, remove if present)
  toggleWishlist: async (productId) => {
    try {
      const checkResponse = await wishlistService.checkInWishlist(productId);
      
      if (checkResponse.inWishlist) {
        // Product is in wishlist, remove it
        return await wishlistService.removeFromWishlist(productId);
      } else {
        // Product is not in wishlist, add it
        return await wishlistService.addToWishlist(productId);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      throw error;
    }
  },

  // Get multiple products' wishlist status
  checkMultipleInWishlist: async (productIds) => {
    try {
      const promises = productIds.map(id => wishlistService.checkInWishlist(id));
      const results = await Promise.all(promises);
      
      const statusMap = {};
      productIds.forEach((id, index) => {
        statusMap[id] = results[index].inWishlist;
      });
      
      return statusMap;
    } catch (error) {
      console.error('Error checking multiple products in wishlist:', error);
      throw error;
    }
  },

  // Move single product to cart
  moveSingleToCart: async (productId) => {
    return await wishlistService.moveToCart([productId]);
  },

  // Move all wishlist items to cart
  moveAllToCart: async () => {
    try {
      const wishlistResponse = await wishlistService.getWishlist();
      const productIds = wishlistResponse.data.products.map(item => item.product._id);
      
      if (productIds.length === 0) {
        throw new Error('No items in wishlist to move');
      }
      
      return await wishlistService.moveToCart(productIds);
    } catch (error) {
      console.error('Error moving all items to cart:', error);
      throw error;
    }
  }
};

export default wishlistService;
