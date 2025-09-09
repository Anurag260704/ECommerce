import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: `${API_URL}/checkout`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('Checkout API Error:', error.response?.data || error.message);
        if (error.response?.data?.errors) {
            console.error('Validation Errors Details:', JSON.stringify(error.response.data.errors, null, 2));
        }
        return Promise.reject(error.response?.data || error);
    }
);

const checkoutService = {
    // Get checkout summary
    getCheckoutSummary: async () => {
        try {
            return await api.get('/summary');
        } catch (error) {
            throw error;
        }
    },

    // Validate checkout data
    validateCheckout: async (checkoutData) => {
        try {
            return await api.post('/validate', checkoutData);
        } catch (error) {
            throw error;
        }
    },

    // Create order
    createOrder: async (orderData) => {
        try {
            console.log('Sending order data:', JSON.stringify(orderData, null, 2));
            return await api.post('/create-order', orderData);
        } catch (error) {
            console.error('Create order error:', error);
            throw error;
        }
    },

    // Apply coupon code
    applyCoupon: async (couponCode) => {
        try {
            return await api.post('/apply-coupon', { couponCode });
        } catch (error) {
            throw error;
        }
    },

    // Get available payment methods
    getPaymentMethods: async () => {
        try {
            return await api.get('/payment-methods');
        } catch (error) {
            throw error;
        }
    },

    // Calculate shipping cost
    calculateShipping: (itemsPrice, address) => {
        // Mock shipping calculation
        if (itemsPrice >= 100) {
            return 0; // Free shipping over $100
        }

        // Basic shipping rates based on country/region
        const shippingRates = {
            'United States': 10,
            'Canada': 15,
            'Mexico': 20,
            // Add more countries as needed
        };

        return shippingRates[address?.country] || 25; // Default international rate
    },

    // Calculate tax
    calculateTax: (itemsPrice, address) => {
        // Mock tax calculation based on location
        const taxRates = {
            'California': 0.1025, // 10.25%
            'New York': 0.08, // 8%
            'Texas': 0.0825, // 8.25%
            'Florida': 0.06, // 6%
            // Add more states/regions as needed
        };

        const taxRate = taxRates[address?.state] || 0.1; // Default 10%
        return Math.round(itemsPrice * taxRate * 100) / 100;
    },

    // Format order data for submission
    formatOrderData: (checkoutData) => {
        return {
            shippingAddressId: checkoutData.selectedAddressId,
            paymentMethod: checkoutData.paymentMethod,
            orderNotes: checkoutData.orderNotes || '',
            useNewAddress: checkoutData.useNewAddress || false,
            newAddress: checkoutData.useNewAddress ? checkoutData.newAddress : null,
            paymentDetails: checkoutData.paymentDetails || {},
            appliedCoupon: checkoutData.appliedCoupon || null
        };
    },

    // Validate payment card details (basic client-side validation)
    validatePaymentCard: (cardDetails) => {
        const errors = {};

        // Card number validation (basic)
        if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 15) {
            errors.number = 'Valid card number is required';
        }

        // Expiry date validation
        if (!cardDetails.expiryMonth || !cardDetails.expiryYear) {
            errors.expiry = 'Expiry date is required';
        } else {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;
            
            if (cardDetails.expiryYear < currentYear || 
                (cardDetails.expiryYear === currentYear && cardDetails.expiryMonth < currentMonth)) {
                errors.expiry = 'Card has expired';
            }
        }

        // CVV validation
        if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
            errors.cvv = 'Valid CVV is required';
        }

        // Cardholder name validation
        if (!cardDetails.name || cardDetails.name.trim().length < 2) {
            errors.name = 'Cardholder name is required';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // Format card number for display
    formatCardNumber: (number) => {
        return number.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    },

    // Get card type from number
    getCardType: (number) => {
        const cleanNumber = number.replace(/\s/g, '');
        
        if (/^4/.test(cleanNumber)) return 'visa';
        if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
        if (/^3[47]/.test(cleanNumber)) return 'amex';
        if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
        
        return 'unknown';
    }
};

export default checkoutService;
