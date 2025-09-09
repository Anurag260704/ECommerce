import React, { createContext, useContext, useReducer, useEffect } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_CART: 'SET_CART',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case ActionTypes.SET_CART:
      return {
        ...state,
        items: action.payload.items || [],
        totalItems: action.payload.totalItems || 0,
        totalPrice: action.payload.totalPrice || 0,
        isLoading: false,
        error: null
      };

    case ActionTypes.ADD_ITEM:
      const existingItemIndex = state.items.findIndex(
        item => item.product._id === action.payload.product._id
      );

      let updatedItems;
      if (existingItemIndex > -1) {
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        updatedItems = [...state.items, action.payload];
      }

      const newTotalItems = updatedItems.reduce((total, item) => total + item.quantity, 0);
      const newTotalPrice = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);

      return {
        ...state,
        items: updatedItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
        error: null
      };

    case ActionTypes.UPDATE_ITEM:
      const updatedCartItems = action.payload.quantity === 0
        ? state.items.filter(item => item.product._id !== action.payload.productId)
        : state.items.map(item =>
            item.product._id === action.payload.productId
              ? { ...item, quantity: action.payload.quantity }
              : item
          );

      const updatedTotalItems = updatedCartItems.reduce((total, item) => total + item.quantity, 0);
      const updatedTotalPrice = updatedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

      return {
        ...state,
        items: updatedCartItems,
        totalItems: updatedTotalItems,
        totalPrice: updatedTotalPrice,
        error: null
      };

    case ActionTypes.REMOVE_ITEM:
      const filteredItems = state.items.filter(
        item => item.product._id !== action.payload
      );
      const filteredTotalItems = filteredItems.reduce((total, item) => total + item.quantity, 0);
      const filteredTotalPrice = filteredItems.reduce((total, item) => total + (item.price * item.quantity), 0);

      return {
        ...state,
        items: filteredItems,
        totalItems: filteredTotalItems,
        totalPrice: filteredTotalPrice,
        error: null
      };

    case ActionTypes.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        error: null
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create Cart Context with default value
const CartContext = createContext({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,
  addToCart: () => {},
  updateCartItem: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  getCartSummary: () => {},
  isInCart: () => false,
  getItemQuantity: () => 0,
  getCartItemCount: () => 0,
  clearError: () => {}
});

// Cart Provider Component
export const CartProvider = React.memo(({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Initialize cart on app start
  useEffect(() => {
    if (!authLoading) {
      initializeCart();
    }
  }, [isAuthenticated, authLoading]);

  const initializeCart = async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      if (isAuthenticated) {
        // Load cart from server
        const response = await cartService.getCart();
        if (response.success) {
          dispatch({ type: ActionTypes.SET_CART, payload: response.cart });
        }
      } else {
        // Load cart from localStorage
        const localCart = cartService.getLocalCart();
        dispatch({ type: ActionTypes.SET_CART, payload: localCart });
      }
    } catch (error) {
      console.error('Cart initialization error:', error);
      // Fallback to local cart
      const localCart = cartService.getLocalCart();
      dispatch({ type: ActionTypes.SET_CART, payload: localCart });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    try {
      if (isAuthenticated) {
        // Add to server cart
        const response = await cartService.addToCart(product._id, quantity);
        if (response.success) {
          dispatch({ type: ActionTypes.SET_CART, payload: response.cart });
          toast.success('Item added to cart!');
          return { success: true };
        }
      } else {
        // Add to local cart
        const cartItem = {
          product,
          quantity,
          price: product.discountPrice || product.price
        };
        dispatch({ type: ActionTypes.ADD_ITEM, payload: cartItem });
        cartService.addToLocalCart(product, quantity);
        toast.success('Item added to cart!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Update cart item quantity
  const updateCartItem = async (productId, quantity) => {
    try {
      if (isAuthenticated) {
        // Update server cart
        const response = await cartService.updateCartItem(productId, quantity);
        if (response.success) {
          dispatch({ type: ActionTypes.SET_CART, payload: response.cart });
          return { success: true };
        }
      } else {
        // Update local cart
        dispatch({ type: ActionTypes.UPDATE_ITEM, payload: { productId, quantity } });
        cartService.updateLocalCartItem(productId, quantity);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart item';
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      if (isAuthenticated) {
        // Remove from server cart
        const response = await cartService.removeFromCart(productId);
        if (response.success) {
          dispatch({ type: ActionTypes.SET_CART, payload: response.cart });
          toast.success('Item removed from cart');
          return { success: true };
        }
      } else {
        // Remove from local cart
        dispatch({ type: ActionTypes.REMOVE_ITEM, payload: productId });
        cartService.removeFromLocalCart(productId);
        toast.success('Item removed from cart');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item from cart';
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        // Clear server cart
        const response = await cartService.clearCart();
        if (response.success) {
          dispatch({ type: ActionTypes.CLEAR_CART });
          toast.success('Cart cleared');
          return { success: true };
        }
      } else {
        // Clear local cart
        dispatch({ type: ActionTypes.CLEAR_CART });
        cartService.clearLocalCart();
        toast.success('Cart cleared');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Get cart summary with calculations
  const getCartSummary = async () => {
    try {
      if (isAuthenticated) {
        return await cartService.getCartSummary();
      } else {
        // Calculate local cart summary
        const subtotal = state.totalPrice;
        const tax = Math.round(subtotal * 0.1 * 100) / 100;
        const shipping = subtotal >= 100 ? 0 : 10;
        const total = subtotal + tax + shipping;

        return {
          success: true,
          summary: {
            totalItems: state.totalItems,
            totalPrice: state.totalPrice,
            itemsCount: state.items.length,
            subtotal,
            estimatedTax: tax,
            estimatedShipping: shipping,
            estimatedTotal: total
          }
        };
      }
    } catch (error) {
      console.error('Get cart summary error:', error);
      return { success: false, message: 'Failed to get cart summary' };
    }
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return state.items.some(item => item.product._id === productId);
  };

  // Get item quantity in cart
  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  // Get cart item count
  const getCartItemCount = () => {
    return state.totalItems;
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  const value = {
    // State
    items: state.items,
    totalItems: state.totalItems,
    totalPrice: state.totalPrice,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartSummary,
    
    // Helper functions
    isInCart,
    getItemQuantity,
    getCartItemCount,
    clearError
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
});

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Default export for the context
export default CartContext;

// Named export for the context (for consistency)
export { CartContext };
