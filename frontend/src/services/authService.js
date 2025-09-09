import api from './api';

// Auth API endpoints
const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  // Logout user
  logout: async () => {
    try {
      await api.get('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  // Update user profile
  updateProfile: async (userData) => {
    return await api.put('/auth/profile', userData);
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  },

  // Forgot password
  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token, passwordData) => {
    const response = await api.put(`/auth/reset-password/${token}`, passwordData);
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get stored user data
  getStoredUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      // Clear corrupted data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  },

  // Get stored token
  getStoredToken: () => {
    return localStorage.getItem('token');
  },

  // Clear stored auth data
  clearAuthData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default authService;
