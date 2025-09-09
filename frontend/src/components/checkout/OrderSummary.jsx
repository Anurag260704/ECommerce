import React, { useState } from 'react';
import { getImageUrl } from '../../utils/imageUtils';

const OrderSummary = ({ summary, appliedCoupon, onApplyCoupon, onRemoveCoupon }) => {
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        
        try {
            setCouponLoading(true);
            await onApplyCoupon(couponCode);
            setCouponCode('');
        } catch (error) {
            // Error handled by parent component
        } finally {
            setCouponLoading(false);
        }
    };

    if (!summary) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

            {/* Order Items */}
            <div className="space-y-3 mb-6">
                {summary.items?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                        <div className="relative">
                            <img
                                src={getImageUrl(item.product.images?.[0])}
                                alt={item.product.name}
                                className="w-12 h-12 rounded-md object-cover"
                                onError={(e) => {
                                    e.target.src = '/placeholder-product.jpg';
                                }}
                            />
                            <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {item.quantity}
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                {item.product.name}
                            </p>
                            <p className="text-sm text-gray-600">
                                ${item.price} × {item.quantity}
                            </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                            ${item.subtotal?.toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Coupon Section */}
            {!appliedCoupon && (
                <div className="mb-6">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            disabled={couponLoading}
                        />
                        <button
                            onClick={handleApplyCoupon}
                            disabled={couponLoading || !couponCode.trim()}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${
                                couponLoading || !couponCode.trim()
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {couponLoading ? 'Applying...' : 'Apply'}
                        </button>
                    </div>
                </div>
            )}

            {/* Applied Coupon */}
            {appliedCoupon && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-800">
                                Coupon Applied: {appliedCoupon.code}
                            </p>
                            <p className="text-xs text-green-600">
                                Save ${appliedCoupon.discountAmount?.toFixed(2)}
                            </p>
                        </div>
                        <button
                            onClick={onRemoveCoupon}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            )}

            {/* Order Totals */}
            <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({summary.itemsCount} items)</span>
                    <span className="font-medium">${summary.itemsPrice?.toFixed(2)}</span>
                </div>

                {summary.taxPrice > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium">${summary.taxPrice?.toFixed(2)}</span>
                    </div>
                )}

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                        Shipping
                        {summary.shippingPrice === 0 && summary.itemsPrice >= summary.shippingThreshold && (
                            <span className="text-green-600 ml-1">(Free)</span>
                        )}
                    </span>
                    <span className="font-medium">
                        {summary.shippingPrice === 0 ? 'Free' : `$${summary.shippingPrice?.toFixed(2)}`}
                    </span>
                </div>

                {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                        <span className="text-green-600">Coupon Discount</span>
                        <span className="font-medium text-green-600">
                            -${appliedCoupon.discountAmount?.toFixed(2)}
                        </span>
                    </div>
                )}

                <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                        <span className="text-base font-semibold">Total</span>
                        <span className="text-base font-semibold">
                            ${(summary.totalPrice - (appliedCoupon?.discountAmount || 0))?.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Free Shipping Notice */}
            {summary.itemsPrice < summary.shippingThreshold && summary.shippingPrice > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs text-blue-800">
                        Add ${(summary.shippingThreshold - summary.itemsPrice).toFixed(2)} more for free shipping!
                    </p>
                </div>
            )}

            {/* Security Notice */}
            <div className="mt-6 flex items-center space-x-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Your payment information is secure and encrypted</span>
            </div>
        </div>
    );
};

export default OrderSummary;
