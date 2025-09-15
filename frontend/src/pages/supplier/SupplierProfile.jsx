import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  CheckCircle,
  Globe,
  FileText
} from 'lucide-react';
import SupplierLayout from '../../components/layout/SupplierLayout';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { supplierApplicationService } from '../../services/supplierApplicationService';

const SupplierProfile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [loadingApplication, setLoadingApplication] = useState(true);
  
  // Available specialty options
  const availableSpecialties = [
    'Electronics',
    'Clothing & Fashion',
    'Furniture',
    'Food & Beverages',
    'Automotive',
    'Construction Materials',
    'Medical Equipment',
    'Sports & Recreation',
    'Home & Garden',
    'Books & Media',
    'Toys & Games',
    'Beauty & Personal Care',
    'Industrial Equipment',
    'Office Supplies',
    'Pet Supplies',
    'Jewelry & Accessories',
    'Arts & Crafts',
    'Musical Instruments'
  ];
  const [profileData, setProfileData] = useState({
    // Basic Information
    companyName: '',
    contactPersonName: '',
    contactPersonTitle: '',
    email: '',
    phone: '',
    website: '',
    
    // Address Information
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    
    // Business Information
    businessLicense: '',
    taxId: '',
    establishedYear: new Date().getFullYear(),
    employeeCount: '',
    description: '',
    
    // Services & Specialties
    specialties: [],
    services: [],
    
    // Business Hours
    businessHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '15:00', closed: false },
      sunday: { open: '10:00', close: '15:00', closed: true }
    }
  });


  const [formData, setFormData] = useState(profileData);

  // Load supplier application data
  const loadApplicationData = async () => {
    try {
      setLoadingApplication(true);
      console.log('🚀 Calling supplierApplicationService.getMyApplication()...');
      
      const response = await supplierApplicationService.getMyApplication();
      console.log('📡 API Response:', response);
      
      if (response.data && response.data.status === 'success') {
        console.log('✅ Application data received:', response.data.data);
        setApplicationData(response.data.data);
        return response.data.data;
      } else {
        console.log('❌ Invalid response structure:', response);
        return null;
      }
    } catch (error) {
      console.log('⚠️  Error loading application data:', error);
      console.log('Error details:', error.response?.data || error.message);
      return null;
    } finally {
      setLoadingApplication(false);
    }
  };

  // Map application data to profile format
  const mapApplicationToProfile = (appData) => {
    if (!appData) return {};
    
    console.log('🔍 Raw productCategories:', appData.productCategories);
    
    const mappedData = {
      companyName: appData.businessName || '',
      contactPersonName: user?.name || '',
      contactPersonTitle: '', // Not in application
      email: appData.contactInfo?.businessEmail || user?.email || '',
      phone: appData.contactInfo?.businessPhone || '',
      website: appData.contactInfo?.website || '',
      address: appData.businessAddress?.street || '',
      city: appData.businessAddress?.city || '',
      state: appData.businessAddress?.state || '',
      zipCode: appData.businessAddress?.zipCode || '',
      country: appData.businessAddress?.country || '',
      businessLicense: '', // Not in application form
      taxId: '', // Not in application form  
      establishedYear: appData.businessDetails?.yearsInBusiness ? 
        new Date().getFullYear() - appData.businessDetails.yearsInBusiness : 
        new Date().getFullYear(),
      employeeCount: appData.businessDetails?.numberOfEmployees || '',
      description: appData.businessDetails?.description || '',
      specialties: appData.productCategories || [],
      services: [],
      businessHours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '10:00', close: '15:00', closed: false },
        sunday: { open: '10:00', close: '15:00', closed: true }
      }
    };
    
    console.log('🔄 Mapped specialties:', mappedData.specialties);
    return mappedData;
  };

  useEffect(() => {
    const loadProfileData = async () => {
      console.log('🔍 Loading profile data for user:', user);
      
      if (user && user.role === 'supplier') {
        // Load application data first
        console.log('📝 Loading application data...');
        const appData = await loadApplicationData();
        console.log('📊 Application data loaded:', appData);
        
        // Start with user profile data
        let updatedProfileData = {
          // Basic Information
          companyName: user?.companyName || user?.name || '',
          contactPersonName: user?.name || '',
          contactPersonTitle: user?.contactPersonTitle || '',
          email: user?.email || '',
          phone: user?.phone || '',
          website: user?.website || '',
          
          // Address Information
          address: user?.address?.street || '',
          city: user?.address?.city || '',
          state: user?.address?.state || '',
          zipCode: user?.address?.zipCode || '',
          country: user?.address?.country || '',
          
          // Business Information
          businessLicense: user?.businessLicense || '',
          taxId: user?.taxId || '',
          establishedYear: user?.establishedYear || new Date().getFullYear(),
          employeeCount: user?.employeeCount || '',
          description: user?.description || '',
          
          // Services & Specialties
          specialties: user?.specialties || [],
          services: user?.services || [],
          
          // Business Hours
          businessHours: user?.businessHours || {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '10:00', close: '15:00', closed: false },
            sunday: { open: '10:00', close: '15:00', closed: true }
          }
        };
        
        console.log('👤 User specialties from user object:', user?.specialties);

        console.log('👤 Initial user profile data:', updatedProfileData);

        // If application data exists, merge/override with application data
        if (appData) {
          const applicationProfileData = mapApplicationToProfile(appData);
          console.log('🔄 Mapped application data:', applicationProfileData);
          
          // Only use application data if profile fields are empty
          updatedProfileData = {
            ...updatedProfileData,
            // Override with application data if profile data is empty
            companyName: updatedProfileData.companyName || applicationProfileData.companyName,
            email: updatedProfileData.email || applicationProfileData.email,
            phone: updatedProfileData.phone || applicationProfileData.phone,
            website: updatedProfileData.website || applicationProfileData.website,
            address: updatedProfileData.address || applicationProfileData.address,
            city: updatedProfileData.city || applicationProfileData.city,
            state: updatedProfileData.state || applicationProfileData.state,
            zipCode: updatedProfileData.zipCode || applicationProfileData.zipCode,
            country: updatedProfileData.country || applicationProfileData.country,
            establishedYear: updatedProfileData.establishedYear !== new Date().getFullYear() ? 
              updatedProfileData.establishedYear : applicationProfileData.establishedYear,
            employeeCount: updatedProfileData.employeeCount || applicationProfileData.employeeCount,
            description: updatedProfileData.description || applicationProfileData.description,
            specialties: updatedProfileData.specialties.length > 0 ? 
              updatedProfileData.specialties : applicationProfileData.specialties
          };
          
          console.log('🎯 Final specialties:', updatedProfileData.specialties);
        }
        
        console.log('✅ Final profile data:', updatedProfileData);
        setProfileData(updatedProfileData);
        setFormData(updatedProfileData);
      }
    };

    loadProfileData();
  }, [user]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setFormData(profileData);
    setEditing(false);
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Prepare data for API
      const profileDataForApi = {
        name: formData.contactPersonName || formData.companyName,
        phone: formData.phone,
        companyName: formData.companyName,
        contactPersonTitle: formData.contactPersonTitle,
        website: formData.website,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        businessLicense: formData.businessLicense,
        taxId: formData.taxId,
        establishedYear: formData.establishedYear,
        employeeCount: formData.employeeCount,
        description: formData.description,
        specialties: formData.specialties || [],
        services: formData.services || [],
        businessHours: formData.businessHours
      };

      // Call the API
      const response = await profileService.updateProfile(profileDataForApi);
      
      if (response.status === 'success') {
        // Update local state with response data
        setProfileData(formData);
        setEditing(false);
        
        // Show success message
        alert('Profile updated successfully!');
        
        console.log('Profile updated successfully:', response.data.user);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Show user-friendly error message
      if (error.message.includes('validation')) {
        alert('Please check your input data and try again.');
      } else if (error.message.includes('authentication')) {
        alert('Session expired. Please login again.');
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const addSpecialty = (selectedSpecialty) => {
    if (selectedSpecialty && !formData.specialties.includes(selectedSpecialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...(prev.specialties || []), selectedSpecialty]
      }));
    }
  };

  const removeSpecialty = (index) => {
    setFormData(prev => ({
      ...prev,
      specialties: (prev.specialties || []).filter((_, i) => i !== index)
    }));
  };

  // Get available specialties that aren't already selected
  const getAvailableSpecialties = () => {
    return availableSpecialties.filter(specialty => 
      !(formData.specialties || []).includes(specialty)
    );
  };

  const handleServiceChange = (index, value) => {
    const newServices = [...(formData.services || [])];
    newServices[index] = value;
    setFormData(prev => ({
      ...prev,
      services: newServices
    }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...(prev.services || []), '']
    }));
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: (prev.services || []).filter((_, i) => i !== index)
    }));
  };

  const getDayName = (day) => {
    const days = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    };
    return days[day];
  };

  return (
    <SupplierLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Company Profile</h1>
              <p className="text-blue-100">Manage your supplier profile and business information</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
              <Building className="h-12 w-12" />
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-white/5 rounded-full"></div>
        </div>


        {/* Profile Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
              {!editing ? (
                <button
                  onClick={handleEdit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Company Logo and Basic Info */}
            <div className="flex items-start gap-8">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {formData.companyName ? 
                    formData.companyName.split(' ').map(word => word[0]).join('').slice(0, 2) : 
                    (user?.name ? user.name.split(' ').map(word => word[0]).join('').slice(0, 2) : 'NA')
                  }
                </div>
                {editing && (
                  <button className="absolute -bottom-2 -right-2 bg-white rounded-full p-3 shadow-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors">
                    <Camera className="h-5 w-5 text-gray-600" />
                  </button>
                )}
              </div>
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-900">{profileData.companyName || 'Company name not set'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Established Year</label>
                    {editing ? (
                      <input
                        type="number"
                        value={formData.establishedYear}
                        onChange={(e) => handleInputChange('establishedYear', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    ) : (
                      <p className="text-lg text-gray-900">{profileData.establishedYear}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Mail className="h-6 w-6 text-blue-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.contactPersonName}
                      onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profileData.contactPersonName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.contactPersonTitle}
                      onChange={(e) => handleInputChange('contactPersonTitle', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.contactPersonTitle}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  {editing ? (
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.website}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee Count</label>
                  {editing ? (
                    <select
                      value={formData.employeeCount}
                      onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="50-100">50-100</option>
                      <option value="100-500">100-500</option>
                      <option value="500+">500+</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{profileData.employeeCount}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-green-600" />
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.address}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.state}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.zipCode}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  {editing ? (
                    <select
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{profileData.country}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Building className="h-6 w-6 text-purple-600" />
                Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business License</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.businessLicense}
                      onChange={(e) => handleInputChange('businessLicense', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">{profileData.businessLicense}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.taxId}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">{profileData.taxId}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Company Description */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-indigo-600" />
                Company Description
              </h3>
              {editing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe your company, services, and what makes you unique..."
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {profileData.description || 'No company description provided yet. Click "Edit Profile" to add your company description.'}
                </p>
              )}
            </div>

            {/* Specialties & Services */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Specialties */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 overflow-visible">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Specialties</h3>
                {editing ? (
                  <div className="space-y-3">
                    {/* Selected Specialties */}
                    {(formData.specialties || []).length === 0 ? (
                      <p className="text-gray-500 text-sm mb-3">No specialties added yet. Select from dropdown to add.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(formData.specialties || []).map((specialty, index) => (
                          <div key={index} className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                            <span>{specialty}</span>
                            <button
                              onClick={() => removeSpecialty(index)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Dropdown to add new specialty */}
                    {getAvailableSpecialties().length > 0 && (
                      <div className="flex gap-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              addSpecialty(e.target.value);
                              e.target.value = ''; // Reset dropdown
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select a specialty to add...</option>
                          {getAvailableSpecialties().map((specialty) => (
                            <option key={specialty} value={specialty}>
                              {specialty}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {getAvailableSpecialties().length === 0 && (formData.specialties || []).length > 0 && (
                      <p className="text-gray-500 text-sm">All available specialties have been added.</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.specialties && profileData.specialties.length > 0 ? (
                      profileData.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                        >
                          {specialty}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No specialties added yet</p>
                    )}
                  </div>
                )}
              </div>

              {/* Services */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Services</h3>
                {editing ? (
                  <div className="space-y-3">
                    {(formData.services || []).length === 0 ? (
                      <p className="text-gray-500 text-sm mb-3">No services added yet. Click "Add Service" to start.</p>
                    ) : (
                      (formData.services || []).map((service, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={service}
                            onChange={(e) => handleServiceChange(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Enter service"
                          />
                          <button
                            onClick={() => removeService(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                    <button
                      onClick={addService}
                      className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors flex items-center gap-2"
                    >
                      <span className="text-lg">+</span>
                      Add Service
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.services && profileData.services.length > 0 ? (
                      profileData.services.map((service, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium"
                        >
                          {service}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No services added yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </SupplierLayout>
  );
};

export default SupplierProfile;