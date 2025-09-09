const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Address = require('../models/Address');
const { validationResult } = require('express-validator');

// @desc    Create new order from cart
// @route   POST /api/checkout/create-order
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        console.log('Received checkout data:', JSON.stringify(req.body, null, 2));
        
        // Custom validation
        const validationErrors = [];
        
        // Validate payment method
        const validPaymentMethods = ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'];
        if (!req.body.paymentMethod) {
            validationErrors.push({
                field: 'paymentMethod',
                message: 'Payment method is required'
            });
        } else if (!validPaymentMethods.includes(req.body.paymentMethod)) {
            validationErrors.push({
                field: 'paymentMethod',
                message: 'Invalid payment method'
            });
        }
        
        // Validate order notes length
        if (req.body.orderNotes && req.body.orderNotes.length > 500) {
            validationErrors.push({
                field: 'orderNotes',
                message: 'Order notes cannot exceed 500 characters'
            });
        }
        
        if (validationErrors.length > 0) {
            console.log('Custom validation errors:', validationErrors);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const {
            shippingAddressId,
            paymentMethod,
            orderNotes,
            useNewAddress,
            newAddress
        } = req.body;

        // Get user's cart
        console.log('Fetching cart for user:', req.user._id);
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            console.log('Cart not found or empty');
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }
        console.log('Cart found with', cart.items.length, 'items');

        // Validate cart items and check stock
        const orderItems = [];
        let itemsPrice = 0;

        for (const cartItem of cart.items) {
            const product = await Product.findById(cartItem.product._id);
            
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${cartItem.product.name} no longer exists`
                });
            }

            if (!product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${cartItem.product.name} is no longer available`
                });
            }

            if (product.stock < cartItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${cartItem.product.name}. Only ${product.stock} available`
                });
            }

            const orderItem = {
                product: product._id,
                name: product.name,
                image: product.images[0],
                price: product.discountPrice || product.price,
                quantity: cartItem.quantity
            };

            orderItems.push(orderItem);
            itemsPrice += orderItem.price * orderItem.quantity;
        }

        // Validate and get shipping address
        let shippingAddress;
        if (useNewAddress && newAddress) {
            // Validate new address fields
            const requiredFields = ['firstName', 'lastName', 'addressLine1', 'city', 'state', 'postalCode', 'country'];
            const missingFields = [];
            
            for (const field of requiredFields) {
                if (!newAddress[field] || !newAddress[field].toString().trim()) {
                    missingFields.push(field);
                }
            }
            
            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required address fields: ${missingFields.join(', ')}`,
                    errors: missingFields.map(field => ({
                        field: `newAddress.${field}`,
                        message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
                    }))
                });
            }
            
            shippingAddress = {
                firstName: newAddress.firstName.trim(),
                lastName: newAddress.lastName.trim(),
                company: newAddress.company ? newAddress.company.trim() : '',
                addressLine1: newAddress.addressLine1.trim(),
                addressLine2: newAddress.addressLine2 ? newAddress.addressLine2.trim() : '',
                city: newAddress.city.trim(),
                state: newAddress.state.trim(),
                postalCode: newAddress.postalCode.trim(),
                country: newAddress.country.trim(),
                phone: newAddress.phone ? newAddress.phone.trim() : ''
            };
        } else if (shippingAddressId) {
            const address = await Address.findById(shippingAddressId);
            if (!address || address.user.toString() !== req.user._id.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid shipping address'
                });
            }
            shippingAddress = {
                firstName: address.firstName,
                lastName: address.lastName,
                company: address.company,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                city: address.city,
                state: address.state,
                postalCode: address.postalCode,
                country: address.country,
                phone: address.phone
            };
        } else {
            return res.status(400).json({
                success: false,
                message: 'Shipping address is required'
            });
        }

        // Calculate prices
        const taxRate = 0.1; // 10% tax
        const taxPrice = Math.round(itemsPrice * taxRate * 100) / 100;
        const shippingPrice = itemsPrice >= 100 ? 0 : 10; // Free shipping over $100
        const totalPrice = itemsPrice + taxPrice + shippingPrice;

        // Create order
        console.log('Creating order with data:', {
            orderItems: orderItems.length + ' items',
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            orderNotes: orderNotes || 'none'
        });
        
        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentInfo: {
                method: paymentMethod,
                status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
                amount: totalPrice
            },
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            orderNotes: orderNotes || '',
            orderStatus: 'processing'
        });
        
        console.log('Order object created successfully');

        // Process payment based on method
        try {
            console.log(`Processing payment for method: ${paymentMethod}`);
            let paymentResult;
            
            if (paymentMethod === 'cash_on_delivery') {
                console.log('Processing Cash on Delivery payment');
                paymentResult = {
                    success: true,
                    transactionId: `COD-${Date.now()}`,
                    status: 'pending'
                };
                console.log('COD Payment result:', paymentResult);
            } else {
                console.log('Processing other payment method');
                // For demo purposes, simulate payment processing
                // In production, integrate with actual payment gateway
                paymentResult = await processPayment(paymentMethod, totalPrice, req.body.paymentDetails);
                console.log('Other payment result:', paymentResult);
            }

            if (paymentResult.success) {
                console.log('Payment successful, updating order...');
                order.paymentInfo.transactionId = paymentResult.transactionId;
                order.paymentInfo.status = paymentResult.status;
                if (paymentResult.status === 'completed') {
                    order.paymentInfo.paidAt = new Date();
                }

                console.log('Saving order to database...');
                await order.save();
                console.log('Order saved successfully with ID:', order._id);

                // Update product stock
                for (const cartItem of cart.items) {
                    await Product.findByIdAndUpdate(
                        cartItem.product._id,
                        { $inc: { stock: -cartItem.quantity } },
                        { new: true }
                    );
                }

                // Clear user's cart
                cart.items = [];
                cart.totalItems = 0;
                cart.totalPrice = 0;
                await cart.save();

                // Set estimated delivery (5-7 business days)
                const estimatedDelivery = new Date();
                estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
                order.estimatedDelivery = estimatedDelivery;
                await order.save();

                res.status(201).json({
                    success: true,
                    message: 'Order created successfully',
                    order: {
                        orderNumber: order.orderNumber,
                        _id: order._id,
                        totalPrice: order.totalPrice,
                        orderStatus: order.orderStatus,
                        estimatedDelivery: order.estimatedDelivery,
                        paymentStatus: order.paymentInfo.status
                    }
                });

            } else {
                return res.status(400).json({
                    success: false,
                    message: paymentResult.message || 'Payment processing failed'
                });
            }

        } catch (paymentError) {
            console.error('Payment processing error:', paymentError);
            return res.status(500).json({
                success: false,
                message: 'Payment processing failed'
            });
        }

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating order'
        });
    }
};

// @desc    Process payment (mock implementation)
// @route   Helper function
const processPayment = async (method, amount, paymentDetails) => {
    try {
        // Mock payment processing - replace with actual payment gateway integration
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        // Simulate random payment success/failure for demo
        const isSuccess = Math.random() > 0.1; // 90% success rate
        
        if (isSuccess) {
            return {
                success: true,
                transactionId: `TXN-${method.toUpperCase()}-${Date.now()}`,
                status: 'completed',
                message: 'Payment processed successfully'
            };
        } else {
            return {
                success: false,
                message: 'Payment declined by bank'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: 'Payment processing error'
        };
    }
};

// @desc    Get checkout summary
// @route   GET /api/checkout/summary
// @access  Private
exports.getCheckoutSummary = async (req, res) => {
    try {
        // Get user's cart
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Validate cart items and calculate totals
        let itemsPrice = 0;
        const validItems = [];

        for (const cartItem of cart.items) {
            const product = await Product.findById(cartItem.product._id);
            
            if (product && product.isActive && product.stock >= cartItem.quantity) {
                const price = product.discountPrice || product.price;
                validItems.push({
                    product: {
                        _id: product._id,
                        name: product.name,
                        images: product.images,
                        price: product.price,
                        discountPrice: product.discountPrice
                    },
                    quantity: cartItem.quantity,
                    price,
                    subtotal: price * cartItem.quantity
                });
                itemsPrice += price * cartItem.quantity;
            }
        }

        const taxRate = 0.1;
        const taxPrice = Math.round(itemsPrice * taxRate * 100) / 100;
        const shippingPrice = itemsPrice >= 100 ? 0 : 10;
        const totalPrice = itemsPrice + taxPrice + shippingPrice;

        // Get user's addresses
        const addresses = await Address.find({ 
            user: req.user._id, 
            isActive: true 
        }).sort({ isDefault: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            summary: {
                items: validItems,
                itemsCount: validItems.length,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                shippingThreshold: 100,
                addresses
            }
        });

    } catch (error) {
        console.error('Get checkout summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting checkout summary'
        });
    }
};

// @desc    Validate checkout data
// @route   POST /api/checkout/validate
// @access  Private
exports.validateCheckout = async (req, res) => {
    try {
        const { shippingAddressId, paymentMethod } = req.body;

        const errors = [];

        // Validate cart
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            errors.push({ field: 'cart', message: 'Cart is empty' });
        } else {
            // Check stock availability
            for (const cartItem of cart.items) {
                const product = await Product.findById(cartItem.product._id);
                if (!product || !product.isActive) {
                    errors.push({ 
                        field: 'stock', 
                        message: `Product ${cartItem.product.name} is no longer available` 
                    });
                } else if (product.stock < cartItem.quantity) {
                    errors.push({ 
                        field: 'stock', 
                        message: `Insufficient stock for ${cartItem.product.name}. Only ${product.stock} available` 
                    });
                }
            }
        }

        // Validate shipping address
        if (shippingAddressId) {
            const address = await Address.findById(shippingAddressId);
            if (!address || address.user.toString() !== req.user._id.toString()) {
                errors.push({ field: 'address', message: 'Invalid shipping address' });
            }
        } else {
            errors.push({ field: 'address', message: 'Shipping address is required' });
        }

        // Validate payment method
        const validPaymentMethods = ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'];
        if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
            errors.push({ field: 'payment', message: 'Invalid payment method' });
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.status(200).json({
            success: true,
            message: 'Checkout validation passed',
            valid: true
        });

    } catch (error) {
        console.error('Validate checkout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while validating checkout'
        });
    }
};

// @desc    Apply coupon code
// @route   POST /api/checkout/apply-coupon
// @access  Private
exports.applyCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body;

        // Mock coupon validation - replace with actual coupon system
        const mockCoupons = {
            'SAVE10': { discount: 10, type: 'percentage', minAmount: 50 },
            'FLAT20': { discount: 20, type: 'fixed', minAmount: 100 },
            'NEWUSER': { discount: 15, type: 'percentage', minAmount: 30 }
        };

        const coupon = mockCoupons[couponCode.toUpperCase()];
        if (!coupon) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coupon code'
            });
        }

        // Get cart total
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(400).json({
                success: false,
                message: 'Cart not found'
            });
        }

        if (cart.totalPrice < coupon.minAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount of $${coupon.minAmount} required for this coupon`
            });
        }

        let discountAmount;
        if (coupon.type === 'percentage') {
            discountAmount = Math.round(cart.totalPrice * (coupon.discount / 100) * 100) / 100;
        } else {
            discountAmount = coupon.discount;
        }

        res.status(200).json({
            success: true,
            message: 'Coupon applied successfully',
            coupon: {
                code: couponCode.toUpperCase(),
                discount: coupon.discount,
                type: coupon.type,
                discountAmount
            }
        });

    } catch (error) {
        console.error('Apply coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while applying coupon'
        });
    }
};

// @desc    Get available payment methods
// @route   GET /api/checkout/payment-methods
// @access  Private
exports.getPaymentMethods = async (req, res) => {
    try {
        const paymentMethods = [
            {
                id: 'credit_card',
                name: 'Credit Card',
                icon: 'credit-card',
                enabled: true,
                description: 'Visa, MasterCard, American Express'
            },
            {
                id: 'debit_card',
                name: 'Debit Card',
                icon: 'credit-card',
                enabled: true,
                description: 'All major debit cards accepted'
            },
            {
                id: 'paypal',
                name: 'PayPal',
                icon: 'paypal',
                enabled: true,
                description: 'Pay securely with your PayPal account'
            },
            {
                id: 'stripe',
                name: 'Stripe',
                icon: 'stripe',
                enabled: true,
                description: 'Secure payment processing'
            },
            {
                id: 'cash_on_delivery',
                name: 'Cash on Delivery',
                icon: 'cash',
                enabled: true,
                description: 'Pay when your order is delivered'
            }
        ];

        res.status(200).json({
            success: true,
            paymentMethods
        });

    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting payment methods'
        });
    }
};
