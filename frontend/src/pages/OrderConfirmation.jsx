import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OrderConfirmation = () => {
    const { orderId } = useParams();
    const { state } = useLocation();
    const { user } = useAuth();
    
    const [order, setOrder] = useState(state?.orderDetails || null);
    const [loading, setLoading] = useState(!state?.orderDetails);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!order && orderId) {
            fetchOrderDetails();
        }
    }, [orderId, order]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await orderService.getOrder(orderId);
            if (response.success) {
                setOrder(response.order);
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            setError('Unable to load order details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-4">
                        <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'We could not find your order details.'}</p>
                    <Link
                        to="/orders"
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 inline-block"
                    >
                        View All Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                    <p className="text-lg text-gray-600">
                        Thank you for your purchase, {user?.firstName || 'valued customer'}!
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Order #{order.orderNumber}
                    </p>
                </div>

                {/* Order Details Card */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                    <div className="px-6 py-4 bg-gray-50 border-b">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                order.orderStatus === 'processing' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-green-100 text-green-800'
                            }`}>
                                {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                            </span>
                        </div>
                    </div>

                    <div className="px-6 py-4">
                        {/* Order Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Order Details</h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>Order Number: <span className="font-medium">{order.orderNumber}</span></p>
                                    <p>Order Date: <span className="font-medium">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </span></p>
                                    <p>Total Amount: <span className="font-medium text-green-600">
                                        ${order.totalPrice?.toFixed(2)}
                                    </span></p>
                                    {order.estimatedDelivery && (
                                        <p>Estimated Delivery: <span className="font-medium">
                                            {new Date(order.estimatedDelivery).toLocaleDateString()}
                                        </span></p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Status</h3>
                                <div className="text-sm text-gray-600">
                                    <p className="flex items-center">
                                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                            order.paymentStatus === 'completed' 
                                                ? 'bg-green-500' 
                                                : order.paymentStatus === 'pending'
                                                ? 'bg-yellow-500'
                                                : 'bg-red-500'
                                        }`}></span>
                                        {order.paymentStatus === 'completed' && 'Payment Successful'}
                                        {order.paymentStatus === 'pending' && 'Payment Pending'}
                                        {order.paymentStatus === 'failed' && 'Payment Failed'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* What's Next */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h3>
                            <div className="text-sm text-blue-700 space-y-1">
                                <p>• You'll receive an order confirmation email shortly</p>
                                <p>• We'll send you shipping updates as your order progresses</p>
                                <p>• Your order will be delivered by {order.estimatedDelivery ? 
                                    new Date(order.estimatedDelivery).toLocaleDateString() : 
                                    'the estimated delivery date'
                                }</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/orders"
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 text-center"
                    >
                        Track Your Orders
                    </Link>
                    <Link
                        to="/products"
                        className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 text-center"
                    >
                        Continue Shopping
                    </Link>
                </div>

                {/* Customer Support */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                        Need help with your order?{' '}
                        <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-700">
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
