import api from './api';

// Order API endpoints
const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    return await api.post('/orders', orderData);
  },

  // Get user's orders
  getUserOrders: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const url = queryString ? `/orders?${queryString}` : '/orders';
    
    return await api.get(url);
  },

  // Get single order by ID
  getOrder: async (orderId) => {
    return await api.get(`/orders/${orderId}`);
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    return await api.put(`/orders/${orderId}/cancel`, { reason });
  },

  // Admin: Get all orders
  getAllOrders: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const url = queryString ? `/orders/admin/all?${queryString}` : '/orders/admin/all';
    
    return await api.get(url);
  },

  // Admin: Get order statistics
  getOrderStats: async () => {
    return await api.get('/orders/admin/stats');
  },

  // Admin: Update order status
  updateOrderStatus: async (orderId, statusData) => {
    return await api.put(`/orders/${orderId}/status`, statusData);
  },

  // Admin: Process refund
  processRefund: async (orderId, refundData) => {
    return await api.post(`/orders/${orderId}/refund`, refundData);
  },

  // Helper functions for order status
  getOrderStatusColor: (status) => {
    const statusColors = {
      'processing': 'badge-warning',
      'confirmed': 'badge-info',
      'shipped': 'badge-info',
      'out_for_delivery': 'badge-warning',
      'delivered': 'badge-success',
      'cancelled': 'badge-error',
      'returned': 'badge-error'
    };
    return statusColors[status] || 'badge-info';
  },

  getOrderStatusText: (status) => {
    const statusText = {
      'processing': 'Processing',
      'confirmed': 'Confirmed',
      'shipped': 'Shipped',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'returned': 'Returned'
    };
    return statusText[status] || status;
  },

  // Calculate order totals
  calculateOrderTotal: (items, taxPrice = 0, shippingPrice = 0, discountAmount = 0) => {
    const itemsPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalPrice = itemsPrice + taxPrice + shippingPrice - discountAmount;
    
    return {
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountAmount,
      totalPrice
    };
  },

  // Format order number
  formatOrderNumber: (orderNumber) => {
    return orderNumber || 'N/A';
  },

  // Check if order can be cancelled
  canCancelOrder: (order) => {
    const cancellableStatuses = ['processing', 'confirmed'];
    return cancellableStatuses.includes(order.orderStatus);
  },

  // Check if order can be returned
  canReturnOrder: (order) => {
    if (order.orderStatus !== 'delivered') return false;
    
    const deliveryDate = order.actualDelivery ? new Date(order.actualDelivery) : null;
    if (!deliveryDate) return false;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return deliveryDate > thirtyDaysAgo;
  },

  // Get estimated delivery date
  getEstimatedDelivery: (orderDate, shippingMethod = 'standard') => {
    const estimatedDays = {
      'standard': 7,
      'express': 3,
      'overnight': 1
    };
    
    const days = estimatedDays[shippingMethod] || 7;
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + days);
    
    return deliveryDate;
  },

  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },

  // Format date
  formatDate: (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  },

  // Get payment method display name
  getPaymentMethodName: (method) => {
    const paymentMethods = {
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card',
      'paypal': 'PayPal',
      'stripe': 'Stripe',
      'razorpay': 'Razorpay',
      'cash_on_delivery': 'Cash on Delivery'
    };
    return paymentMethods[method] || method;
  }
};

export default orderService;
