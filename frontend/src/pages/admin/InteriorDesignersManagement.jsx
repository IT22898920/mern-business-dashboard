import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, Edit, Trash2, Eye, UserCheck, 
  UserX, Mail, Phone, MapPin, Star, Calendar, Clock, DollarSign,
  X, Check, AlertCircle
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import interiorDesignerService from '../../services/interiorDesignerService';
import { userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const InteriorDesignersManagement = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  // State management
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [registeredDesigners, setRegisteredDesigners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDesigner, setEditingDesigner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Sri Lanka'
    },
    experience: '',
    age: '',
    phone: '',
    specialization: [],
    bio: '',
    hourlyRate: '',
    languages: []
  });

  const [formErrors, setFormErrors] = useState({});

  // Load data on component mount
  useEffect(() => {
    fetchDesigners();
    fetchStats();
    fetchRegisteredDesigners();
  }, [currentPage, searchTerm, filter]);

  // Fetch designers with pagination and filters
  const fetchDesigners = async () => {
    try {
      setLoading(true);
      const response = await interiorDesignerService.getAllDesigners({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        filter: filter
      });
      
      if (response.success) {
        setDesigners(response.data.designers);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching designers:', error);
      toast.error('Failed to fetch designers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch designer statistics
  const fetchStats = async () => {
    try {
      const response = await interiorDesignerService.getDesignerStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch registered designers from Users collection (role: interior_designer)
  const fetchRegisteredDesigners = async () => {
    try {
      const resp = await userAPI.getUsersByRole('interior_designer');
      // Expecting resp.data to contain users list or wrap
      const users = resp.data?.data || resp.data?.users || resp.data;
      setRegisteredDesigners(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error('Error fetching registered designers:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (name === 'specialization' || name === 'languages') {
      const values = value.split(',').map(item => item.trim()).filter(item => item);
      setFormData(prev => ({
        ...prev,
        [name]: values
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      errors.name = 'Name can only contain letters and spaces';
    }
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password && !editingDesigner) {
      errors.password = 'Password is required';
    } else if (!editingDesigner && formData.password) {
      const pwd = formData.password;
      const strongPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
      if (!strongPwd.test(pwd)) {
        errors.password = 'Password must have 6+ chars, uppercase, lowercase, and a number';
      }
    }
    if (!formData.address.street.trim()) errors['address.street'] = 'Street address is required';
    if (!formData.address.city.trim()) errors['address.city'] = 'City is required';
    if (!formData.address.state.trim()) errors['address.state'] = 'State is required';
    if (!formData.address.zipCode.trim()) errors['address.zipCode'] = 'Zip code is required';
    if (!formData.experience) errors.experience = 'Experience is required';
    if (!formData.age) errors.age = 'Age is required';

    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setFormLoading(true);
      
      const designerData = {
        ...formData,
        experience: parseInt(formData.experience),
        age: parseInt(formData.age),
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined
      };

      let response;
      if (editingDesigner) {
        // Remove password if not provided for update
        if (!designerData.password) {
          delete designerData.password;
        }
        response = await interiorDesignerService.updateDesigner(editingDesigner._id, designerData);
      } else {
        // Use user registration flow with interior_designer role
        const regResult = await register({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          role: 'interior_designer'
        });
        response = { success: regResult.success };
      }

      if (response.success) {
        toast.success(editingDesigner ? 'Designer updated successfully' : 'Designer created and logged in');
        setShowForm(false);
        setEditingDesigner(null);
        resetForm();
        fetchDesigners();
        fetchStats();

        // After creating via registration, navigate to designer dashboard
        if (!editingDesigner) {
          navigate('/designer/dashboard', { replace: true });
        }
      }
    } catch (error) {
      console.error('Error saving designer:', error);
      toast.error(error.response?.data?.message || 'Failed to save designer');
    } finally {
      setFormLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Sri Lanka'
      },
      experience: '',
      age: '',
      phone: '',
      specialization: [],
      bio: '',
      hourlyRate: '',
      languages: []
    });
    setFormErrors({});
  };

  // Handle edit designer
  const handleEdit = (designer) => {
    setEditingDesigner(designer);
    setFormData({
      name: designer.name || '',
      email: designer.email || '',
      password: '',
      address: {
        street: designer.address?.street || '',
        city: designer.address?.city || '',
        state: designer.address?.state || '',
        zipCode: designer.address?.zipCode || '',
        country: designer.address?.country || 'Sri Lanka'
      },
      experience: designer.experience || '',
      age: designer.age || '',
      phone: designer.phone || '',
      specialization: designer.specialization || [],
      bio: designer.bio || '',
      hourlyRate: designer.hourlyRate || '',
      languages: designer.languages || []
    });
    setShowForm(true);
  };

  // Handle delete designer
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this designer?')) {
      try {
        const response = await interiorDesignerService.deleteDesigner(id);
        if (response.success) {
          toast.success('Designer deleted successfully');
          fetchDesigners();
          fetchStats();
        }
      } catch (error) {
        console.error('Error deleting designer:', error);
        toast.error('Failed to delete designer');
      }
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id) => {
    try {
      const response = await interiorDesignerService.toggleDesignerStatus(id);
      if (response.success) {
        toast.success(response.message);
        fetchDesigners();
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update designer status');
    }
  };

  // Close form
  const closeForm = () => {
    setShowForm(false);
    setEditingDesigner(null);
    resetForm();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="w-8 h-8 mr-3 text-[#9c7c38]" />
              Interior Designers Management
            </h1>
            <p className="text-gray-600 mt-2">Manage interior designers in your system</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#9c7c38] text-white px-6 py-3 rounded-lg hover:bg-[#8a6d32] transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Designer</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Designers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
              <Users className="w-8 h-8 text-[#9c7c38]" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Designers</p>
                <p className="text-2xl font-bold text-green-600">{stats.active || 0}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified Designers</p>
                <p className="text-2xl font-bold text-blue-600">{stats.verified || 0}</p>
              </div>
              <Check className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-purple-600">{stats.newThisMonth || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Registered Designers (from Users) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Registered Designers (Users)</h2>
            <button
              onClick={fetchRegisteredDesigners}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
          {registeredDesigners.length === 0 ? (
            <p className="text-gray-600">No registered designers found in Users.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {registeredDesigners.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{u.name}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">{u.role}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {u.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search designers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38]"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38]"
              >
                <option value="all">All Designers</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="verified">Verified Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Designers List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9c7c38] mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading designers...</p>
            </div>
          ) : designers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No designers found</p>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Designer</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Contact</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Experience</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {designers.map((designer) => (
                      <tr key={designer._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-[#9c7c38] rounded-full flex items-center justify-center text-white font-bold">
                              {designer.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <p className="font-medium text-gray-900">{designer.name}</p>
                              <p className="text-sm text-gray-500">Age: {designer.age}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-4 h-4 mr-2" />
                              {designer.email}
                            </div>
                            {designer.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-4 h-4 mr-2" />
                                {designer.phone}
                              </div>
                            )}
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              {designer.address?.city}, {designer.address?.state}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{designer.experience} years</p>
                            {designer.hourlyRate && (
                              <p className="text-sm text-gray-500">${designer.hourlyRate}/hr</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              designer.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {designer.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {designer.isVerified && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Verified
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(designer)}
                              className="p-2 text-gray-600 hover:text-[#9c7c38] transition-colors"
                              title="Edit designer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(designer._id)}
                              className={`p-2 transition-colors ${
                                designer.isActive 
                                  ? 'text-green-600 hover:text-green-700' 
                                  : 'text-red-600 hover:text-red-700'
                              }`}
                              title={designer.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {designer.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete(designer._id)}
                              className="p-2 text-red-600 hover:text-red-700 transition-colors"
                              title="Delete designer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.total)} of {pagination.total} designers
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-2 text-sm text-gray-700">
                      Page {currentPage} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                      disabled={currentPage === pagination.pages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Add/Edit Designer Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingDesigner ? 'Edit Designer' : 'Add New Designer'}
                  </h2>
                  <button
                    onClick={closeForm}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38] ${
                          formErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter designer name"
                      />
                      {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38] ${
                          formErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter email address"
                      />
                      {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password {editingDesigner ? '(leave blank to keep current)' : '*'}
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38] ${
                          formErrors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter password"
                      />
                      {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38]"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        min="18"
                        max="80"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38] ${
                          formErrors.age ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter age"
                      />
                      {formErrors.age && <p className="text-red-500 text-sm mt-1">{formErrors.age}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years) *</label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        min="0"
                        max="50"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38] ${
                          formErrors.experience ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter years of experience"
                      />
                      {formErrors.experience && <p className="text-red-500 text-sm mt-1">{formErrors.experience}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate ($)</label>
                      <input
                        type="number"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38]"
                        placeholder="Enter hourly rate"
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38] ${
                          formErrors['address.street'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter street address"
                      />
                      {formErrors['address.street'] && <p className="text-red-500 text-sm mt-1">{formErrors['address.street']}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38] ${
                            formErrors['address.city'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter city"
                        />
                        {formErrors['address.city'] && <p className="text-red-500 text-sm mt-1">{formErrors['address.city']}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38] ${
                            formErrors['address.state'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter state"
                        />
                        {formErrors['address.state'] && <p className="text-red-500 text-sm mt-1">{formErrors['address.state']}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code *</label>
                        <input
                          type="text"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38] ${
                            formErrors['address.zipCode'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter zip code"
                        />
                        {formErrors['address.zipCode'] && <p className="text-red-500 text-sm mt-1">{formErrors['address.zipCode']}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <input
                          type="text"
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38]"
                          placeholder="Enter country"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specialization (comma-separated)</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization.join(', ')}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38]"
                        placeholder="e.g., Residential, Commercial, Kitchen Design"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Languages (comma-separated)</label>
                      <input
                        type="text"
                        name="languages"
                        value={formData.languages.join(', ')}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38]"
                        placeholder="e.g., English, Sinhala, Tamil"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c7c38] focus:border-[#9c7c38]"
                        placeholder="Enter designer bio"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-6 py-2 bg-[#9c7c38] text-white rounded-lg hover:bg-[#8a6d32] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {formLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    <span>{formLoading ? 'Saving...' : editingDesigner ? 'Update Designer' : 'Create Designer'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default InteriorDesignersManagement;
