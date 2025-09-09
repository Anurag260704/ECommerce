import api from './api';

const paymentService = {
  // Get user payment methods
  getPaymentMethods: async () => {
    try {
      const response = await api.get('/payment-methods');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch payment methods' };
    }
  },

  // Add new payment method
  addPaymentMethod: async (paymentData) => {
    try {
      const response = await api.post('/payment-methods', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add payment method' };
    }
  },

  // Update payment method
  updatePaymentMethod: async (id, paymentData) => {
    try {
      const response = await api.put(`/payment-methods/${id}`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update payment method' };
    }
  },

  // Delete payment method
  deletePaymentMethod: async (id) => {
    try {
      const response = await api.delete(`/payment-methods/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete payment method' };
    }
  },

  // Set default payment method
  setDefaultPaymentMethod: async (id) => {
    try {
      const response = await api.put(`/payment-methods/${id}/default`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to set default payment method' };
    }
  },

  // Validate payment method
  validatePaymentMethod: async (paymentData) => {
    try {
      const response = await api.post('/payment-methods/validate', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to validate payment method' };
    }
  }
};

export default paymentService;
