import React, { useState, useEffect } from 'react';
import { 
  Eye, Check, X, Search, Filter, Clock, AlertCircle, CheckCircle, 
  XCircle, Building2, Mail, Phone, Globe, Calendar, TrendingUp,
  FileText, Users, MapPin, Briefcase, Star, ArrowRight, Download,
  RefreshCw, MoreVertical, ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { supplierApplicationService } from '../../services/supplierApplicationService';
import { useAlert, ConfirmModal } from '../../components/AlertSystem';

const SupplierApplicationsManagement = () => {
  const { showSuccess, showError, showWarning } = useAlert();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await supplierApplicationService.getAllApplications();
      if (response.data.status === 'success') {
        setApplications(response.data.data.applications);
      }
    } catch (error) {
      showError('Failed to fetch applications');
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await supplierApplicationService.getApplicationStats();
      if (response.data.status === 'success') {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus, reviewNotes = '') => {
    try {
      setActionLoading(true);
      const response = await supplierApplicationService.updateApplicationStatus(applicationId, newStatus, reviewNotes);
      
      if (response.data.status === 'success') {
        showSuccess(`Application ${newStatus} successfully`);
        fetchApplications();
        fetchStats();
        setShowModal(false);
        setSelectedApplication(null);
        setShowConfirmModal(false);
      }
    } catch (error) {
      showError(`Failed to ${newStatus} application`);
      console.error('Error updating status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmAction = (action, applicationId) => {
    setConfirmAction({ action, applicationId });
    setShowConfirmModal(true);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.contactInfo?.businessEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border border-yellow-200`;
      case 'approved':
        return `${baseClasses} bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200`;
      case 'rejected':
        return `${baseClasses} bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`;
    }
  };

  const ApplicationModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Application Details</h3>
                  <p className="text-indigo-100 text-sm">Review supplier application</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="px-6 py-3 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Application Status:</span>
                <span className={getStatusBadge(selectedApplication?.status)}>
                  {getStatusIcon(selectedApplication?.status)}
                  {selectedApplication?.status?.charAt(0).toUpperCase() + selectedApplication?.status?.slice(1)}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                Applied: {new Date(selectedApplication?.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
          
          {selectedApplication && (
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Business Information Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    <h4 className="font-semibold text-gray-900">Business Information</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</label>
                      <p className="text-gray-900 font-medium mt-1">{selectedApplication.businessName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Business Type</label>
                      <p className="text-gray-900 mt-1">{selectedApplication.businessType}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Years in Business</label>
                        <p className="text-gray-900 mt-1 flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {selectedApplication.businessDetails?.yearsInBusiness} years
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</label>
                        <p className="text-gray-900 mt-1 flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          {selectedApplication.businessDetails?.numberOfEmployees}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Contact Information</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                      <p className="text-gray-900 mt-1 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a href={`mailto:${selectedApplication.contactInfo?.businessEmail}`} className="text-blue-600 hover:underline">
                          {selectedApplication.contactInfo?.businessEmail}
                        </a>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</label>
                      <p className="text-gray-900 mt-1 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {selectedApplication.contactInfo?.businessPhone}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Website</label>
                      <p className="text-gray-900 mt-1 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        {selectedApplication.contactInfo?.website ? (
                          <a href={selectedApplication.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedApplication.contactInfo.website}
                          </a>
                        ) : (
                          <span className="text-gray-500">Not provided</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Business Address</h4>
                  </div>
                  <div className="space-y-2">
                    {selectedApplication.businessAddress && (
                      <>
                        <p className="text-gray-900">{selectedApplication.businessAddress.street}</p>
                        <p className="text-gray-900">
                          {selectedApplication.businessAddress.city}, {selectedApplication.businessAddress.state} {selectedApplication.businessAddress.zipCode}
                        </p>
                        <p className="text-gray-900">{selectedApplication.businessAddress.country}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Categories Card */}
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-5 border border-orange-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-gray-900">Product Categories</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.productCategories?.map((cat, index) => (
                      <span key={index} className="px-3 py-1.5 bg-white text-orange-700 text-sm font-medium rounded-full border border-orange-300 shadow-sm">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Business Description */}
                <div className="lg:col-span-2 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <h4 className="font-semibold text-gray-900">Business Description</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedApplication.businessDetails?.description}
                  </p>
                </div>

                {/* Admin Notes */}
                {selectedApplication.reviewNotes && (
                  <div className="lg:col-span-2 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-5 border border-red-200">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <h4 className="font-semibold text-gray-900">Review Notes</h4>
                    </div>
                    <p className="text-gray-700">
                      {selectedApplication.reviewNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          {selectedApplication?.status === 'pending' && (
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmAction('reject', selectedApplication._id)}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-medium shadow-lg shadow-red-500/25 disabled:opacity-50 flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Reject Application
              </button>
              <button
                onClick={() => handleConfirmAction('approve', selectedApplication._id)}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-lg shadow-green-500/25 disabled:opacity-50 flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Approve Application
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Supplier Applications</h1>
              <p className="text-indigo-100">Manage and review supplier application requests</p>
            </div>
            <button 
              onClick={fetchApplications}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur"
            >
              <RefreshCw className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Stats Cards with gradient borders */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg border-t-4 border-gray-500 hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                  <p className="text-xs text-gray-600 mt-1">Applications</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <FileText className="h-8 w-8 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-t-4 border-yellow-500 hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                  <p className="text-xs text-gray-600 mt-1">Awaiting Review</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-t-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Approved</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
                  <p className="text-xs text-gray-600 mt-1">Active Suppliers</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-t-4 border-red-500 hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Rejected</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
                  <p className="text-xs text-gray-600 mt-1">Declined</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters with modern design */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by business name, owner name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="sm:w-48 relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-12 pr-8 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Applications Table with modern cards */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-pulse"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <AlertCircle className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No supplier applications have been submitted yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Business Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application._id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 transition-all">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {application.businessName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {application.businessType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {application.user?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="text-sm text-gray-900 font-medium">
                            {application.user?.name || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm text-gray-900">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            {application.contactInfo?.businessEmail}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {application.contactInfo?.businessPhone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {application.productCategories?.slice(0, 2).map((cat, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {cat}
                            </span>
                          ))}
                          {application.productCategories?.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{application.productCategories.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(application.status)}>
                          {getStatusIcon(application.status)}
                          {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowModal(true);
                            }}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors group"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          </button>
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleConfirmAction('approve', application._id)}
                                disabled={actionLoading}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 group"
                                title="Approve"
                              >
                                <Check className="h-4 w-4 group-hover:scale-110 transition-transform" />
                              </button>
                              <button
                                onClick={() => handleConfirmAction('reject', application._id)}
                                disabled={actionLoading}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 group"
                                title="Reject"
                              >
                                <X className="h-4 w-4 group-hover:scale-110 transition-transform" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && <ApplicationModal />}
      
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          if (confirmAction) {
            handleStatusUpdate(confirmAction.applicationId, confirmAction.action === 'approve' ? 'approved' : 'rejected');
          }
        }}
        title={confirmAction?.action === 'approve' ? 'Approve Application' : 'Reject Application'}
        message={
          confirmAction?.action === 'approve'
            ? 'Are you sure you want to approve this supplier application? They will gain access to supplier features.'
            : 'Are you sure you want to reject this supplier application? This action can be reversed later if needed.'
        }
        confirmText={confirmAction?.action === 'approve' ? 'Approve' : 'Reject'}
        type={confirmAction?.action === 'approve' ? 'success' : 'danger'}
      />
    </AdminLayout>
  );
};

export default SupplierApplicationsManagement;