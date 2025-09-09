import React from 'react';

const PaymentForm = ({
    paymentMethods,
    selectedMethod,
    paymentDetails,
    onMethodSelect,
    onDetailsChange,
    errors
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Method</h3>

            {/* Payment Method Selection */}
            <div className="space-y-4 mb-6">
                {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-start">
                        <input
                            type="radio"
                            id={method.id}
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedMethod === method.id}
                            onChange={() => onMethodSelect(method.id)}
                            className="mt-1 mr-3"
                        />
                        <label htmlFor={method.id} className="flex-1 cursor-pointer">
                            <div className="p-3 border rounded-md hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{method.name}</p>
                                        <p className="text-gray-600 text-sm">{method.description}</p>
                                    </div>
                                    {method.enabled && (
                                        <span className="text-green-600 text-sm">Available</span>
                                    )}
                                </div>
                            </div>
                        </label>
                    </div>
                ))}
            </div>

            {/* Card Details Form */}
            {['credit_card', 'debit_card'].includes(selectedMethod) && (
                <div className="border-t pt-6">
                    <h4 className="text-md font-medium text-gray-700 mb-4">Card Details</h4>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Card Number *
                            </label>
                            <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                value={paymentDetails.number || ''}
                                onChange={(e) => onDetailsChange('number', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md ${
                                    errors.number ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.number && (
                                <p className="text-red-500 text-sm mt-1">{errors.number}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expiry Month *
                                </label>
                                <select
                                    value={paymentDetails.expiryMonth || ''}
                                    onChange={(e) => onDetailsChange('expiryMonth', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md ${
                                        errors.expiry ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Month</option>
                                    {Array.from({ length: 12 }, (_, i) => {
                                        const month = i + 1;
                                        return (
                                            <option key={month} value={month}>
                                                {month.toString().padStart(2, '0')}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expiry Year *
                                </label>
                                <select
                                    value={paymentDetails.expiryYear || ''}
                                    onChange={(e) => onDetailsChange('expiryYear', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md ${
                                        errors.expiry ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Year</option>
                                    {Array.from({ length: 10 }, (_, i) => {
                                        const year = new Date().getFullYear() + i;
                                        return (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>

                        {errors.expiry && (
                            <p className="text-red-500 text-sm">{errors.expiry}</p>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CVV *
                                </label>
                                <input
                                    type="text"
                                    placeholder="123"
                                    maxLength="4"
                                    value={paymentDetails.cvv || ''}
                                    onChange={(e) => onDetailsChange('cvv', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md ${
                                        errors.cvv ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                                {errors.cvv && (
                                    <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cardholder Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={paymentDetails.name || ''}
                                    onChange={(e) => onDetailsChange('name', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md ${
                                        errors.name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PayPal Notice */}
            {selectedMethod === 'paypal' && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
                    <p className="text-blue-800">
                        You will be redirected to PayPal to complete your payment.
                    </p>
                </div>
            )}

            {/* Cash on Delivery Notice */}
            {selectedMethod === 'cash_on_delivery' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
                    <p className="text-yellow-800">
                        You will pay when your order is delivered to your address.
                    </p>
                </div>
            )}

            {errors.paymentMethod && (
                <p className="text-red-500 text-sm mt-4">{errors.paymentMethod}</p>
            )}
        </div>
    );
};

export default PaymentForm;
