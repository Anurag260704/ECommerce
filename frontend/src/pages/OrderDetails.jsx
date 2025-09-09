import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Footer from '../components/layout/Footer';
import { getImageUrl } from '../utils/imageUtils';
import { toast } from 'react-hot-toast';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancellingOrder, setCancellingOrder] = useState(false);

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

    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            return;
        }

        try {
            setCancellingOrder(true);
            const response = await orderService.cancelOrder(orderId, 'Cancelled by customer');
            
            if (response.success) {
                toast.success('Order cancelled successfully');
                fetchOrderDetails(); // Refresh order details
            } else {
                throw new Error(response.message || 'Failed to cancel order');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error(error.message || 'Failed to cancel order');
        } finally {
            setCancellingOrder(false);
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

    const renderTrackingTimeline = () => {
        if (!order || !order.statusHistory) return null;

        const steps = [
            { key: 'processing', label: 'Processing', icon: '📋' },
            { key: 'confirmed', label: 'Confirmed', icon: '✅' },
            { key: 'shipped', label: 'Shipped', icon: '🚚' },
            { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵' },
            { key: 'delivered', label: 'Delivered', icon: '📦' }
        ];

        const currentStep = getStatusStepNumber(order.orderStatus);
        const isCancelled = order.orderStatus === 'cancelled';
        const isReturned = order.orderStatus === 'returned';

        if (isCancelled || isReturned) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 text-red-600">
                        <span className="text-2xl">❌</span>
                        <div>
                            <p className="font-semibold">
                                Order {isCancelled ? 'Cancelled' : 'Returned'}
                            </p>
                            <p className="text-sm text-red-500">
                                {orderService.formatDate(order.updatedAt)}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-6">Order Tracking</h3>
                
                <div className="relative">
                    {steps.map((step, index) => {
                        const isCompleted = index + 1 <= currentStep;
                        const isCurrent = index + 1 === currentStep;
                        
                        return (
                            <div key={step.key} className="flex items-center mb-6 last:mb-0">
                                {/* Timeline line */}
                                {index < steps.length - 1 && (
                                    <div className={`absolute left-6 top-12 w-0.5 h-16 ${
                                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                    }`} style={{ marginTop: `${index * 80}px` }} />
                                )}
                                
                                {/* Step icon */}
                                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                                    isCompleted 
                                        ? 'bg-green-500 text-white' 
                                        : isCurrent 
                                            ? 'bg-blue-500 text-white animate-pulse'
                                            : 'bg-gray-300 text-gray-600'
                                }`}>
                                    {isCompleted ? '✓' : step.icon}
                                </div>
                                
                                {/* Step content */}
                                <div className="ml-4 flex-1">
                                    <p className={`font-medium ${
                                        isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-500'
                                    }`}>
                                        {step.label}
                                    </p>
                                    
                                    {/* Show timestamp if completed */}
                                    {isCompleted && order.statusHistory && (
                                        <p className="text-sm text-gray-500">
                                            {(() => {
                                                const historyItem = order.statusHistory.find(h => h.status === step.key);
                                                return historyItem ? orderService.formatDate(historyItem.timestamp) : '';
                                            })()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Estimated Delivery */}
                {order.estimatedDelivery && order.orderStatus !== 'delivered' && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">
                            📅 Estimated Delivery: {orderService.formatDate(order.estimatedDelivery)}
                        </p>
                    </div>
                )}

                {/* Tracking Number */}
                {order.trackingNumber && (
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Tracking Number:</span> 
                            <span className="ml-2 font-mono">{order.trackingNumber}</span>
                        </p>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <LoadingSpinner message="Loading order details..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">Failed to load order details</div>
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

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="text-gray-500 text-xl mb-4">Order not found</div>
                    <Link to="/orders" className="btn btn-primary">
                        Back to Orders
                    </Link>
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
                    <span>{orderService.formatOrderNumber(order.orderNumber)}</span>
                </div>
            </nav>

            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Order {orderService.formatOrderNumber(order.orderNumber)}
                        </h1>
                        <p className="text-gray-600">
                            Placed on {orderService.formatDate(order.createdAt)}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`badge ${orderService.getOrderStatusColor(order.orderStatus)} text-lg px-4 py-2`}>
                            {orderService.getOrderStatusText(order.orderStatus)}
                        </span>
                        {orderService.canCancelOrder(order) && (
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancellingOrder}
                                className="btn btn-outline-error"
                            >
                                {cancellingOrder ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Tracking Timeline */}
                    {renderTrackingTimeline()}

                    {/* Order Items */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">Order Items ({order.orderItems.length})</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                {order.orderItems.map((item) => (
                                    <div key={item._id} className="flex items-center gap-4 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
                                        <img
                                            src={getImageUrl(item.image)}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded-md border border-gray-200"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-product.jpg';
                                            }}
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                                            <p className="text-sm text-gray-600 mb-2">
                                                Quantity: {item.quantity}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {orderService.formatCurrency(item.price)} each
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                {orderService.formatCurrency(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Items ({order.orderItems.length})</span>
                                <span>{orderService.formatCurrency(order.itemsPrice)}</span>
                            </div>
                            {order.taxPrice > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span>{orderService.formatCurrency(order.taxPrice)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span>
                                    {order.shippingPrice > 0 
                                        ? orderService.formatCurrency(order.shippingPrice) 
                                        : 'FREE'
                                    }
                                </span>
                            </div>
                            {order.discountAmount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-{orderService.formatCurrency(order.discountAmount)}</span>
                                </div>
                            )}
                            <hr className="my-3" />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{orderService.formatCurrency(order.totalPrice)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
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
                            {order.shippingAddress.phone && (
                                <p className="mt-2">📞 {order.shippingAddress.phone}</p>
                            )}
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-gray-600">Payment Method: </span>
                                <span className="font-medium">
                                    {orderService.getPaymentMethodName(order.paymentInfo.method)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Payment Status: </span>
                                <span className={`badge ${
                                    order.paymentInfo.status === 'completed' ? 'badge-success' : 
                                    order.paymentInfo.status === 'failed' ? 'badge-error' :
                                    'badge-warning'
                                }`}>
                                    {order.paymentInfo.status}
                                </span>
                            </div>
                            {order.paymentInfo.transactionId && (
                                <div>
                                    <span className="text-gray-600">Transaction ID: </span>
                                    <span className="font-mono text-sm">
                                        {order.paymentInfo.transactionId}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Notes */}
                    {order.orderNotes && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold mb-4">Order Notes</h3>
                            <p className="text-gray-600">{order.orderNotes}</p>
                        </div>
                    )}
                </div>
            </div>
            </div>
            <Footer />
        </div>
    );
};

export default OrderDetails;
