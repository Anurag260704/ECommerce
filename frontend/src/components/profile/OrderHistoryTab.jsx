import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter,
  Search,
  Calendar,
  Eye
} from 'lucide-react';
import orderService from '../../services/orderService';
import LoadingSpinner from '../common/LoadingSpinner';
import { getImageUrl } from '../../utils/imageUtils';
import toast from 'react-hot-toast';

const OrderHistoryTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 6
  });

  // Status options for filter
  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Date filter options
  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 3 Months' },
    { value: '1year', label: 'Last Year' }
  ];

  useEffect(() => {
    fetchOrders();
  }, [pagination.currentPage, statusFilter, dateFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (dateFilter !== 'all') {
        const now = new Date();
        switch (dateFilter) {
          case '7days':
            params.startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case '30days':
            params.startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case '90days':
            params.startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case '1year':
            params.startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
            break;
        }
      }

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await orderService.getUserOrders(params);

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
        fetchOrders();
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
      case 'confirmed':
        return <Package className="h-4 w-4" />;
      case 'shipped':
      case 'out_for_delivery':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'processing':
      case 'confirmed':
        return 'badge-info';
      case 'shipped':
      case 'out_for_delivery':
        return 'badge-primary';
      case 'delivered':
        return 'badge-success';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-secondary';
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner message="Loading your orders..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
          <p className="text-gray-600">
            {pagination.totalOrders > 0 
              ? `${pagination.totalOrders} order${pagination.totalOrders !== 1 ? 's' : ''} found`
              : 'No orders found'
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input pl-10 appearance-none"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input pl-10 appearance-none"
          >
            {dateOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setDateFilter('all');
            setPagination(prev => ({ ...prev, currentPage: 1 }));
          }}
          className="btn btn-outline btn-sm"
        >
          Clear Filters
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-medium">Error loading orders</div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button 
            onClick={fetchOrders}
            className="btn btn-outline-error btn-sm mt-3"
          >
            Try Again
          </button>
        </div>
      )}

      {orders.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
              ? 'No orders match your filters' 
              : 'No orders yet'
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
              ? 'Try adjusting your filters to see more orders.'
              : 'Start shopping to see your orders here!'
            }
          </p>
          {!(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="p-4 bg-white border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Order</p>
                        <p className="font-semibold text-gray-900">
                          #{orderService.formatOrderNumber(order.orderNumber)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium text-gray-900">
                          {orderService.formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`badge ${getStatusColor(order.orderStatus)} inline-flex items-center gap-1`}>
                          {getStatusIcon(order.orderStatus)}
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
                <div className="p-4">
                  <div className="space-y-3">
                    {order.orderItems.slice(0, 2).map((item) => (
                      <div key={item._id} className="flex items-center gap-3">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-md border border-gray-200"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.jpg';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × {orderService.formatCurrency(item.price)}
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
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-2 justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/orders/${order._id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      <Eye className="h-3 w-3" />
                      View Details
                    </Link>
                    <Link
                      to={`/orders/${order._id}/track`}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      <Truck className="h-3 w-3" />
                      Track
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

          {loading && orders.length > 0 && (
            <div className="mt-4 text-center">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderHistoryTab;
