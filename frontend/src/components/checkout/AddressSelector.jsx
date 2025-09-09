import React from 'react';
import addressService from '../../services/addressService';

const AddressSelector = ({
    addresses,
    selectedAddressId,
    useNewAddress,
    newAddress,
    onAddressSelect,
    onUseNewAddressChange,
    onNewAddressChange,
    errors
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Shipping Address</h3>

            {/* Existing Addresses */}
            {addresses && addresses.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3">Select an address</h4>
                    <div className="space-y-3">
                        {addresses.map((address) => (
                            <div key={address._id} className="flex items-start">
                                <input
                                    type="radio"
                                    id={`address-${address._id}`}
                                    name="selectedAddress"
                                    value={address._id}
                                    checked={selectedAddressId === address._id && !useNewAddress}
                                    onChange={() => {
                                        onAddressSelect(address._id);
                                        onUseNewAddressChange(false);
                                    }}
                                    className="mt-1 mr-3"
                                />
                                <label htmlFor={`address-${address._id}`} className="flex-1 cursor-pointer">
                                    <div className="p-3 border rounded-md hover:bg-gray-50">
                                        <p className="font-medium">{addressService.getFullName(address)}</p>
                                        <p className="text-gray-600 text-sm">{addressService.formatAddress(address)}</p>
                                        {address.phone && (
                                            <p className="text-gray-600 text-sm">Phone: {address.phone}</p>
                                        )}
                                        {address.isDefault && (
                                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Use New Address Option */}
            <div className="mb-6">
                <div className="flex items-center">
                    <input
                        type="radio"
                        id="newAddress"
                        name="selectedAddress"
                        checked={useNewAddress}
                        onChange={() => onUseNewAddressChange(true)}
                        className="mr-3"
                    />
                    <label htmlFor="newAddress" className="font-medium text-gray-700">
                        Use a new address
                    </label>
                </div>
            </div>

            {/* New Address Form */}
            {useNewAddress && (
                <div className="border-t pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name *
                            </label>
                            <input
                                type="text"
                                value={newAddress.firstName}
                                onChange={(e) => onNewAddressChange('firstName', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md ${
                                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.firstName && (
                                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                value={newAddress.lastName}
                                onChange={(e) => onNewAddressChange('lastName', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md ${
                                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.lastName && (
                                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company (Optional)
                            </label>
                            <input
                                type="text"
                                value={newAddress.company}
                                onChange={(e) => onNewAddressChange('company', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address Line 1 *
                            </label>
                            <input
                                type="text"
                                value={newAddress.addressLine1}
                                onChange={(e) => onNewAddressChange('addressLine1', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md ${
                                    errors.addressLine1 ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.addressLine1 && (
                                <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address Line 2 (Optional)
                            </label>
                            <input
                                type="text"
                                value={newAddress.addressLine2}
                                onChange={(e) => onNewAddressChange('addressLine2', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                City *
                            </label>
                            <input
                                type="text"
                                value={newAddress.city}
                                onChange={(e) => onNewAddressChange('city', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md ${
                                    errors.city ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.city && (
                                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                State *
                            </label>
                            <select
                                value={newAddress.state}
                                onChange={(e) => onNewAddressChange('state', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md ${
                                    errors.state ? 'border-red-300' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Select State</option>
                                {addressService.getUSStates().map(state => (
                                    <option key={state.code} value={state.name}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                            {errors.state && (
                                <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Postal Code *
                            </label>
                            <input
                                type="text"
                                value={newAddress.postalCode}
                                onChange={(e) => onNewAddressChange('postalCode', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md ${
                                    errors.postalCode ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.postalCode && (
                                <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country *
                            </label>
                            <select
                                value={newAddress.country}
                                onChange={(e) => onNewAddressChange('country', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                {addressService.getCountries().map(country => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number (Optional)
                            </label>
                            <input
                                type="tel"
                                value={newAddress.phone}
                                onChange={(e) => onNewAddressChange('phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                </div>
            )}

            {errors.address && (
                <p className="text-red-500 text-sm mt-4">{errors.address}</p>
            )}
        </div>
    );
};

export default AddressSelector;
