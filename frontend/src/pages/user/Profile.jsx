import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Save, 
  X, 
  Camera,
  ArrowLeft,
  Settings,
  Package,
  Heart,
  CreditCard
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import Footer from '../../components/layout/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OrderHistoryTab from '../../components/profile/OrderHistoryTab';
import AddressesTab from '../../components/profile/AddressesTab';
import PaymentMethodsTab from '../../components/profile/PaymentMethodsTab';
import WishlistTab from '../../components/profile/WishlistTab';
import SettingsTab from '../../components/profile/SettingsTab';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, loading } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || ''
      }
    }
  });

  const tabs = [
    { id: 'profile', name: 'Profile Info', icon: User },
    { id: 'orders', name: 'Order History', icon: Package },
    { id: 'addresses', name: 'Addresses', icon: MapPin },
    { id: 'payment', name: 'Payment Methods', icon: CreditCard },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const onSubmit = async (data) => {
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
          <Link to="/login" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
              <p className="text-gray-600">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 lg:mb-0">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-semibold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <button className="absolute bottom-0 right-0 p-1 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50">
                    <Camera className="h-3 w-3 text-gray-600" />
                  </button>
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Profile Info Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-outline btn-sm"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSubmit(onSubmit)}
                          disabled={loading}
                          className="btn btn-primary btn-sm"
                        >
                          {loading ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="btn btn-outline btn-sm"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        {isEditing ? (
                          <input
                            {...register('firstName', { required: 'First name is required' })}
                            className="input"
                            placeholder="Enter your first name"
                          />
                        ) : (
                          <div className="flex items-center p-3 bg-gray-50 rounded-md">
                            <User className="h-4 w-4 text-gray-400 mr-3" />
                            <span>{user.firstName}</span>
                          </div>
                        )}
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        {isEditing ? (
                          <input
                            {...register('lastName', { required: 'Last name is required' })}
                            className="input"
                            placeholder="Enter your last name"
                          />
                        ) : (
                          <div className="flex items-center p-3 bg-gray-50 rounded-md">
                            <User className="h-4 w-4 text-gray-400 mr-3" />
                            <span>{user.lastName}</span>
                          </div>
                        )}
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        {isEditing ? (
                          <input
                            {...register('email', {
                              required: 'Email is required',
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                              }
                            })}
                            type="email"
                            className="input"
                            placeholder="Enter your email"
                          />
                        ) : (
                          <div className="flex items-center p-3 bg-gray-50 rounded-md">
                            <Mail className="h-4 w-4 text-gray-400 mr-3" />
                            <span>{user.email}</span>
                          </div>
                        )}
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        {isEditing ? (
                          <input
                            {...register('phone')}
                            type="tel"
                            className="input"
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <div className="flex items-center p-3 bg-gray-50 rounded-md">
                            <Phone className="h-4 w-4 text-gray-400 mr-3" />
                            <span>{user.phone || 'Not provided'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                          </label>
                          {isEditing ? (
                            <input
                              {...register('address.street')}
                              className="input"
                              placeholder="Enter your street address"
                            />
                          ) : (
                            <div className="flex items-center p-3 bg-gray-50 rounded-md">
                              <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                              <span>{user.address?.street || 'Not provided'}</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City
                            </label>
                            {isEditing ? (
                              <input
                                {...register('address.city')}
                                className="input"
                                placeholder="City"
                              />
                            ) : (
                              <div className="p-3 bg-gray-50 rounded-md">
                                <span>{user.address?.city || 'Not provided'}</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              State
                            </label>
                            {isEditing ? (
                              <input
                                {...register('address.state')}
                                className="input"
                                placeholder="State"
                              />
                            ) : (
                              <div className="p-3 bg-gray-50 rounded-md">
                                <span>{user.address?.state || 'Not provided'}</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              ZIP Code
                            </label>
                            {isEditing ? (
                              <input
                                {...register('address.zipCode')}
                                className="input"
                                placeholder="ZIP Code"
                              />
                            ) : (
                              <div className="p-3 bg-gray-50 rounded-md">
                                <span>{user.address?.zipCode || 'Not provided'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Order History Tab */}
              {activeTab === 'orders' && <OrderHistoryTab />}
              
              {/* Addresses Tab */}
              {activeTab === 'addresses' && <AddressesTab />}
              
              {/* Payment Methods Tab */}
              {activeTab === 'payment' && <PaymentMethodsTab />}
              
              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && <WishlistTab />}
              
              {/* Settings Tab */}
              {activeTab === 'settings' && <SettingsTab />}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
