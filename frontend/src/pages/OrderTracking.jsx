import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Footer from '../components/layout/Footer';
import { toast } from 'react-hot-toast';

const OrderTracking = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user && orderId) {
            fetchOrderDetails();
        }
    }, [user, orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await orderService.getOrder(orderId);
            
            if (response.success) {
                setOrder(response.order);
            } else {
                throw new Error(response.message || 'Failed to fetch order details');
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            setError(error.message || 'Failed to load order details');
            
            // If order not found, redirect to orders page
            if (error.status === 404) {
                toast.error('Order not found');
                navigate('/orders');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusStepNumber = (status) => {
        const statusSteps = {
            'processing': 1,
            'confirmed': 2,
            'shipped': 3,
            'out_for_delivery': 4,
            'delivered': 5
        };
        return statusSteps[status] || 0;
    };

    const getStatusIcon = (status) => {
        const statusIcons = {
            'processing': '📋',
            'confirmed': '✅',
            'shipped': '🚚',
            'out_for_delivery': '🛵',
            'delivered': '📦',
            'cancelled': '❌',
            'returned': '↩️'
        };
        return statusIcons[status] || '📋';
    };

    const getStatusMessage = (status) => {
        const statusMessages = {
            'processing': 'Your order is being processed and will be confirmed soon.',
            'confirmed': 'Your order has been confirmed and is being prepared for shipment.',
            'shipped': 'Your order has been shipped and is on its way to you.',
            'out_for_delivery': 'Your order is out for delivery and will arrive soon.',
            'delivered': 'Your order has been successfully delivered.',
            'cancelled': 'Your order has been cancelled.',
            'returned': 'Your order has been returned and refunded.'
        };
        return statusMessages[status] || 'Order status updated.';
    };

    const renderTrackingDetails = () => {
        if (!order) return null;

        const steps = [
            { key: 'processing', label: 'Order Processing', description: 'We are processing your order' },
            { key: 'confirmed', label: 'Order Confirmed', description: 'Your order has been confirmed' },
            { key: 'shipped', label: 'Order Shipped', description: 'Your order is on its way' },
            { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Order is out for delivery' },
            { key: 'delivered', label: 'Delivered', description: 'Order has been delivered' }
        ];

        const currentStep = getStatusStepNumber(order.orderStatus);
        const isCancelled = order.orderStatus === 'cancelled';
        const isReturned = order.orderStatus === 'returned';

        if (isCancelled || isReturned) {
            return (
                <div className="bg-white rounded-lg shadow-md border border-red-200">
                    <div className="p-8 text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <h3 className="text-2xl font-bold text-red-600 mb-2">
                            Order {isCancelled ? 'Cancelled' : 'Returned'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {isCancelled 
                                ? 'Your order has been cancelled and any payment will be refunded.'
                                : 'Your order has been returned and refunded.'
                            }
                        </p>
                        <p className="text-sm text-gray-500">
                            Updated: {orderService.formatDate(order.updatedAt)}
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Order Tracking</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{getStatusIcon(order.orderStatus)}</span>
                            <span className={`badge ${orderService.getOrderStatusColor(order.orderStatus)} text-lg px-4 py-2`}>
                                {orderService.getOrderStatusText(order.orderStatus)}
                            </span>
                        </div>
                    </div>
                    <p className="text-gray-600 mt-2">
                        {getStatusMessage(order.orderStatus)}
                    </p>
                </div>
                
                <div className="p-6">
                    <div className="relative">
                        {steps.map((step, index) => {
                            const isCompleted = index + 1 <= currentStep;
                            const isCurrent = index + 1 === currentStep;
                            const isLast = index === steps.length - 1;
                            
                            return (
                                <div key={step.key} className="relative flex items-start">
                                    {/* Vertical line */}
                                    {!isLast && (
                                        <div 
                                            className={`absolute left-6 top-12 w-0.5 h-20 ${
                                                isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                        />
                                    )}
                                    
                                    {/* Step indicator */}
                                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 ${
                                        isCompleted 
                                            ? 'bg-green-500 border-green-500 text-white' 
                                            : isCurrent 
                                                ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                                                : 'bg-white border-gray-300 text-gray-400'
                                    }`}>
                                        {isCompleted ? (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <span className="text-sm font-bold">{index + 1}</span>
                                        )}
                                    </div>
                                    
                                    {/* Step content */}
                                    <div className="ml-6 pb-12">
                                        <h4 className={`text-lg font-medium ${
                                            isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-500'
                                        }`}>
                                            {step.label}
                                        </h4>
                                        <p className={`text-sm mt-1 ${
                                            isCompleted ? 'text-green-500' : isCurrent ? 'text-blue-500' : 'text-gray-400'
                                        }`}>
                                            {step.description}
                                        </p>
                                        
                                        {/* Show timestamp if completed */}
                                        {isCompleted && order.statusHistory && (
                                            <div className="mt-2">
                                                {(() => {
                                                    const historyItem = order.statusHistory.find(h => h.status === step.key);
                                                    if (historyItem) {
                                                        return (
                                                            <div>
                                                                <p className="text-xs text-gray-500">
                                                                    {orderService.formatDate(historyItem.timestamp)}
                                                                </p>
                                                                {historyItem.note && (
                                                                    <p className="text-xs text-gray-400 mt-1">
                                                                        {historyItem.note}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderTrackingInfo = () => {
        if (!order) return null;

        return (
            <div className="space-y-6">
                {/* Estimated Delivery */}
                {order.estimatedDelivery && order.orderStatus !== 'delivered' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📅</span>
                            <div>
                                <p className="font-semibold text-blue-700">Estimated Delivery</p>
                                <p className="text-blue-600">
                                    {orderService.formatDate(order.estimatedDelivery)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actual Delivery */}
                {order.actualDelivery && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">✅</span>
                            <div>
                                <p className="font-semibold text-green-700">Delivered On</p>
                                <p className="text-green-600">
                                    {orderService.formatDate(order.actualDelivery)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tracking Number */}
                {order.trackingNumber && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Tracking Information</h4>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tracking Number</p>
                                <p className="font-mono text-lg text-gray-900">{order.trackingNumber}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(order.trackingNumber);
                                    toast.success('Tracking number copied to clipboard');
                                }}
                                className="btn btn-outline-primary btn-sm"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                )}

                {/* Order Summary Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Order Summary</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Order Number</span>
                            <span className="font-semibold">{orderService.formatOrderNumber(order.orderNumber)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Order Date</span>
                            <span>{orderService.formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Items</span>
                            <span>{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>{orderService.formatCurrency(order.totalPrice)}</span>
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <Link 
                            to={`/orders/${order._id}`}
                            className="btn btn-outline-primary w-full"
                        >
                            View Full Order Details
                        </Link>
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Shipping Address</h4>
                    <div className="text-gray-600 space-y-1">
                        <p className="font-medium text-gray-900">
                            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                        </p>
                        {order.shippingAddress.company && (
                            <p>{order.shippingAddress.company}</p>
                        )}
                        <p>{order.shippingAddress.addressLine1}</p>
                        {order.shippingAddress.addressLine2 && (
                            <p>{order.shippingAddress.addressLine2}</p>
                        )}
                        <p>
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <LoadingSpinner message="Loading order tracking..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">Failed to load order tracking</div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={fetchOrderDetails} className="btn btn-primary">
                            Try Again
                        </button>
                        <Link to="/orders" className="btn btn-outline-primary">
                            Back to Orders
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Link to="/orders" className="hover:text-blue-600">Orders</Link>
                    <span>›</span>
                    <Link to={`/orders/${order?._id}`} className="hover:text-blue-600">
                        {order ? orderService.formatOrderNumber(order.orderNumber) : 'Order'}
                    </Link>
                    <span>›</span>
                    <span>Track Order</span>
                </div>
            </nav>

            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
                {order && (
                    <p className="text-gray-600">
                        Order {orderService.formatOrderNumber(order.orderNumber)} • 
                        Placed on {orderService.formatDate(order.createdAt)}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main tracking timeline */}
                <div className="lg:col-span-2">
                    {renderTrackingDetails()}
                </div>

                {/* Sidebar with additional info */}
                <div>
                    {renderTrackingInfo()}
                </div>
            </div>
            </div>
            <Footer />
        </div>
    );
};

export default OrderTracking;
