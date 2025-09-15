import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  Users, Building2, Mail, Phone, MapPin, Calendar, Star, 
  Eye, Edit, Trash2, Plus, Search, Filter, MoreVertical,
  TrendingUp, Package, Clock, CheckCircle, XCircle, 
  Award, Globe, Briefcase, FileText, RefreshCw,
  Activity, Zap, Shield, UserCheck, AlertTriangle, Crown,
  Sparkles, Heart, Target, Layers, BarChart3, Download
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

  const generateReport = async () => {
    try {
      showSuccess('Generating suppliers report...');
      
      // Create report data
      const reportData = {
        title: 'Suppliers Report',
        generatedAt: new Date().toISOString(),
        summary: {
          totalSuppliers: stats.total,
          activeSuppliers: stats.active,
          pendingSuppliers: stats.pending,
          suspendedSuppliers: stats.suspended,
          activeRate: stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0
        },
        suppliers: filteredSuppliers.map(supplier => ({
          name: supplier.name || 'Unnamed Supplier',
          email: supplier.email,
          companyName: supplier.companyName || supplier.name + ' Co.',
          phone: supplier.phone || 'N/A',
          status: supplier.status,
          establishedYear: supplier.establishedYear || new Date(supplier.createdAt).getFullYear(),
          address: supplier.address ? 
            [supplier.address.street, supplier.address.city, supplier.address.state, supplier.address.zipCode, supplier.address.country]
            .filter(Boolean).join(', ') : 'N/A',
          website: supplier.website || 'N/A',
          rating: supplier.stats?.overallRating?.toFixed(1) || '4.2',
          totalOrders: supplier.stats?.totalOrders || 0,
          onTimeDelivery: supplier.stats?.onTimeDelivery || 'N/A',
          registrationDate: supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : 'N/A',
          emailVerified: supplier.isEmailVerified ? 'Yes' : 'No'
        }))
      };

      // Send report generation request to backend
      const response = await fetch('/api/reports/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        // If backend supports PDF generation, download the PDF
        if (response.headers.get('content-type') === 'application/pdf') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `suppliers-report-${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          showSuccess('Report downloaded successfully!');
        } else {
          // Fallback: Generate CSV report
          generateCSVReport(reportData);
        }
      } else {
        // Fallback: Generate CSV report
        generateCSVReport(reportData);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      // Fallback: Generate CSV report
      generateCSVReport();
    }
  };

  const generateCSVReport = (data) => {
    try {
      const currentSuppliers = data ? data.suppliers : filteredSuppliers;
      const csvContent = [
        // CSV Header
        ['Name', 'Email', 'Company Name', 'Phone', 'Status', 'Established Year', 'Address', 'Website', 'Rating', 'Total Orders', 'On-Time Delivery %', 'Registration Date', 'Email Verified'].join(','),
        // CSV Data
        ...currentSuppliers.map(supplier => {
          const row = data ? [
            supplier.name,
            supplier.email,
            supplier.companyName,
            supplier.phone,
            supplier.status,
            supplier.establishedYear,
            supplier.address,
            supplier.website,
            supplier.rating,
            supplier.totalOrders,
            supplier.onTimeDelivery,
            supplier.registrationDate,
            supplier.emailVerified
          ] : [
            supplier.name || 'Unnamed Supplier',
            supplier.email,
            supplier.companyName || supplier.name + ' Co.',
            supplier.phone || 'N/A',
            supplier.status,
            supplier.establishedYear || new Date(supplier.createdAt).getFullYear(),
            supplier.address ? [supplier.address.street, supplier.address.city, supplier.address.state, supplier.address.zipCode, supplier.address.country].filter(Boolean).join(', ') : 'N/A',
            supplier.website || 'N/A',
            supplier.stats?.overallRating?.toFixed(1) || '4.2',
            supplier.stats?.totalOrders || 0,
            supplier.stats?.onTimeDelivery || 'N/A',
            supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : 'N/A',
            supplier.isEmailVerified ? 'Yes' : 'No'
          ];
          
          // Escape commas and quotes in CSV data
          return row.map(field => {
            const fieldStr = String(field);
            if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
              return `"${fieldStr.replace(/"/g, '""')}"`;
            }
            return fieldStr;
          }).join(',');
        })
      ].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suppliers-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showSuccess(`CSV report downloaded successfully! (${currentSuppliers.length} suppliers)`);
    } catch (error) {
      console.error('Error generating CSV report:', error);
      showError('Failed to generate CSV report');
    }
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
                    onClick={generateReport}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur flex items-center gap-2 group"
                    title="Generate Report"
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

              {/* Generate Report Button */}
              <button
                onClick={generateReport}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                title="Generate Suppliers Report"
              >
                <Download className="h-4 w-4" />
                Generate Report
              </button>

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
                      <p className="text-blue-100 text-sm truncate">{supplier.companyName || supplier.name + ' Co.' || 'Company Name'}</p>
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
                    {supplier.isEmailVerified && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                  
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{supplier.phone}</span>
                    </div>
                  )}

                  {supplier.establishedYear && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Est. {supplier.establishedYear}</span>
                    </div>
                  )}

                  {supplier.address?.city && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{supplier.address.city}{supplier.address.state ? `, ${supplier.address.state}` : ''}</span>
                    </div>
                  )}

                  {/* Rating/Performance Indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-3 w-3 ${
                            star <= (supplier.stats?.overallRating || 4.2) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">({supplier.stats?.overallRating?.toFixed(1) || '4.2'})</span>
                    </div>
                    {supplier.stats?.totalOrders > 0 && (
                      <span className="text-xs text-blue-600 font-medium">
                        {supplier.stats.totalOrders} orders
                      </span>
                    )}
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
                      Company Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
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
                            {supplier.isEmailVerified && (
                              <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                <CheckCircle className="h-3 w-3" />
                                Verified
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-gray-400" />
                            {supplier.companyName || supplier.name + ' Co.' || 'Company Name'}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Est. {supplier.establishedYear || new Date(supplier.createdAt).getFullYear()}
                          </div>
                          {supplier.employeeCount && (
                            <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                              <Users className="h-3 w-3" />
                              {supplier.employeeCount} employees
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          {supplier.phone && (
                            <div className="text-sm text-gray-900 flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {supplier.phone}
                            </div>
                          )}
                          {supplier.website && (
                            <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                              <Globe className="h-3 w-3" />
                              <a href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                Website
                              </a>
                            </div>
                          )}
                          {supplier.address?.city && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {supplier.address.city}{supplier.address.state ? `, ${supplier.address.state}` : ''}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-3 w-3 ${
                                  star <= (supplier.stats?.overallRating || 4.2) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">({supplier.stats?.overallRating?.toFixed(1) || '4.2'})</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {supplier.stats?.totalOrders || 0} orders
                          </div>
                          {supplier.stats?.onTimeDelivery && (
                            <div className="text-xs text-green-600">
                              {supplier.stats.onTimeDelivery}% on-time
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={getStatusBadge(supplier.status)}>
                          {getStatusIcon(supplier.status)}
                          {supplier.status}
                        </span>
                        {supplier.lastLogin && (
                          <div className="text-xs text-gray-500 mt-1">
                            Last: {new Date(supplier.lastLogin).toLocaleDateString()}
                          </div>
                        )}
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
                      <p className="text-blue-100 text-sm">{selectedSupplier.companyName || selectedSupplier.name + ' Company' || 'Business details'}</p>
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
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-gray-900">{selectedSupplier.email}</p>
                          {selectedSupplier.isEmailVerified && (
                            <CheckCircle className="h-4 w-4 text-green-500" title="Verified" />
                          )}
                        </div>
                      </div>
                      {selectedSupplier.phone && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</label>
                          <p className="text-gray-900 mt-1">{selectedSupplier.phone}</p>
                        </div>
                      )}
                      {selectedSupplier.website && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Website</label>
                          <a 
                            href={selectedSupplier.website.startsWith('http') ? selectedSupplier.website : `https://${selectedSupplier.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline mt-1 block"
                          >
                            {selectedSupplier.website}
                          </a>
                        </div>
                      )}
                      {selectedSupplier.address && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</label>
                          <p className="text-gray-900 mt-1">
                            {[selectedSupplier.address.street, selectedSupplier.address.city, selectedSupplier.address.state, selectedSupplier.address.zipCode, selectedSupplier.address.country].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}
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
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</label>
                        <p className="text-gray-900 mt-1 font-medium">{selectedSupplier.companyName || selectedSupplier.name + ' Company'}</p>
                      </div>
                      {selectedSupplier.establishedYear && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Established</label>
                          <p className="text-gray-900 mt-1">{selectedSupplier.establishedYear}</p>
                        </div>
                      )}
                      {selectedSupplier.employeeCount && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Count</label>
                          <p className="text-gray-900 mt-1">{selectedSupplier.employeeCount} employees</p>
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</label>
                        <p className="text-gray-900 mt-1">
                          {selectedSupplier.createdAt ? new Date(selectedSupplier.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      {selectedSupplier.businessLicense && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Business License</label>
                          <p className="text-gray-900 mt-1">{selectedSupplier.businessLicense}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {selectedSupplier.description && (
                  <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-amber-600" />
                      <h4 className="font-semibold text-gray-900">Description</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{selectedSupplier.description}</p>
                  </div>
                )}

                {/* Services and Specialties */}
                {(selectedSupplier.services?.length > 0 || selectedSupplier.specialties?.length > 0) && (
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {selectedSupplier.services?.length > 0 && (
                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 border border-cyan-200">
                        <div className="flex items-center gap-2 mb-4">
                          <Briefcase className="h-5 w-5 text-cyan-600" />
                          <h4 className="font-semibold text-gray-900">Services</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedSupplier.services.map((service, index) => (
                            <span key={index} className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedSupplier.specialties?.length > 0 && (
                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-200">
                        <div className="flex items-center gap-2 mb-4">
                          <Award className="h-5 w-5 text-pink-600" />
                          <h4 className="font-semibold text-gray-900">Specialties</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedSupplier.specialties.map((specialty, index) => (
                            <span key={index} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${
                              star <= (selectedSupplier.stats?.overallRating || 4.2) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">({selectedSupplier.stats?.overallRating?.toFixed(1) || '4.2'})</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Orders Completed</label>
                      <p className="text-2xl font-bold text-purple-600 mt-1">{selectedSupplier.stats?.totalOrders || 0}</p>
                    </div>
                    {selectedSupplier.stats?.onTimeDelivery && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">On-Time Delivery</label>
                        <p className="text-2xl font-bold text-green-600 mt-1">{selectedSupplier.stats.onTimeDelivery}%</p>
                      </div>
                    )}
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