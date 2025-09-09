import React, { createContext, useContext, useReducer, useEffect } from 'react';
import wishlistService from '../services/wishlistService';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  wishlist: null,
  wishlistCount: 0,
  loading: false,
  error: null,
  wishlistStatus: {} // To track which products are in wishlist
};

// Action types
const WISHLIST_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_WISHLIST: 'SET_WISHLIST',
  SET_WISHLIST_COUNT: 'SET_WISHLIST_COUNT',
  ADD_TO_WISHLIST: 'ADD_TO_WISHLIST',
  REMOVE_FROM_WISHLIST: 'REMOVE_FROM_WISHLIST',
  CLEAR_WISHLIST: 'CLEAR_WISHLIST',
  SET_ERROR: 'SET_ERROR',
  SET_WISHLIST_STATUS: 'SET_WISHLIST_STATUS',
  UPDATE_PRODUCT_STATUS: 'UPDATE_PRODUCT_STATUS',
  RESET_STATE: 'RESET_STATE'
};

// Reducer function
const wishlistReducer = (state, action) => {
  switch (action.type) {
    case WISHLIST_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case WISHLIST_ACTIONS.SET_WISHLIST:
      const products = action.payload?.products || [];
      const statusMap = {};
      products.forEach(item => {
        if (item.product && item.product._id) {
          statusMap[item.product._id] = true;
        }
      });
      
      return {
        ...state,
        wishlist: action.payload,
        wishlistCount: products.length,
        wishlistStatus: { ...state.wishlistStatus, ...statusMap },
        error: null
      };

    case WISHLIST_ACTIONS.SET_WISHLIST_COUNT:
      return {
        ...state,
        wishlistCount: action.payload
      };

    case WISHLIST_ACTIONS.ADD_TO_WISHLIST:
      const updatedWishlistAdd = action.payload;
      const newStatusAdd = {};
      updatedWishlistAdd.products.forEach(item => {
        if (item.product && item.product._id) {
          newStatusAdd[item.product._id] = true;
        }
      });
      
      return {
        ...state,
        wishlist: updatedWishlistAdd,
        wishlistCount: updatedWishlistAdd.products.length,
        wishlistStatus: { ...state.wishlistStatus, ...newStatusAdd },
        error: null
      };

    case WISHLIST_ACTIONS.REMOVE_FROM_WISHLIST:
      const updatedWishlistRemove = action.payload.wishlist;
      const removedProductId = action.payload.productId;
      const newStatusRemove = { ...state.wishlistStatus };
      delete newStatusRemove[removedProductId];
      
      return {
        ...state,
        wishlist: updatedWishlistRemove,
        wishlistCount: updatedWishlistRemove.products.length,
        wishlistStatus: newStatusRemove,
        error: null
      };

    case WISHLIST_ACTIONS.CLEAR_WISHLIST:
      return {
        ...state,
        wishlist: { ...state.wishlist, products: [] },
        wishlistCount: 0,
        wishlistStatus: {},
        error: null
      };

    case WISHLIST_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case WISHLIST_ACTIONS.SET_WISHLIST_STATUS:
      return {
        ...state,
        wishlistStatus: { ...state.wishlistStatus, ...action.payload }
      };

    case WISHLIST_ACTIONS.UPDATE_PRODUCT_STATUS:
      return {
        ...state,
        wishlistStatus: {
          ...state.wishlistStatus,
          [action.payload.productId]: action.payload.status
        }
      };

    case WISHLIST_ACTIONS.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

// Create context
const WishlistContext = createContext();

// Provider component
export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { user, isAuthenticated } = useContext(AuthContext);

  // Fetch wishlist on user login
  useEffect(() => {
    if (user && isAuthenticated) {
      fetchWishlist();
    } else {
      // Reset state when user logs out
      dispatch({ type: WISHLIST_ACTIONS.RESET_STATE });
    }
  }, [user, isAuthenticated]);

  // Fetch user's wishlist
  const fetchWishlist = async () => {
    if (!user || !isAuthenticated) return;

    try {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true });
      const response = await wishlistService.getWishlist();
      dispatch({ type: WISHLIST_ACTIONS.SET_WISHLIST, payload: response.data });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Add product to wishlist
  const addToWishlist = async (productId) => {
    if (!user || !isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return false;
    }

    try {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true });
      const response = await wishlistService.addToWishlist(productId);
      dispatch({ type: WISHLIST_ACTIONS.ADD_TO_WISHLIST, payload: response.data });
      toast.success(response.message || 'Added to wishlist!');
      return true;
    } catch (error) {
      const errorMessage = error.message || 'Failed to add to wishlist';
      toast.error(errorMessage);
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    if (!user || !isAuthenticated) {
      toast.error('Please login to manage wishlist');
      return false;
    }

    try {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true });
      const response = await wishlistService.removeFromWishlist(productId);
      dispatch({ 
        type: WISHLIST_ACTIONS.REMOVE_FROM_WISHLIST, 
        payload: { wishlist: response.data, productId } 
      });
      toast.success(response.message || 'Removed from wishlist');
      return true;
    } catch (error) {
      const errorMessage = error.message || 'Failed to remove from wishlist';
      toast.error(errorMessage);
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Toggle product in wishlist
  const toggleWishlist = async (productId) => {
    if (!user || !isAuthenticated) {
      toast.error('Please login to manage wishlist');
      return false;
    }

    const isInWishlist = state.wishlistStatus[productId] || false;
    
    if (isInWishlist) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    if (!user || !isAuthenticated) {
      toast.error('Please login to manage wishlist');
      return false;
    }

    try {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true });
      const response = await wishlistService.clearWishlist();
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST });
      toast.success(response.message || 'Wishlist cleared');
      return true;
    } catch (error) {
      const errorMessage = error.message || 'Failed to clear wishlist';
      toast.error(errorMessage);
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return state.wishlistStatus[productId] || false;
  };

  // Move items to cart
  const moveToCart = async (productIds) => {
    if (!user || !isAuthenticated) {
      toast.error('Please login to move items to cart');
      return false;
    }

    try {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true });
      const response = await wishlistService.moveToCart(productIds);
      
      // Update wishlist state
      dispatch({ type: WISHLIST_ACTIONS.SET_WISHLIST, payload: response.data.wishlist });
      
      const { movedProducts, errors } = response.data;
      
      if (movedProducts.length > 0) {
        toast.success(`${movedProducts.length} item(s) moved to cart`);
      }
      
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
      }
      
      return true;
    } catch (error) {
      const errorMessage = error.message || 'Failed to move items to cart';
      toast.error(errorMessage);
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Move all items to cart
  const moveAllToCart = async () => {
    if (!state.wishlist || state.wishlist.products.length === 0) {
      toast.error('Your wishlist is empty');
      return false;
    }

    const productIds = state.wishlist.products.map(item => item.product._id);
    return await moveToCart(productIds);
  };

  // Check product status (for UI updates)
  const checkProductStatus = async (productId) => {
    if (!user || !isAuthenticated) return false;

    try {
      const response = await wishlistService.checkInWishlist(productId);
      dispatch({
        type: WISHLIST_ACTIONS.UPDATE_PRODUCT_STATUS,
        payload: { productId, status: response.inWishlist }
      });
      return response.inWishlist;
    } catch (error) {
      console.error('Error checking product status:', error);
      return false;
    }
  };

  const value = {
    // State
    wishlist: state.wishlist,
    wishlistCount: state.wishlistCount,
    loading: state.loading,
    error: state.error,
    wishlistStatus: state.wishlistStatus,
    
    // Actions
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist,
    moveToCart,
    moveAllToCart,
    checkProductStatus
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook to use wishlist context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export { WishlistContext };
