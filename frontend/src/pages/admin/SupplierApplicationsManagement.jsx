import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Search, Filter, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { supplierApplicationService } from '../../services/supplierApplicationService';

const SupplierApplicationsManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
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
      toast.error('Failed to fetch applications');
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
        toast.success(`Application ${newStatus} successfully`);
        fetchApplications();
        fetchStats();
        setShowModal(false);
        setSelectedApplication(null);
      }
    } catch (error) {
      toast.error(`Failed to ${newStatus} application`);
      console.error('Error updating status:', error);
    } finally {
      setActionLoading(false);
    }
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
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const ApplicationModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Application Details</h3>
              <div className="flex items-center space-x-2">
                {getStatusIcon(selectedApplication?.status)}
                <span className={getStatusBadge(selectedApplication?.status)}>
                  {selectedApplication?.status?.charAt(0).toUpperCase() + selectedApplication?.status?.slice(1)}
                </span>
              </div>
            </div>
            
            {selectedApplication && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Business Information</h4>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Name</label>
                    <p className="text-gray-900">{selectedApplication.businessName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Type</label>
                    <p className="text-gray-900">{selectedApplication.businessType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Years in Business</label>
                    <p className="text-gray-900">{selectedApplication.businessDetails?.yearsInBusiness}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Number of Employees</label>
                    <p className="text-gray-900">{selectedApplication.businessDetails?.numberOfEmployees}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Categories</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedApplication.productCategories?.map((cat, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Contact Information</h4>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Email</label>
                    <p className="text-gray-900">{selectedApplication.contactInfo?.businessEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Phone</label>
                    <p className="text-gray-900">{selectedApplication.contactInfo?.businessPhone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">
                      {selectedApplication.businessAddress && (
                        `${selectedApplication.businessAddress.street}, ${selectedApplication.businessAddress.city}, ${selectedApplication.businessAddress.state} ${selectedApplication.businessAddress.zipCode}, ${selectedApplication.businessAddress.country}`
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Website</label>
                    <p className="text-gray-900">{selectedApplication.contactInfo?.website || 'N/A'}</p>
                  </div>
                </div>

                {/* Business Description */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Business Description</label>
                  <p className="text-gray-900 mt-1">{selectedApplication.businessDetails?.description}</p>
                </div>

                {/* Admin Notes */}
                {selectedApplication.reviewNotes && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Review Notes</label>
                    <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">{selectedApplication.reviewNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {selectedApplication?.status === 'pending' && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => handleStatusUpdate(selectedApplication._id, 'approved')}
                disabled={actionLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Approve'}
              </button>
              <button
                type="button"
                onClick={() => handleStatusUpdate(selectedApplication._id, 'rejected')}
                disabled={actionLoading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Reject'}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Applications</h1>
          <p className="text-gray-600">Manage supplier application requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pending}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.approved}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.rejected}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by business name, owner name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No supplier applications have been submitted yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.businessName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.businessType}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.user?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{application.contactInfo?.businessEmail}</div>
                        <div className="text-sm text-gray-500">{application.contactInfo?.businessPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(application.status)}>
                          {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-100"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(application._id, 'approved')}
                                disabled={actionLoading}
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100 disabled:opacity-50"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(application._id, 'rejected')}
                                disabled={actionLoading}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 disabled:opacity-50"
                              >
                                <X className="h-4 w-4" />
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

      {/* Modal */}
      {showModal && <ApplicationModal />}
    </AdminLayout>
  );
};

export default SupplierApplicationsManagement;