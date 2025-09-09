const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};
        
        // Filter by role
        if (req.query.role) {
            query.role = req.query.role;
        }

        // Search by name or email
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Filter by email verification status
        if (req.query.verified !== undefined) {
            query.isEmailVerified = req.query.verified === 'true';
        }

        // Filter by registration date range
        if (req.query.startDate || req.query.endDate) {
            query.createdAt = {};
            if (req.query.startDate) {
                query.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                query.createdAt.$lte = new Date(req.query.endDate);
            }
        }

        const users = await User.find(query)
            .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);

        res.status(200).json({
            success: true,
            count: users.length,
            totalUsers,
            currentPage: page,
            totalPages,
            users
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users'
        });
    }
};

// @desc    Get single user (Admin only)
// @route   GET /api/users/:id
// @access  Private (Admin)
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user statistics
        const userStats = await Promise.all([
            Order.countDocuments({ user: user._id }),
            Order.aggregate([
                { $match: { user: user._id } },
                { $group: { _id: null, totalSpent: { $sum: '$totalPrice' } } }
            ]),
            Product.countDocuments({ seller: user._id }),
            Order.findOne({ user: user._id }).sort({ createdAt: -1 })
        ]);

        const stats = {
            totalOrders: userStats[0],
            totalSpent: userStats[1][0]?.totalSpent || 0,
            totalProducts: userStats[2],
            lastOrder: userStats[3]
        };

        res.status(200).json({
            success: true,
            user: {
                ...user.toObject(),
                stats
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user'
        });
    }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
    try {
        const { name, email, role, phone, address, isEmailVerified } = req.body;

        // Check if user exists
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if email is already taken by another user
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already taken'
                });
            }
        }

        // Update fields
        const fieldsToUpdate = {};
        if (name) fieldsToUpdate.name = name;
        if (email) fieldsToUpdate.email = email;
        if (role) fieldsToUpdate.role = role;
        if (phone) fieldsToUpdate.phone = phone;
        if (address) fieldsToUpdate.address = address;
        if (isEmailVerified !== undefined) fieldsToUpdate.isEmailVerified = isEmailVerified;

        user = await User.findByIdAndUpdate(
            req.params.id,
            fieldsToUpdate,
            {
                new: true,
                runValidators: true
            }
        ).select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken');

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating user'
        });
    }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        // Check if user has active orders
        const activeOrders = await Order.countDocuments({
            user: user._id,
            orderStatus: { $in: ['processing', 'confirmed', 'shipped', 'out_for_delivery'] }
        });

        if (activeOrders > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete user with ${activeOrders} active orders`
            });
        }

        // Soft delete user products (set seller to null or inactive)
        await Product.updateMany(
            { seller: user._id },
            { isActive: false }
        );

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting user'
        });
    }
};

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats
// @access  Private (Admin)
exports.getUserStats = async (req, res, next) => {
    try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));

        const stats = await User.aggregate([
            {
                $facet: {
                    totalStats: [
                        {
                            $group: {
                                _id: null,
                                totalUsers: { $sum: 1 },
                                verifiedUsers: {
                                    $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] }
                                },
                                adminUsers: {
                                    $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
                                }
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
                                monthlyNewUsers: { $sum: 1 }
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
                                weeklyNewUsers: { $sum: 1 }
                            }
                        }
                    ],
                    roleDistribution: [
                        {
                            $group: {
                                _id: '$role',
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        const result = {
            total: stats[0].totalStats[0] || { totalUsers: 0, verifiedUsers: 0, adminUsers: 0 },
            monthly: stats[0].monthlyStats[0] || { monthlyNewUsers: 0 },
            weekly: stats[0].weeklyStats[0] || { weeklyNewUsers: 0 },
            roleDistribution: stats[0].roleDistribution.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        };

        res.status(200).json({
            success: true,
            stats: result
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user statistics'
        });
    }
};

// @desc    Get dashboard overview (Admin only)
// @route   GET /api/users/dashboard
// @access  Private (Admin)
exports.getDashboard = async (req, res, next) => {
    try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

        // Get overview statistics
        const [userStats, productStats, orderStats] = await Promise.all([
            // User statistics
            User.aggregate([
                {
                    $facet: {
                        total: [{ $count: "count" }],
                        monthly: [
                            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                            { $count: "count" }
                        ],
                        verified: [
                            { $match: { isEmailVerified: true } },
                            { $count: "count" }
                        ]
                    }
                }
            ]),

            // Product statistics
            Product.aggregate([
                {
                    $facet: {
                        total: [{ $count: "count" }],
                        active: [
                            { $match: { isActive: true } },
                            { $count: "count" }
                        ],
                        monthly: [
                            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                            { $count: "count" }
                        ]
                    }
                }
            ]),

            // Order statistics
            Order.aggregate([
                {
                    $facet: {
                        total: [{ $count: "count" }],
                        monthly: [
                            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                            { $count: "count" }
                        ],
                        totalRevenue: [
                            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
                        ],
                        monthlyRevenue: [
                            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
                        ],
                        statusDistribution: [
                            { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
                        ]
                    }
                }
            ])
        ]);

        // Format the results
        const dashboard = {
            users: {
                total: userStats[0].total[0]?.count || 0,
                monthly: userStats[0].monthly[0]?.count || 0,
                verified: userStats[0].verified[0]?.count || 0
            },
            products: {
                total: productStats[0].total[0]?.count || 0,
                active: productStats[0].active[0]?.count || 0,
                monthly: productStats[0].monthly[0]?.count || 0
            },
            orders: {
                total: orderStats[0].total[0]?.count || 0,
                monthly: orderStats[0].monthly[0]?.count || 0,
                totalRevenue: orderStats[0].totalRevenue[0]?.total || 0,
                monthlyRevenue: orderStats[0].monthlyRevenue[0]?.total || 0,
                statusDistribution: orderStats[0].statusDistribution.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        };

        // Get recent activities
        const recentOrders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('orderNumber orderStatus totalPrice createdAt');

        const recentUsers = await User.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email role createdAt isEmailVerified');

        dashboard.recentActivities = {
            recentOrders,
            recentUsers
        };

        res.status(200).json({
            success: true,
            dashboard
        });

    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard data'
        });
    }
};

// @desc    Create admin user (Super Admin only)
// @route   POST /api/users/create-admin
// @access  Private (Super Admin)
exports.createAdmin = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create admin user
        const admin = await User.create({
            name,
            email,
            password,
            role: 'admin',
            isEmailVerified: true
        });

        res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
            user: admin.getPublicProfile()
        });

    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating admin user'
        });
    }
};

// @desc    Toggle user status (Admin only)
// @route   PUT /api/users/:id/toggle-status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from deactivating themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account'
            });
        }

        // Toggle email verification status as a form of activation/deactivation
        user.isEmailVerified = !user.isEmailVerified;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.isEmailVerified ? 'activated' : 'deactivated'} successfully`,
            user: user.getPublicProfile()
        });

    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while toggling user status'
        });
    }
};
