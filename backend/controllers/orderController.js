const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            shippingAddress,
            paymentMethod,
            paymentInfo = {},
            orderNotes,
            taxPrice = 0,
            shippingPrice = 0,
            discountAmount = 0
        } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        
        if (!cart || cart.isEmpty) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Validate cart items and check stock
        const invalidItems = await cart.validateItems();
        if (invalidItems.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Some items in cart are invalid or out of stock',
                invalidItems
            });
        }

        // Prepare order items
        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            name: item.product.name,
            image: item.product.images[0]?.url || '',
            price: item.price,
            quantity: item.quantity
        }));

        // Calculate prices
        const itemsPrice = cart.totalPrice;
        const totalPrice = itemsPrice + taxPrice + shippingPrice - discountAmount;

        // Prepare payment info
        const orderPaymentInfo = {
            method: paymentMethod,
            status: paymentMethod === 'cash_on_delivery' ? 'pending' : paymentInfo.status || 'pending',
            amount: totalPrice,
            transactionId: paymentInfo.transactionId,
            paidAt: paymentInfo.status === 'completed' ? new Date() : undefined
        };

        // Create order
        const order = await Order.create({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentInfo: orderPaymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            discountAmount,
            totalPrice,
            orderNotes
        });

        // Update product stock
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(
                item.product._id,
                { $inc: { stock: -item.quantity } },
                { new: true }
            );
        }

        // Clear cart after successful order
        cart.clearCart();
        await cart.save();

        // Populate order details for response
        await order.populate('user', 'name email');

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating order'
        });
    }
};

// @desc    Get all orders for user
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find({ user: req.user._id })
            .populate('orderItems.product', 'name images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalOrders = await Order.countDocuments({ user: req.user._id });
        const totalPages = Math.ceil(totalOrders / limit);

        res.status(200).json({
            success: true,
            count: orders.length,
            totalOrders,
            currentPage: page,
            totalPages,
            orders
        });

    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching orders'
        });
    }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('orderItems.product', 'name images');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns the order or is admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching order'
        });
    }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res, next) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { status, note = '', trackingNumber } = req.body;

        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order status with history
        order.updateStatus(status, note);

        // Set tracking number if provided
        if (trackingNumber) {
            order.trackingNumber = trackingNumber;
        }

        // Set estimated delivery for shipped orders
        if (status === 'shipped' && !order.estimatedDelivery) {
            const estimatedDelivery = new Date();
            estimatedDelivery.setDate(estimatedDelivery.getDate() + 7); // 7 days from now
            order.estimatedDelivery = estimatedDelivery;
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating order status'
        });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns the order or is admin
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }

        // Check if order can be cancelled
        if (!order.canBeCancelled()) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            });
        }

        // Update order status
        order.updateStatus('cancelled', req.body.reason || 'Cancelled by user');

        // Restore product stock
        for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } },
                { new: true }
            );
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });

    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while cancelling order'
        });
    }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private (Admin)
exports.getAllOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};
        
        // Filter by status
        if (req.query.status) {
            query.orderStatus = req.query.status;
        }

        // Filter by date range
        if (req.query.startDate || req.query.endDate) {
            query.createdAt = {};
            if (req.query.startDate) {
                query.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                query.createdAt.$lte = new Date(req.query.endDate);
            }
        }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalOrders = await Order.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / limit);

        // Calculate statistics
        const stats = await Order.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPrice' },
                    averageOrderValue: { $avg: '$totalPrice' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: orders.length,
            totalOrders,
            currentPage: page,
            totalPages,
            stats: stats[0] || { totalRevenue: 0, averageOrderValue: 0, totalOrders: 0 },
            orders
        });

    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching orders'
        });
    }
};

// @desc    Get order statistics (Admin only)
// @route   GET /api/orders/admin/stats
// @access  Private (Admin)
exports.getOrderStats = async (req, res, next) => {
    try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));

        // Get order statistics
        const stats = await Order.aggregate([
            {
                $facet: {
                    totalStats: [
                        {
                            $group: {
                                _id: null,
                                totalOrders: { $sum: 1 },
                                totalRevenue: { $sum: '$totalPrice' },
                                averageOrderValue: { $avg: '$totalPrice' }
                            }
                        }
                    ],
                    monthlyStats: [
                        {
                            $match: {
                                createdAt: { $gte: thirtyDaysAgo }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                monthlyOrders: { $sum: 1 },
                                monthlyRevenue: { $sum: '$totalPrice' }
                            }
                        }
                    ],
                    weeklyStats: [
                        {
                            $match: {
                                createdAt: { $gte: sevenDaysAgo }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                weeklyOrders: { $sum: 1 },
                                weeklyRevenue: { $sum: '$totalPrice' }
                            }
                        }
                    ],
                    statusStats: [
                        {
                            $group: {
                                _id: '$orderStatus',
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        const result = {
            total: stats[0].totalStats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
            monthly: stats[0].monthlyStats[0] || { monthlyOrders: 0, monthlyRevenue: 0 },
            weekly: stats[0].weeklyStats[0] || { weeklyOrders: 0, weeklyRevenue: 0 },
            byStatus: stats[0].statusStats.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        };

        res.status(200).json({
            success: true,
            stats: result
        });

    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching order statistics'
        });
    }
};

// @desc    Process refund (Admin only)
// @route   POST /api/orders/:id/refund
// @access  Private (Admin)
exports.processRefund = async (req, res, next) => {
    try {
        const { refundAmount, refundReason } = req.body;

        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update payment info
        order.paymentInfo.status = 'refunded';
        order.updateStatus('returned', `Refund processed: ${refundReason}`);

        // Restore product stock
        for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } },
                { new: true }
            );
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            order
        });

    } catch (error) {
        console.error('Process refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing refund'
        });
    }
};
