import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: `${API_URL}/addresses`,
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
        console.error('Address API Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error);
    }
);

const addressService = {
    // Get all user addresses
    getAddresses: async () => {
        try {
            return await api.get('/');
        } catch (error) {
            throw error;
        }
    },

    // Alias for getAddresses to maintain compatibility
    getUserAddresses: async () => {
        try {
            return await api.get('/');
        } catch (error) {
            throw error;
        }
    },

    // Get single address
    getAddress: async (addressId) => {
        try {
            return await api.get(`/${addressId}`);
        } catch (error) {
            throw error;
        }
    },

    // Create new address
    createAddress: async (addressData) => {
        try {
            return await api.post('/', addressData);
        } catch (error) {
            throw error;
        }
    },

    // Alias for createAddress to maintain compatibility
    addAddress: async (addressData) => {
        try {
            return await api.post('/', addressData);
        } catch (error) {
            throw error;
        }
    },

    // Update address
    updateAddress: async (addressId, addressData) => {
        try {
            return await api.put(`/${addressId}`, addressData);
        } catch (error) {
            throw error;
        }
    },

    // Delete address
    deleteAddress: async (addressId) => {
        try {
            return await api.delete(`/${addressId}`);
        } catch (error) {
            throw error;
        }
    },

    // Set default address
    setDefaultAddress: async (addressId) => {
        try {
            return await api.put(`/${addressId}/default`);
        } catch (error) {
            throw error;
        }
    },

    // Get default addresses
    getDefaultAddresses: async () => {
        try {
            return await api.get('/default');
        } catch (error) {
            throw error;
        }
    },

    // Validate address
    validateAddress: async (addressData) => {
        try {
            return await api.post('/validate', addressData);
        } catch (error) {
            throw error;
        }
    },

    // Format address for display
    formatAddress: (address) => {
        if (!address) return '';
        
        let formatted = address.addressLine1;
        if (address.addressLine2) {
            formatted += `, ${address.addressLine2}`;
        }
        formatted += `, ${address.city}, ${address.state} ${address.postalCode}`;
        
        if (address.country && address.country !== 'United States') {
            formatted += `, ${address.country}`;
        }
        
        return formatted;
    },

    // Get full name from address
    getFullName: (address) => {
        if (!address) return '';
        return `${address.firstName} ${address.lastName}`.trim();
    },

    // Validate address data (client-side)
    validateAddressData: (addressData) => {
        const errors = {};

        // Required fields
        if (!addressData.firstName?.trim()) {
            errors.firstName = 'First name is required';
        }

        if (!addressData.lastName?.trim()) {
            errors.lastName = 'Last name is required';
        }

        if (!addressData.addressLine1?.trim()) {
            errors.addressLine1 = 'Address line 1 is required';
        }

        if (!addressData.city?.trim()) {
            errors.city = 'City is required';
        }

        if (!addressData.state?.trim()) {
            errors.state = 'State is required';
        }

        if (!addressData.postalCode?.trim()) {
            errors.postalCode = 'Postal code is required';
        }

        if (!addressData.country?.trim()) {
            errors.country = 'Country is required';
        }

        // Postal code format validation (US)
        if (addressData.country === 'United States' && addressData.postalCode) {
            const usZipRegex = /^\d{5}(-\d{4})?$/;
            if (!usZipRegex.test(addressData.postalCode)) {
                errors.postalCode = 'Please enter a valid US ZIP code (12345 or 12345-6789)';
            }
        }

        // Phone number validation (optional but if provided, should be valid)
        if (addressData.phone && addressData.phone.trim()) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(addressData.phone.replace(/\s|-|\(|\)/g, ''))) {
                errors.phone = 'Please enter a valid phone number';
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // Get US states list
    getUSStates: () => [
        { code: 'AL', name: 'Alabama' },
        { code: 'AK', name: 'Alaska' },
        { code: 'AZ', name: 'Arizona' },
        { code: 'AR', name: 'Arkansas' },
        { code: 'CA', name: 'California' },
        { code: 'CO', name: 'Colorado' },
        { code: 'CT', name: 'Connecticut' },
        { code: 'DE', name: 'Delaware' },
        { code: 'FL', name: 'Florida' },
        { code: 'GA', name: 'Georgia' },
        { code: 'HI', name: 'Hawaii' },
        { code: 'ID', name: 'Idaho' },
        { code: 'IL', name: 'Illinois' },
        { code: 'IN', name: 'Indiana' },
        { code: 'IA', name: 'Iowa' },
        { code: 'KS', name: 'Kansas' },
        { code: 'KY', name: 'Kentucky' },
        { code: 'LA', name: 'Louisiana' },
        { code: 'ME', name: 'Maine' },
        { code: 'MD', name: 'Maryland' },
        { code: 'MA', name: 'Massachusetts' },
        { code: 'MI', name: 'Michigan' },
        { code: 'MN', name: 'Minnesota' },
        { code: 'MS', name: 'Mississippi' },
        { code: 'MO', name: 'Missouri' },
        { code: 'MT', name: 'Montana' },
        { code: 'NE', name: 'Nebraska' },
        { code: 'NV', name: 'Nevada' },
        { code: 'NH', name: 'New Hampshire' },
        { code: 'NJ', name: 'New Jersey' },
        { code: 'NM', name: 'New Mexico' },
        { code: 'NY', name: 'New York' },
        { code: 'NC', name: 'North Carolina' },
        { code: 'ND', name: 'North Dakota' },
        { code: 'OH', name: 'Ohio' },
        { code: 'OK', name: 'Oklahoma' },
        { code: 'OR', name: 'Oregon' },
        { code: 'PA', name: 'Pennsylvania' },
        { code: 'RI', name: 'Rhode Island' },
        { code: 'SC', name: 'South Carolina' },
        { code: 'SD', name: 'South Dakota' },
        { code: 'TN', name: 'Tennessee' },
        { code: 'TX', name: 'Texas' },
        { code: 'UT', name: 'Utah' },
        { code: 'VT', name: 'Vermont' },
        { code: 'VA', name: 'Virginia' },
        { code: 'WA', name: 'Washington' },
        { code: 'WV', name: 'West Virginia' },
        { code: 'WI', name: 'Wisconsin' },
        { code: 'WY', name: 'Wyoming' }
    ],

    // Get countries list (common ones)
    getCountries: () => [
        'United States',
        'Canada',
        'United Kingdom',
        'Germany',
        'France',
        'Australia',
        'Japan',
        'Mexico',
        'Brazil',
        'India',
        'China',
        'South Korea',
        'Italy',
        'Spain',
        'Netherlands'
    ]
};

export default addressService;
