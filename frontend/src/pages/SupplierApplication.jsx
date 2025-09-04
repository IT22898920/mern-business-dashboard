import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Users, 
  FileText,
  DollarSign,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Save,
  Send
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { supplierApplicationService } from '../services/supplierApplicationService';
import toast from 'react-hot-toast';

const SupplierApplication = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const hasAutoFilled = useRef(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'manufacturer',
    businessAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Sri Lanka'
    },
    contactInfo: {
      businessPhone: '',
      businessEmail: '',
      website: ''
    },
    businessDetails: {
      yearsInBusiness: '',
      numberOfEmployees: '1-10',
      annualRevenue: '',
      description: ''
    },
    productCategories: [],
    references: [],
    bankDetails: {}
  });

  const businessTypes = [
    { value: 'manufacturer', label: 'Manufacturer' },
    { value: 'wholesaler', label: 'Wholesaler' },
    { value: 'distributor', label: 'Distributor' },
    { value: 'retailer', label: 'Retailer' },
    { value: 'other', label: 'Other' }
  ];

  const employeeRanges = [
    { value: '1-10', label: '1-10' },
    { value: '11-50', label: '11-50' },
    { value: '51-200', label: '51-200' },
    { value: '201-1000', label: '201-1000' },
    { value: '1000+', label: '1000+' }
  ];

  const revenueRanges = [
    { value: 'under-100k', label: 'Under $100,000' },
    { value: '100k-500k', label: '$100,000 - $500,000' },
    { value: '500k-1m', label: '$500,000 - $1 Million' },
    { value: '1m-10m', label: '$1 Million - $10 Million' },
    { value: '10m+', label: '$10 Million+' }
  ];

  const availableCategories = [
    'Furniture',
    'Electronics',
    'Clothing & Fashion',
    'Home & Garden',
    'Sports & Outdoors',
    'Books & Media',
    'Toys & Games',
    'Health & Beauty',
    'Automotive',
    'Tools & Equipment',
    'Food & Beverages',
    'Jewelry & Accessories'
  ];


  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'supplier') {
      toast.error('You are already a supplier!');
      navigate('/supplier/dashboard');
      return;
    }

    // Auto-fill business email with user's information (only once)
    if (user.email && !hasAutoFilled.current && !formData.contactInfo.businessEmail) {
      hasAutoFilled.current = true;
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          businessEmail: user.email
        }
      }));
    }

    // Check if user already has an application
    checkExistingApplication();
  }, [user, navigate]);

  const checkExistingApplication = async () => {
    try {
      const response = await fetch('/api/supplier-applications/my-application', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.info('You already have a pending application.');
        navigate('/my-application-status');
      }
    } catch (error) {
      // No existing application, continue
    }
  };

  const handleInputChange = (section, field, value, index = null) => {
    if (section === 'references' && index !== null) {
      setFormData(prev => ({
        ...prev,
        references: prev.references.map((ref, i) => 
          i === index ? { ...ref, [field]: value } : ref
        )
      }));
    } else if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      productCategories: prev.productCategories.includes(category)
        ? prev.productCategories.filter(c => c !== category)
        : [...prev.productCategories, category]
    }));
  };


  const validateForm = () => {
    const required = [
      'businessName',
      'businessAddress.street',
      'businessAddress.city',
      'businessAddress.state',
      'businessAddress.zipCode',
      'contactInfo.businessPhone',
      'contactInfo.businessEmail',
      'businessDetails.yearsInBusiness',
      'businessDetails.description'
    ];

    for (const field of required) {
      const value = field.split('.').reduce((obj, key) => obj?.[key], formData);
      if (!value || value.toString().trim() === '') {
        const fieldName = field.split('.').pop().replace(/([A-Z])/g, ' $1').toLowerCase();
        toast.error(`${fieldName} is required`);
        return false;
      }
    }

    if (formData.productCategories.length === 0) {
      toast.error('Please select at least one product category');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await supplierApplicationService.submitApplication(formData);
      
      if (response.data.status === 'success') {
        toast.success('Supplier application submitted successfully!');
        navigate('/');
      }
    } catch (error) {
      console.error('Submit application error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit application';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 mb-4 transition-colors duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Apply to Become a Supplier
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join our supplier network and start selling your products to thousands of customers. 
              Please fill out the application form below.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Business Information */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Building2 className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Business Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange(null, 'businessName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your business name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type *
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => handleInputChange(null, 'businessType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  {businessTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Business Address */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <MapPin className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Business Address</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.businessAddress.street}
                  onChange={(e) => handleInputChange('businessAddress', 'street', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter street address"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.businessAddress.city}
                    onChange={(e) => handleInputChange('businessAddress', 'city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="City"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    value={formData.businessAddress.state}
                    onChange={(e) => handleInputChange('businessAddress', 'state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="State"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code *
                  </label>
                  <input
                    type="text"
                    value={formData.businessAddress.zipCode}
                    onChange={(e) => handleInputChange('businessAddress', 'zipCode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Zip"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  value={formData.businessAddress.country}
                  onChange={(e) => handleInputChange('businessAddress', 'country', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Country"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Phone className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Contact Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Phone *
                </label>
                <input
                  type="tel"
                  value={formData.contactInfo.businessPhone}
                  onChange={(e) => handleInputChange('contactInfo', 'businessPhone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Email *
                </label>
                <input
                  type="email"
                  value={formData.contactInfo.businessEmail}
                  onChange={(e) => handleInputChange('contactInfo', 'businessEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="business@example.com"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.contactInfo.website}
                    onChange={(e) => handleInputChange('contactInfo', 'website', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://www.yourbusiness.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Business Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years in Business *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    value={formData.businessDetails.yearsInBusiness}
                    onChange={(e) => handleInputChange('businessDetails', 'yearsInBusiness', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="5"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Employees *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    value={formData.businessDetails.numberOfEmployees}
                    onChange={(e) => handleInputChange('businessDetails', 'numberOfEmployees', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    {employeeRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Revenue
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    value={formData.businessDetails.annualRevenue}
                    onChange={(e) => handleInputChange('businessDetails', 'annualRevenue', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select revenue range</option>
                    {revenueRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description *
                </label>
                <textarea
                  rows={4}
                  value={formData.businessDetails.description}
                  onChange={(e) => handleInputChange('businessDetails', 'description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your business, what you sell, your target market, etc."
                  maxLength={1000}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.businessDetails.description.length}/1000 characters
                </p>
              </div>
            </div>
          </div>

          {/* Product Categories */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Product Categories *</h2>
            </div>
            <p className="text-gray-600 mb-4">Select the categories that best describe your products:</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableCategories.map(category => (
                <label key={category} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.productCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default SupplierApplication;