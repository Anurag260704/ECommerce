import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  CreditCard, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Star,
  Shield,
  Calendar,
  User
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const PaymentMethodsTab = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm();

  // Card type detection based on number
  const detectCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    
    return 'unknown';
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date (MM/YY)
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    
    return v;
  };

  // Get card icon based on type
  const getCardIcon = (type) => {
    switch (type) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      case 'discover':
        return '💳';
      default:
        return '💳';
    }
  };

  // Mask card number for display
  const maskCardNumber = (number) => {
    const cleaned = number.replace(/\s/g, '');
    return '**** **** **** ' + cleaned.slice(-4);
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock API call - replace with actual API when backend is ready
      const mockMethods = [
        {
          _id: '1',
          type: 'card',
          cardType: 'visa',
          last4: '4567',
          expiryMonth: '12',
          expiryYear: '25',
          holderName: 'John Doe',
          isDefault: true,
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          _id: '2',
          type: 'card',
          cardType: 'mastercard',
          last4: '8901',
          expiryMonth: '08',
          expiryYear: '26',
          holderName: 'John Doe',
          isDefault: false,
          createdAt: '2024-02-01T14:20:00Z'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPaymentMethods(mockMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setError(error.message || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Mock API call - replace with actual API when backend is ready
      const newMethod = {
        _id: Date.now().toString(),
        type: 'card',
        cardType: detectCardType(data.cardNumber),
        last4: data.cardNumber.replace(/\s/g, '').slice(-4),
        expiryMonth: data.expiryDate.split('/')[0],
        expiryYear: data.expiryDate.split('/')[1],
        holderName: data.holderName,
        isDefault: data.isDefault || false,
        createdAt: new Date().toISOString()
      };

      if (editingMethod) {
        // Update existing method
        setPaymentMethods(prev => prev.map(method => 
          method._id === editingMethod._id ? { ...method, ...newMethod } : method
        ));
        toast.success('Payment method updated successfully');
      } else {
        // Add new method
        setPaymentMethods(prev => [...prev, newMethod]);
        toast.success('Payment method added successfully');
      }

      handleCancelForm();
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast.error(error.message || 'Failed to save payment method');
    }
  };

  const handleEdit = (method) => {
    setEditingMethod(method);
    setShowAddForm(true);
    
    // Pre-fill form with method data
    setValue('holderName', method.holderName);
    setValue('cardNumber', '**** **** **** ' + method.last4);
    setValue('expiryDate', method.expiryMonth + '/' + method.expiryYear);
    setValue('isDefault', method.isDefault);
  };

  const handleDelete = async (methodId) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      // Mock API call - replace with actual API when backend is ready
      setPaymentMethods(prev => prev.filter(method => method._id !== methodId));
      toast.success('Payment method deleted successfully');
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error(error.message || 'Failed to delete payment method');
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      // Mock API call - replace with actual API when backend is ready
      setPaymentMethods(prev => prev.map(method => ({
        ...method,
        isDefault: method._id === methodId
      })));
      toast.success('Default payment method updated');
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error(error.message || 'Failed to update default payment method');
    }
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingMethod(null);
    reset();
  };

  // Watch card number for formatting
  const cardNumber = watch('cardNumber');
  const expiryDate = watch('expiryDate');

  // Format inputs on change
  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setValue('cardNumber', formatted);
  };

  const handleExpiryDateChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setValue('expiryDate', formatted);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner message="Loading your payment methods..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
          <p className="text-gray-600">Manage your saved payment methods</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add Payment Method
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-medium">Error loading payment methods</div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button 
            onClick={fetchPaymentMethods}
            className="btn btn-outline-error btn-sm mt-3"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Add/Edit Payment Method Form */}
      {showAddForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
            </h3>
            <button
              onClick={handleCancelForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Secure Payment</span>
            </div>
            <p className="text-blue-600 text-sm mt-1">
              Your payment information is encrypted and secure. We never store your full card details.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <div className="relative">
                <User className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  {...register('holderName', { required: 'Cardholder name is required' })}
                  className="input pl-10"
                  placeholder="Enter cardholder name"
                />
              </div>
              {errors.holderName && (
                <p className="mt-1 text-sm text-red-600">{errors.holderName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <div className="relative">
                <CreditCard className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  {...register('cardNumber', { 
                    required: 'Card number is required',
                    minLength: { value: 19, message: 'Please enter a valid card number' }
                  })}
                  className="input pl-10"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  onChange={handleCardNumberChange}
                  disabled={editingMethod} // Don't allow editing card number
                />
                {cardNumber && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-2xl">{getCardIcon(detectCardType(cardNumber))}</span>
                  </div>
                )}
              </div>
              {errors.cardNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <div className="relative">
                  <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('expiryDate', { 
                      required: 'Expiry date is required',
                      pattern: {
                        value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                        message: 'Please enter a valid expiry date (MM/YY)'
                      }
                    })}
                    className="input pl-10"
                    placeholder="MM/YY"
                    maxLength="5"
                    onChange={handleExpiryDateChange}
                  />
                </div>
                {errors.expiryDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  {...register('cvv', { 
                    required: 'CVV is required',
                    minLength: { value: 3, message: 'CVV must be at least 3 digits' },
                    maxLength: { value: 4, message: 'CVV must be at most 4 digits' }
                  })}
                  type="password"
                  className="input"
                  placeholder="123"
                  maxLength="4"
                />
                {errors.cvv && (
                  <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                {...register('isDefault')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200"
              />
              <label className="ml-2 text-sm text-gray-700">
                Set as default payment method
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancelForm}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                {editingMethod ? 'Update Payment Method' : 'Add Payment Method'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Methods List */}
      {paymentMethods.length === 0 && !loading ? (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment methods yet</h3>
          <p className="text-gray-600 mb-6">Add a payment method to make checkout faster!</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add Your First Payment Method
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method._id}
              className={`relative bg-white border rounded-lg p-4 transition-shadow hover:shadow-md ${
                method.isDefault ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-200'
              }`}
            >
              {/* Default Badge */}
              {method.isDefault && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Default
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getCardIcon(method.cardType)}</span>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {method.cardType} Card
                    </p>
                    <p className="text-sm text-gray-600">
                      {maskCardNumber('**** **** **** ' + method.last4)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(method)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Edit payment method"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(method._id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete payment method"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <p>Cardholder: {method.holderName}</p>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Expires: {method.expiryMonth}/{method.expiryYear}</p>
                </div>
                
                <div className="text-xs text-gray-500">
                  <p>Added: {new Date(method.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {!method.isDefault && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleSetDefault(method._id)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Set as default
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 text-gray-700 mb-2">
          <Shield className="h-4 w-4" />
          <span className="font-medium">Security Information</span>
        </div>
        <p className="text-sm text-gray-600">
          Your payment information is protected with bank-level security. We use industry-standard encryption 
          and never store your complete card details. All transactions are processed securely through our 
          certified payment partners.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodsTab;
