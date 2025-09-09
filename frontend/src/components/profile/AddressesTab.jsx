import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Star,
  Home,
  Building2,
  Briefcase
} from 'lucide-react';
import addressService from '../../services/addressService';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const AddressesTab = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  // Address type options
  const addressTypes = [
    { value: 'both', label: 'Both (Shipping & Billing)', icon: Home },
    { value: 'shipping', label: 'Shipping Only', icon: Briefcase },
    { value: 'billing', label: 'Billing Only', icon: Building2 }
  ];

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await addressService.getUserAddresses();

      if (response.success) {
        setAddresses(response.addresses || []);
      } else {
        throw new Error(response.message || 'Failed to fetch addresses');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setError(error.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = editingAddress 
        ? await addressService.updateAddress(editingAddress._id, data)
        : await addressService.addAddress(data);
      
      if (response.success) {
        toast.success(editingAddress ? 'Address updated successfully' : 'Address added successfully');
        await fetchAddresses();
        handleCancelForm();
      } else {
        throw new Error(response.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(error.message || 'Failed to save address');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowAddForm(true);
    
    // Pre-fill form with address data
    Object.keys(address).forEach(key => {
      setValue(key, address[key]);
    });
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const response = await addressService.deleteAddress(addressId);
      
      if (response.success) {
        toast.success('Address deleted successfully');
        await fetchAddresses();
      } else {
        throw new Error(response.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error(error.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await addressService.setDefaultAddress(addressId);
      
      if (response.success) {
        toast.success('Default address updated');
        await fetchAddresses();
      } else {
        throw new Error(response.message || 'Failed to update default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error(error.message || 'Failed to update default address');
    }
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingAddress(null);
    reset();
  };

  const getAddressTypeIcon = (type) => {
    const addressType = addressTypes.find(t => t.value === type);
    if (addressType) {
      const Icon = addressType.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Building2 className="h-4 w-4" />;
  };

  const formatFullAddress = (address) => {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.postalCode,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner message="Loading your addresses..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Manage Addresses</h2>
          <p className="text-gray-600">Add, edit, or delete your shipping addresses</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add New Address
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-medium">Error loading addresses</div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button 
            onClick={fetchAddresses}
            className="btn btn-outline-error btn-sm mt-3"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Add/Edit Address Form */}
      {showAddForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            <button
              onClick={handleCancelForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Type
              </label>
              <select
                {...register('type', { required: 'Address type is required' })}
                className="input"
              >
                <option value="">Select address type</option>
                {addressTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  {...register('firstName', { required: 'First name is required' })}
                  className="input"
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  {...register('lastName', { required: 'Last name is required' })}
                  className="input"
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1
              </label>
              <input
                {...register('addressLine1', { required: 'Address line 1 is required' })}
                className="input"
                placeholder="Enter street address"
              />
              {errors.addressLine1 && (
                <p className="mt-1 text-sm text-red-600">{errors.addressLine1.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2 <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                {...register('addressLine2')}
                className="input"
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  {...register('city', { required: 'City is required' })}
                  className="input"
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                <input
                  {...register('state', { required: 'State is required' })}
                  className="input"
                  placeholder="Enter state"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP/Postal Code
                </label>
                <input
                  {...register('postalCode', { required: 'Postal code is required' })}
                  className="input"
                  placeholder="Enter ZIP code"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  {...register('country', { required: 'Country is required' })}
                  className="input"
                  placeholder="Enter country"
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="input"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                {...register('isDefault')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200"
              />
              <label className="ml-2 text-sm text-gray-700">
                Set as default address
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancelForm}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                {editingAddress ? 'Update Address' : 'Add Address'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses List */}
      {addresses.length === 0 && !loading ? (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses yet</h3>
          <p className="text-gray-600 mb-6">Add your first address to make checkout faster!</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`relative bg-white border rounded-lg p-4 transition-shadow hover:shadow-md ${
                address.isDefault ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-200'
              }`}
            >
              {/* Default Badge */}
              {address.isDefault && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Default
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getAddressTypeIcon(address.type)}
                  <span className="font-medium text-gray-900 capitalize">
                    {address.type || 'Address'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Edit address"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address._id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="font-medium text-gray-900">{address.firstName} {address.lastName}</p>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>{formatFullAddress(address)}</p>
                </div>
                
                {address.phone && (
                  <div className="text-sm text-gray-600">
                    <p>Phone: {address.phone}</p>
                  </div>
                )}
              </div>

              {!address.isDefault && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleSetDefault(address._id)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Set as default
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressesTab;
