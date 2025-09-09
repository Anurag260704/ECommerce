import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import checkoutService from '../services/checkoutService';
import addressService from '../services/addressService';
import AddressSelector from '../components/checkout/AddressSelector';
import PaymentForm from '../components/checkout/PaymentForm';
import OrderSummary from '../components/checkout/OrderSummary';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Checkout = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { items, totalItems } = useCart();

    // State management
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [checkoutData, setCheckoutData] = useState({
        selectedAddressId: null,
        useNewAddress: false,
        newAddress: {
            firstName: '',
            lastName: '',
            company: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'United States',
            phone: ''
        },
        paymentMethod: '',
        paymentDetails: {},
        orderNotes: '',
        appliedCoupon: null
    });
    const [summary, setSummary] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [errors, setErrors] = useState({});

    // Redirect if not authenticated or cart is empty
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth/login?redirect=/checkout');
            return;
        }

        if (totalItems === 0) {
            toast.error('Your cart is empty');
            navigate('/cart');
            return;
        }

        loadCheckoutData();
    }, [isAuthenticated, totalItems]);

    // Load checkout data
    const loadCheckoutData = async () => {
        try {
            setLoading(true);

            // Load checkout summary and payment methods in parallel
            const [summaryResponse, paymentMethodsResponse] = await Promise.all([
                checkoutService.getCheckoutSummary(),
                checkoutService.getPaymentMethods()
            ]);

            if (summaryResponse.success) {
                setSummary(summaryResponse.summary);
                setAddresses(summaryResponse.summary.addresses || []);

                // Set default address if available
                const defaultAddress = summaryResponse.summary.addresses?.find(addr => addr.isDefault);
                if (defaultAddress) {
                    setCheckoutData(prev => ({
                        ...prev,
                        selectedAddressId: defaultAddress._id
                    }));
                }
            }

            if (paymentMethodsResponse.success) {
                setPaymentMethods(paymentMethodsResponse.paymentMethods);
            }

        } catch (error) {
            console.error('Error loading checkout data:', error);
            toast.error(error.message || 'Failed to load checkout data');
            navigate('/cart');
        } finally {
            setLoading(false);
        }
    };

    // Handle step navigation
    const goToStep = (step) => {
        if (step < currentStep || validateCurrentStep()) {
            setCurrentStep(step);
            setErrors({});
        }
    };

    const nextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
            setErrors({});
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setErrors({});
    };

    // Validate current step
    const validateCurrentStep = () => {
        const newErrors = {};

        if (currentStep === 1) {
            // Validate shipping address
            if (!checkoutData.useNewAddress && !checkoutData.selectedAddressId) {
                newErrors.address = 'Please select a shipping address';
            } else if (checkoutData.useNewAddress) {
                const addressValidation = addressService.validateAddressData(checkoutData.newAddress);
                if (!addressValidation.isValid) {
                    Object.assign(newErrors, addressValidation.errors);
                }
            }
        } else if (currentStep === 2) {
            // Validate payment method
            if (!checkoutData.paymentMethod) {
                newErrors.paymentMethod = 'Please select a payment method';
            } else if (['credit_card', 'debit_card'].includes(checkoutData.paymentMethod)) {
                const cardValidation = checkoutService.validatePaymentCard(checkoutData.paymentDetails);
                if (!cardValidation.isValid) {
                    Object.assign(newErrors, cardValidation.errors);
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form updates
    const updateCheckoutData = (field, value) => {
        setCheckoutData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear related errors
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const updateNestedData = (parent, field, value) => {
        setCheckoutData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));

        // Clear related errors
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Apply coupon
    const applyCoupon = async (couponCode) => {
        try {
            const response = await checkoutService.applyCoupon(couponCode);
            if (response.success) {
                setCheckoutData(prev => ({
                    ...prev,
                    appliedCoupon: response.coupon
                }));
                toast.success(response.message);
                
                // Reload summary to get updated totals
                await loadCheckoutData();
            }
        } catch (error) {
            toast.error(error.message || 'Invalid coupon code');
            throw error;
        }
    };

    // Remove coupon
    const removeCoupon = () => {
        setCheckoutData(prev => ({
            ...prev,
            appliedCoupon: null
        }));
        toast.success('Coupon removed');
        loadCheckoutData(); // Reload to get updated totals
    };

    // Submit order
    const submitOrder = async () => {
        try {
            // Final validation
            if (!validateCurrentStep()) {
                return;
            }

            setSubmitting(true);

            // Format order data
            console.log('CheckoutData before formatting:', JSON.stringify(checkoutData, null, 2));
            const orderData = checkoutService.formatOrderData(checkoutData);
            console.log('Formatted order data:', JSON.stringify(orderData, null, 2));

            // Create order
            const response = await checkoutService.createOrder(orderData);

            if (response.success) {
                toast.success('Order placed successfully!');
                
                // Redirect to order confirmation
                navigate(`/order-confirmation/${response.order._id}`, {
                    state: { orderDetails: response.order }
                });
            }

        } catch (error) {
            console.error('Order submission error:', error);
            console.error('Full error details:', JSON.stringify(error, null, 2));
            toast.error(error.message || 'Failed to place order');
            
            // If validation errors, show them
            if (error.errors) {
                console.error('Validation errors array:', JSON.stringify(error.errors, null, 2));
                const errorObj = {};
                error.errors.forEach(err => {
                    console.log('Processing error:', err);
                    errorObj[err.field || err.path || err.param] = err.message || err.msg;
                });
                setErrors(errorObj);
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to load checkout</h2>
                    <p className="text-gray-600 mb-4">There was an error loading your checkout information.</p>
                    <button
                        onClick={() => navigate('/cart')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                    >
                        Return to Cart
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                    <p className="text-gray-600 mt-2">
                        Complete your purchase in just a few steps
                    </p>
                </div>

                {/* Progress Steps */}
                <CheckoutSteps 
                    currentStep={currentStep}
                    onStepClick={goToStep}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Step 1: Shipping Address */}
                        {currentStep === 1 && (
                            <AddressSelector
                                addresses={addresses}
                                selectedAddressId={checkoutData.selectedAddressId}
                                useNewAddress={checkoutData.useNewAddress}
                                newAddress={checkoutData.newAddress}
                                onAddressSelect={(addressId) => updateCheckoutData('selectedAddressId', addressId)}
                                onUseNewAddressChange={(value) => updateCheckoutData('useNewAddress', value)}
                                onNewAddressChange={(field, value) => updateNestedData('newAddress', field, value)}
                                errors={errors}
                            />
                        )}

                        {/* Step 2: Payment Method */}
                        {currentStep === 2 && (
                            <PaymentForm
                                paymentMethods={paymentMethods}
                                selectedMethod={checkoutData.paymentMethod}
                                paymentDetails={checkoutData.paymentDetails}
                                onMethodSelect={(method) => updateCheckoutData('paymentMethod', method)}
                                onDetailsChange={(field, value) => updateNestedData('paymentDetails', field, value)}
                                errors={errors}
                            />
                        )}

                        {/* Step 3: Review & Place Order */}
                        {currentStep === 3 && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                    Review Your Order
                                </h3>

                                {/* Order Notes */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Order Notes (Optional)
                                    </label>
                                    <textarea
                                        value={checkoutData.orderNotes}
                                        onChange={(e) => updateCheckoutData('orderNotes', e.target.value)}
                                        placeholder="Any special instructions for your order..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        maxLength={500}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {checkoutData.orderNotes.length}/500 characters
                                    </p>
                                </div>

                                {/* Order Summary for Review */}
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <h4 className="font-medium text-gray-900 mb-3">Order Details</h4>
                                    
                                    {/* Shipping Address */}
                                    <div className="mb-3">
                                        <p className="text-sm font-medium text-gray-700">Shipping Address:</p>
                                        <p className="text-sm text-gray-600">
                                            {checkoutData.useNewAddress ? (
                                                <>
                                                    {addressService.getFullName(checkoutData.newAddress)}<br />
                                                    {addressService.formatAddress(checkoutData.newAddress)}
                                                </>
                                            ) : (
                                                addresses.find(addr => addr._id === checkoutData.selectedAddressId) && (
                                                    <>
                                                        {addressService.getFullName(addresses.find(addr => addr._id === checkoutData.selectedAddressId))}<br />
                                                        {addressService.formatAddress(addresses.find(addr => addr._id === checkoutData.selectedAddressId))}
                                                    </>
                                                )
                                            )}
                                        </p>
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Payment Method:</p>
                                        <p className="text-sm text-gray-600">
                                            {paymentMethods.find(method => method.id === checkoutData.paymentMethod)?.name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`px-6 py-2 rounded-md border ${
                                    currentStep === 1
                                        ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Previous
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    onClick={nextStep}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    onClick={submitOrder}
                                    disabled={submitting}
                                    className={`px-6 py-2 rounded-md ${
                                        submitting
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'
                                    } text-white`}
                                >
                                    {submitting ? 'Processing...' : 'Place Order'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <OrderSummary
                            summary={summary}
                            appliedCoupon={checkoutData.appliedCoupon}
                            onApplyCoupon={applyCoupon}
                            onRemoveCoupon={removeCoupon}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
