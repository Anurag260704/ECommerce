import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';
import cartService from '../services/cartService';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case ActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case ActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };

    case ActionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null
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

// Create Auth Context with default value
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: () => {},
  register: () => {},
  logout: () => {},
  updateProfile: () => {},
  changePassword: () => {},
  forgotPassword: () => {},
  resetPassword: () => {},
  clearError: () => {},
  hasRole: () => false,
  isAdmin: () => false
});

// Auth Provider Component
export const AuthProvider = React.memo(({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      // Check if user is stored in localStorage
      const storedUser = authService.getStoredUser();
      const token = authService.getStoredToken();

      if (token && storedUser) {
        // Verify token with server
        try {
          const response = await authService.getCurrentUser();
          if (response.success) {
            dispatch({ type: ActionTypes.LOGIN_SUCCESS, payload: response.user });
            // Sync cart if user is authenticated
            await cartService.syncCartWithServer();
          } else {
            throw new Error('Invalid token');
          }
        } catch (error) {
          // Token is invalid, clear auth data
          authService.clearAuthData();
          dispatch({ type: ActionTypes.LOGOUT });
        }
      } else {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // Login function
  const login = async (email, password) => {
    const credentials = { email, password };
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const response = await authService.login(credentials);
      
      if (response.success) {
        dispatch({ type: ActionTypes.LOGIN_SUCCESS, payload: response.user });
        toast.success('Login successful!');
        
        // Sync cart after login
        await cartService.syncCartWithServer();
        
        return { success: true };
      } else {
        dispatch({ type: ActionTypes.LOGIN_FAILURE, payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: ActionTypes.LOGIN_FAILURE, payload: message });
      return { success: false, message };
    }
  };

  // Register function
  const register = async (firstName, lastName, email, password) => {
    const userData = { firstName, lastName, email, password };
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const response = await authService.register(userData);
      
      if (response.success) {
        dispatch({ type: ActionTypes.LOGIN_SUCCESS, payload: response.user });
        toast.success('Registration successful!');
        
        // Sync cart after registration
        await cartService.syncCartWithServer();
        
        return { success: true };
      } else {
        dispatch({ type: ActionTypes.LOGIN_FAILURE, payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: ActionTypes.LOGIN_FAILURE, payload: message });
      return { success: false, message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: ActionTypes.LOGOUT });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: ActionTypes.LOGOUT });
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      
      if (response.success) {
        dispatch({ type: ActionTypes.UPDATE_USER, payload: response.user });
        toast.success('Profile updated successfully!');
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      return { success: false, message };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      const response = await authService.changePassword(passwordData);
      
      if (response.success) {
        toast.success('Password changed successfully!');
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      return { success: false, message };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        toast.success('Password reset email sent!');
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      return { success: false, message };
    }
  };

  // Reset password
  const resetPassword = async (token, passwordData) => {
    try {
      const response = await authService.resetPassword(token, passwordData);
      
      if (response.success) {
        dispatch({ type: ActionTypes.LOGIN_SUCCESS, payload: response.user });
        toast.success('Password reset successful!');
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      return { success: false, message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,
    hasRole,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
});

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Default export for the context
export default AuthContext;

// Named export for the context (for consistency)
export { AuthContext };
