import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Footer from '../components/layout/Footer';
import { getImageUrl } from '../utils/imageUtils';
import { toast } from 'react-hot-toast';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        limit: 10
    });

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user, pagination.currentPage]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await orderService.getUserOrders({
                page: pagination.currentPage,
                limit: pagination.limit
            });

            if (response.success) {
                setOrders(response.orders);
                setPagination(prev => ({
                    ...prev,
                    totalPages: response.totalPages,
                    totalOrders: response.totalOrders
                }));
            } else {
                throw new Error(response.message || 'Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError(error.message || 'Failed to load orders');
            toast.error(error.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            const response = await orderService.cancelOrder(orderId, 'Cancelled by customer');
            
            if (response.success) {
                toast.success('Order cancelled successfully');
                fetchOrders(); // Refresh orders list
            } else {
                throw new Error(response.message || 'Failed to cancel order');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error(error.message || 'Failed to cancel order');
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <LoadingSpinner message="Loading your orders..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">Failed to load orders</div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={fetchOrders}
                        className="btn btn-primary"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                <p className="text-gray-600">
                    {pagination.totalOrders > 0 
                        ? `You have ${pagination.totalOrders} order${pagination.totalOrders !== 1 ? 's' : ''}`
                        : 'No orders found'
                    }
                </p>
            </div>

            {orders.length === 0 ? (
                // Empty state
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
                    <Link 
                        to="/products" 
                        className="btn btn-primary"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <>
                    {/* Orders List */}
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-lg shadow-md border border-gray-200">
                                {/* Order Header */}
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Order Number</p>
                                                <p className="font-semibold text-gray-900">
                                                    {orderService.formatOrderNumber(order.orderNumber)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Order Date</p>
                                                <p className="font-medium text-gray-900">
                                                    {orderService.formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Status</p>
                                                <span className={`badge ${orderService.getOrderStatusColor(order.orderStatus)}`}>
                                                    {orderService.getOrderStatusText(order.orderStatus)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Total</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {orderService.formatCurrency(order.totalPrice)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.orderItems.slice(0, 2).map((item) => (
                                            <div key={item._id} className="flex items-center gap-4">
                                                <img
                                                    src={getImageUrl(item.image)}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded-md border border-gray-200"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-product.jpg';
                                                    }}
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 line-clamp-1">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Quantity: {item.quantity} × {orderService.formatCurrency(item.price)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {order.orderItems.length > 2 && (
                                            <p className="text-sm text-gray-600">
                                                +{order.orderItems.length - 2} more item{order.orderItems.length - 2 !== 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Order Actions */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/orders/${order._id}`}
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            View Details
                                        </Link>
                                        <Link
                                            to={`/orders/${order._id}/track`}
                                            className="btn btn-sm btn-outline-secondary"
                                        >
                                            Track Order
                                        </Link>
                                    </div>
                                    
                                    {orderService.canCancelOrder(order) && (
                                        <button
                                            onClick={() => handleCancelOrder(order._id)}
                                            className="btn btn-sm btn-outline-error"
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                    className="btn btn-outline-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        const page = i + 1;
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`btn btn-sm ${
                                                    page === pagination.currentPage 
                                                        ? 'btn-primary' 
                                                        : 'btn-outline-primary'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    className="btn btn-outline-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
            </div>
            <Footer />
        </div>
    );
};

export default Orders;
