import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  Users, Building2, Mail, Phone, MapPin, Calendar, Star, 
  Eye, Edit, Trash2, Plus, Search, Filter, MoreVertical,
  TrendingUp, Package, Clock, CheckCircle, XCircle, 
  Award, Globe, Briefcase, FileText, Download, RefreshCw,
  Activity, Zap, Shield, UserCheck, AlertTriangle, Crown,
  Sparkles, Heart, Target, Layers, BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../components/AlertSystem';

const AllSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/role/supplier', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // Handle the response structure: data.users
        const suppliersList = Array.isArray(data.data?.users) ? data.data.users : 
                              Array.isArray(data.users) ? data.users : 
                              Array.isArray(data.data) ? data.data : 
                              Array.isArray(data) ? data : [];
        setSuppliers(suppliersList);
        showSuccess(`${suppliersList.length} suppliers loaded successfully`);
      } else {
        showError('Failed to fetch suppliers');
        setSuppliers([]);
      }
    } catch (error) {
      showError('Error fetching suppliers');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter suppliers based on search term and status
  const filteredSuppliers = (suppliers || []).filter(supplier => {
    const matchesSearch = 
      supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.profile?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.profile?.businessType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full";
    switch (status) {
      case 'active':
        return `${baseClasses} bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200`;
      case 'pending':
        return `${baseClasses} bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border border-yellow-200`;
      case 'suspended':
        return `${baseClasses} bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'suspended': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const calculateStats = () => {
    const total = (suppliers || []).length;
    const active = (suppliers || []).filter(s => s.status === 'active').length;
    const pending = (suppliers || []).filter(s => s.status === 'pending').length;
    const suspended = (suppliers || []).filter(s => s.status === 'suspended').length;
    
    return { total, active, pending, suspended };
  };

  const stats = calculateStats();

  const openDetailsModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading suppliers...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Add CSS for animations */}
        <style>{`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-slide-in-up {
            animation: slideInUp 0.4s ease-out forwards;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>

        {/* Enhanced Header with Real-time Metrics */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-xl relative overflow-hidden animate-slide-in-up">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 animate-float"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/5 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Supplier Directory</h1>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-blue-100">Manage and monitor all suppliers</p>
                      <div className="flex items-center gap-1 text-blue-200">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm">Live Updates</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Metrics Bar */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/15 backdrop-blur rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-white/80" />
                      <span className="text-white/80 text-sm">Total</span>
                    </div>
                    <p className="text-xl font-bold text-white mt-1">{stats.total}</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-300" />
                      <span className="text-white/80 text-sm">Active</span>
                    </div>
                    <p className="text-xl font-bold text-white mt-1">{stats.active}</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-300" />
                      <span className="text-white/80 text-sm">Pending</span>
                    </div>
                    <p className="text-xl font-bold text-white mt-1">{stats.pending}</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-300" />
                      <span className="text-white/80 text-sm">Active Rate</span>
                    </div>
                    <p className="text-xl font-bold text-white mt-1">
                      {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button
                    onClick={fetchSuppliers}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur flex items-center gap-2 group"
                    title="Refresh Data"
                  >
                    <RefreshCw className="h-5 w-5 text-white group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                  
                  <button 
                    onClick={() => {
                      // Export functionality
                      const csvData = filteredSuppliers.map(supplier => ({
                        'Name': supplier.name || 'N/A',
                        'Email': supplier.email || 'N/A',
                        'Business': supplier.profile?.businessName || 'N/A',
                        'Type': supplier.profile?.businessType || 'N/A',
                        'Status': supplier.status || 'N/A',
                        'Join Date': supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : 'N/A'
                      }));
                      
                      const headers = Object.keys(csvData[0] || {});
                      const csvString = [
                        headers.join(','),
                        ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
                      ].join('\\n');
                      
                      const blob = new Blob([csvString], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `suppliers-${new Date().toISOString().split('T')[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                      
                      showSuccess('Suppliers exported successfully!');
                    }}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur group"
                    title="Export to CSV"
                  >
                    <Download className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                  </button>
                  
                  <button 
                    onClick={() => showSuccess('Add supplier feature coming soon!')}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur group"
                    title="Add Supplier"
                  >
                    <Plus className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                
                {/* Live Status Indicator */}
                <div className="flex items-center justify-center gap-2 text-blue-100 text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                  <span>Real-time monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg border-t-4 border-blue-500 hover:shadow-xl transition-shadow group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Suppliers</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    All registered
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-t-4 border-green-500 hover:shadow-xl transition-shadow group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-t-4 border-yellow-500 hover:shadow-xl transition-shadow group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Awaiting approval
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl group-hover:bg-yellow-200 transition-colors">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-t-4 border-purple-500 hover:shadow-xl transition-shadow group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Suspended</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.suspended}</p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Under review
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search suppliers by name, email, business name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
                  title="Grid View"
                >
                  <Layers className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
                  title="List View"
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredSuppliers.length} of {suppliers.length} suppliers</span>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>Advanced filtering active</span>
            </div>
          </div>
        </div>

        {/* Suppliers Display */}
        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No suppliers found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No suppliers have been registered yet.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier, index) => (
              <div key={supplier._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100 overflow-hidden group animate-slide-in-up" style={{animationDelay: `${index * 100}ms`}}>
                {/* Card Header with Gradient */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 relative">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white text-lg font-bold">
                      {(supplier.name || supplier.email || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white truncate">{supplier.name || 'Unnamed Supplier'}</h3>
                      <p className="text-blue-100 text-sm truncate">{supplier.profile?.businessName || 'Business N/A'}</p>
                    </div>
                    <span className={getStatusBadge(supplier.status)}>
                      {getStatusIcon(supplier.status)}
                      {supplier.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm truncate">{supplier.email}</span>
                  </div>
                  
                  {supplier.profile?.businessType && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      <span className="text-sm">{supplier.profile.businessType}</span>
                    </div>
                  )}

                  {supplier.createdAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Joined {new Date(supplier.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* Rating/Performance Indicator */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-3 w-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">(4.8)</span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDetailsModal(supplier)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => showSuccess('Edit feature coming soon!')}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                  <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Suppliers List</h3>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Supplier Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Business Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSuppliers.map((supplier, index) => (
                    <tr key={supplier._id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all group" style={{animationDelay: `${index * 50}ms`}}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {(supplier.name || supplier.email || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {supplier.name || 'Unnamed Supplier'}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {supplier.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-gray-400" />
                            {supplier.profile?.businessName || 'Business N/A'}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {supplier.profile?.businessType || 'Type N/A'}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={getStatusBadge(supplier.status)}>
                          {getStatusIcon(supplier.status)}
                          {supplier.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-3 w-3 text-yellow-400 fill-current" />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetailsModal(supplier)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all hover:scale-105"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => showSuccess('Edit feature coming soon!')}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all hover:scale-105"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Supplier Details Modal */}
      {showDetailsModal && selectedSupplier && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setShowDetailsModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white text-lg font-bold">
                      {(selectedSupplier.name || selectedSupplier.email || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedSupplier.name || 'Unnamed Supplier'}</h3>
                      <p className="text-blue-100 text-sm">{selectedSupplier.profile?.businessName || 'Business details'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XCircle className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Supplier Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Mail className="h-5 w-5 text-indigo-600" />
                      <h4 className="font-semibold text-gray-900">Contact Information</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                        <p className="text-gray-900 mt-1">{selectedSupplier.email}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</label>
                        <p className="text-gray-900 mt-1">{selectedSupplier.profile?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</label>
                        <p className="text-gray-900 mt-1">{selectedSupplier.profile?.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Business Information</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</label>
                        <p className="text-gray-900 mt-1 font-medium">{selectedSupplier.profile?.businessName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Business Type</label>
                        <p className="text-gray-900 mt-1">{selectedSupplier.profile?.businessType || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</label>
                        <p className="text-gray-900 mt-1">
                          {selectedSupplier.createdAt ? new Date(selectedSupplier.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Performance */}
                <div className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Status & Performance</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</label>
                      <div className="mt-2">
                        <span className={getStatusBadge(selectedSupplier.status)}>
                          {getStatusIcon(selectedSupplier.status)}
                          {selectedSupplier.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</label>
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">(4.8)</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Orders Completed</label>
                      <p className="text-2xl font-bold text-purple-600 mt-1">127</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
                <div className="flex gap-3">
                  <button
                    onClick={() => showSuccess('Status update feature coming soon!')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    Update Status
                  </button>
                  <button
                    onClick={() => showSuccess('Send message feature coming soon!')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Send Message
                  </button>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AllSuppliers;