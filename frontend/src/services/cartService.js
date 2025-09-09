import api from './api';

// Cart API endpoints
const cartService = {
  // Get user's cart
  getCart: async () => {
    return await api.get('/cart');
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    return await api.post('/cart/add', { productId, quantity });
  },

  // Update cart item quantity
  updateCartItem: async (productId, quantity) => {
    return await api.put(`/cart/update/${productId}`, { quantity });
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    return await api.delete(`/cart/remove/${productId}`);
  },

  // Clear entire cart
  clearCart: async () => {
    return await api.delete('/cart/clear');
  },

  // Get cart summary
  getCartSummary: async () => {
    return await api.get('/cart/summary');
  },

  // Validate cart items
  validateCart: async () => {
    return await api.post('/cart/validate');
  },

  // Move item to wishlist (placeholder for future implementation)
  moveToWishlist: async (productId) => {
    return await api.post(`/cart/move-to-wishlist/${productId}`);
  },

  // Local storage cart operations for offline support
  getLocalCart: () => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : { items: [], totalItems: 0, totalPrice: 0 };
  },

  setLocalCart: (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
  },

  addToLocalCart: (product, quantity = 1) => {
    const cart = cartService.getLocalCart();
    const existingItemIndex = cart.items.findIndex(item => item.product._id === product._id);

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product,
        quantity,
        price: product.discountPrice || product.price
      });
    }

    // Recalculate totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    cartService.setLocalCart(cart);
    return cart;
  },

  updateLocalCartItem: (productId, quantity) => {
    const cart = cartService.getLocalCart();
    const itemIndex = cart.items.findIndex(item => item.product._id === productId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }

      // Recalculate totals
      cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
      cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

      cartService.setLocalCart(cart);
    }

    return cart;
  },

  removeFromLocalCart: (productId) => {
    const cart = cartService.getLocalCart();
    cart.items = cart.items.filter(item => item.product._id !== productId);

    // Recalculate totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    cartService.setLocalCart(cart);
    return cart;
  },

  clearLocalCart: () => {
    const emptyCart = { items: [], totalItems: 0, totalPrice: 0 };
    cartService.setLocalCart(emptyCart);
    return emptyCart;
  },

  // Sync local cart with server (when user logs in)
  syncCartWithServer: async () => {
    const localCart = cartService.getLocalCart();
    
    if (localCart.items.length > 0) {
      // Add each local cart item to server cart
      for (const item of localCart.items) {
        try {
          await cartService.addToCart(item.product._id, item.quantity);
        } catch (error) {
          console.error('Error syncing cart item:', error);
        }
      }
      
      // Clear local cart after sync
      cartService.clearLocalCart();
    }

    // Return server cart
    return await cartService.getCart();
  }
};

export default cartService;
