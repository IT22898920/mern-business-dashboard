import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  MessageSquare,
  Calendar,
  TrendingUp,
  Truck,
  RefreshCw,
  Filter
} from 'lucide-react';
import SupplierLayout from '../../components/layout/SupplierLayout';
import { useAlert, ConfirmModal } from '../../components/AlertSystem';

const SupplierDashboard = () => {
  const { showSuccess, showError, showWarning, showInfo } = useAlert();
  const [reorderRequests, setReorderRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, data: null });
  
  const [responseData, setResponseData] = useState({
    status: '',
    message: '',
    estimatedDelivery: ''
  });

  useEffect(() => {
    fetchReorderRequests();
  }, [currentPage, filterStatus]);

  const fetchReorderRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(filterStatus !== 'all' && { status: filterStatus })
      });

      const response = await fetch(`/api/reorders/supplier/my-requests?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setReorderRequests(data.data.reorderRequests);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      } else {
        console.error('Failed to fetch reorder requests');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, status, additionalData = {}) => {
    try {
      const response = await fetch(`/api/reorders/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          status,
          ...additionalData
        })
      });

      if (response.ok) {
        fetchReorderRequests();
        setShowDetailsModal(false);
        showSuccess('Status updated successfully!');
      } else {
        const error = await response.json();
        showError(`Error: ${error.message}`);
      }
    } catch (error) {
      showError('Error updating status');
      console.error('Error:', error);
    }
  };

  const addNote = async (requestId, message) => {
    try {
      const response = await fetch(`/api/reorders/${requestId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ message })
      });

      if (response.ok) {
        fetchReorderRequests();
        showSuccess('Note added successfully!');
      } else {
        const error = await response.json();
        showError(`Error: ${error.message}`);
      }
    } catch (error) {
      showError('Error adding note');
      console.error('Error:', error);
    }
  };

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setResponseData({
      status: request.status,
      message: request.supplierResponse?.message || '',
      estimatedDelivery: request.supplierResponse?.estimatedDelivery 
        ? new Date(request.supplierResponse.estimatedDelivery).toISOString().split('T')[0] 
        : ''
    });
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'acknowledged': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading reorder requests...</p>
        </div>
      </div>
    );
  }

  return (
    <SupplierLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Supplier Dashboard</h1>
          <p className="text-gray-600">Manage your reorder requests and track deliveries</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.values(stats).reduce((sum, stat) => sum + (stat.count || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.pending?.count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {(stats.acknowledged?.count || 0) + (stats.in_progress?.count || 0) + (stats.shipped?.count || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.delivered?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Reorder Requests Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Reorder Requests</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Pending
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reorderRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {request.product.sku}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.quantity} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.daysPending} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openDetailsModal(request)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {reorderRequests.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reorder requests found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                disabled={currentPage === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900">
                  Reorder Request Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Product Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Product Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Product:</span> {selectedRequest.product.name}
                  </div>
                  <div>
                    <span className="font-medium">SKU:</span> {selectedRequest.product.sku}
                  </div>
                  <div>
                    <span className="font-medium">Current Stock:</span> {selectedRequest.product.stock?.available || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Low Stock Threshold:</span> {selectedRequest.product.stock?.low_stock_threshold || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Request Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Request Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Quantity:</span> {selectedRequest.quantity} units
                  </div>
                  <div>
                    <span className="font-medium">Urgency:</span> 
                    <span className={`ml-1 font-medium ${getUrgencyColor(selectedRequest.urgency)}`}>
                      {selectedRequest.urgency.charAt(0).toUpperCase() + selectedRequest.urgency.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Requested By:</span> {selectedRequest.requestedBy.name}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {new Date(selectedRequest.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {selectedRequest.message && (
                  <div className="mt-3">
                    <span className="font-medium">Message:</span>
                    <p className="text-gray-600 mt-1">{selectedRequest.message}</p>
                  </div>
                )}
              </div>

              {/* Response Form */}
              <div className="bg-white border rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-4">Your Response</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={responseData.status}
                      onChange={(e) => setResponseData({...responseData, status: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="in_progress">In Progress</option>
                      <option value="shipped">Shipped</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Delivery Date
                    </label>
                    <input
                      type="date"
                      value={responseData.estimatedDelivery}
                      onChange={(e) => setResponseData({...responseData, estimatedDelivery: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message to Admin
                    </label>
                    <textarea
                      value={responseData.message}
                      onChange={(e) => setResponseData({...responseData, message: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Add any notes or updates..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => updateRequestStatus(
                      selectedRequest._id, 
                      responseData.status,
                      {
                        message: responseData.message,
                        estimatedDelivery: responseData.estimatedDelivery || undefined
                      }
                    )}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Update Status
                  </button>
                </div>
              </div>

              {/* Interactive Progress Timeline */}
              <div className="bg-white border rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Progress Timeline - Quick Actions
                  </div>
                  <span className="text-sm text-gray-500">Click to update status</span>
                </h4>
                
                {/* Progress Steps with Action Buttons */}
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {/* Define progress steps */}
                  {[
                    { key: 'pending', label: 'Request Received', icon: <ShoppingCart className="h-4 w-4" />, description: 'Request has been received', disabled: true },
                    { key: 'acknowledged', label: 'Acknowledge Request', icon: <CheckCircle className="h-4 w-4" />, description: 'Confirm you have reviewed the request' },
                    { key: 'in_progress', label: 'Start Processing', icon: <Clock className="h-4 w-4" />, description: 'Begin working on the order' },
                    { key: 'shipped', label: 'Mark as Shipped', icon: <Truck className="h-4 w-4" />, description: 'Order has been dispatched' },
                    { key: 'delivered', label: 'Mark as Delivered', icon: <Package className="h-4 w-4" />, description: 'Order has been delivered' }
                  ].map((step, index) => {
                    const statusOrder = ['pending', 'acknowledged', 'in_progress', 'shipped', 'delivered'];
                    const currentStatusIndex = statusOrder.indexOf(selectedRequest.status);
                    const stepIndex = statusOrder.indexOf(step.key);
                    
                    const isCompleted = currentStatusIndex >= stepIndex;
                    const isCurrent = selectedRequest.status === step.key;
                    const isNext = currentStatusIndex + 1 === stepIndex;
                    const isRejected = selectedRequest.status === 'rejected';
                    const canUpdate = isNext && !isRejected;
                    
                    return (
                      <div key={step.key} className="relative flex items-center pb-6">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          isRejected && step.key !== 'pending' 
                            ? 'bg-gray-100 border-gray-300 text-gray-400'
                            : isCompleted 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : isCurrent
                                ? 'bg-blue-500 border-blue-500 text-white'
                                : canUpdate
                                  ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                                  : 'bg-white border-gray-300 text-gray-400'
                        }`}>
                          {isRejected && step.key !== 'pending' ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            step.icon
                          )}
                        </div>
                        
                        <div className="ml-4 flex-grow flex items-center justify-between">
                          <div>
                            <div className={`font-medium ${
                              isRejected && step.key !== 'pending'
                                ? 'text-gray-400'
                                : isCompleted || isCurrent 
                                  ? 'text-gray-900' 
                                  : canUpdate
                                    ? 'text-yellow-700'
                                    : 'text-gray-500'
                            }`}>
                              {step.label}
                            </div>
                            <div className={`text-sm ${
                              isRejected && step.key !== 'pending'
                                ? 'text-gray-400'
                                : isCompleted || isCurrent 
                                  ? 'text-gray-600' 
                                  : canUpdate
                                    ? 'text-yellow-600'
                                    : 'text-gray-500'
                            }`}>
                              {step.description}
                            </div>
                            
                            {/* Show timeline entry for this step */}
                            {selectedRequest.timeline && selectedRequest.timeline
                              .filter(entry => {
                                if (step.key === 'pending') return entry.action === 'request_created';
                                if (step.key === 'acknowledged') return entry.action === 'status_changed' && entry.message.includes('acknowledged');
                                if (step.key === 'in_progress') return entry.action === 'status_changed' && entry.message.includes('in_progress');
                                if (step.key === 'shipped') return entry.action === 'status_changed' && entry.message.includes('shipped');
                                if (step.key === 'delivered') return entry.action === 'status_changed' && entry.message.includes('delivered');
                                return false;
                              })
                              .slice(-1)
                              .map((entry, entryIndex) => (
                                <div key={entryIndex} className="text-xs text-gray-500 mt-1">
                                  {entry.user?.name} • {new Date(entry.timestamp).toLocaleString()}
                                  {entry.message && (
                                    <div className="text-xs text-gray-600 mt-1 italic">{entry.message}</div>
                                  )}
                                </div>
                              ))
                            }
                          </div>
                          
                          {/* Action Button */}
                          {canUpdate && (
                            <button
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  action: 'updateStatus',
                                  data: { requestId: selectedRequest._id, status: step.key, label: step.label }
                                });
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                            >
                              {step.icon}
                              Update
                            </button>
                          )}
                          
                          {isCompleted && step.key !== 'pending' && (
                            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Complete
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Rejected Status */}
                  {selectedRequest.status === 'rejected' && (
                    <div className="relative flex items-center pb-6">
                      <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-red-500 border-red-500 text-white">
                        <XCircle className="h-4 w-4" />
                      </div>
                      <div className="ml-4 flex-grow">
                        <div className="font-medium text-red-600">Request Rejected</div>
                        <div className="text-sm text-red-600">This request has been declined</div>
                        {selectedRequest.timeline && selectedRequest.timeline
                          .filter(entry => entry.action === 'status_changed' && entry.message.includes('rejected'))
                          .slice(-1)
                          .map((entry, entryIndex) => (
                            <div key={entryIndex} className="text-xs text-gray-500 mt-1">
                              {entry.user?.name} • {new Date(entry.timestamp).toLocaleString()}
                              {entry.message && (
                                <div className="text-xs text-red-600 mt-1 italic">{entry.message}</div>
                              )}
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Quick Action Buttons */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              action: 'acknowledge',
                              data: { requestId: selectedRequest._id }
                            });
                          }}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Quick Acknowledge
                        </button>
                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              action: 'reject',
                              data: { requestId: selectedRequest._id }
                            });
                          }}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Quick Reject
                        </button>
                      </>
                    )}
                    
                    {selectedRequest.status === 'acknowledged' && (
                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            action: 'startProcessing',
                            data: { requestId: selectedRequest._id }
                          });
                        }}
                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Start Processing
                      </button>
                    )}
                    
                    {selectedRequest.status === 'in_progress' && (
                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            action: 'ship',
                            data: { requestId: selectedRequest._id }
                          });
                        }}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Truck className="h-4 w-4" />
                        Mark as Shipped
                      </button>
                    )}
                    
                    {selectedRequest.status === 'shipped' && (
                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            action: 'deliver',
                            data: { requestId: selectedRequest._id }
                          });
                        }}
                        className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Package className="h-4 w-4" />
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Timeline */}
              {selectedRequest.timeline && selectedRequest.timeline.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Detailed Activity Log</h4>
                  <div className="space-y-3">
                    {selectedRequest.timeline.map((entry, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm text-gray-900">{entry.message}</p>
                          <p className="text-xs text-gray-500">
                            {entry.user?.name} • {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null, data: null })}
        onConfirm={() => {
          const { action, data } = confirmModal;
          
          switch(action) {
            case 'updateStatus':
              const message = prompt(`Add a note for ${data.label}:`, '');
              if (message !== null) {
                updateRequestStatus(data.requestId, data.status, { message });
              }
              break;
              
            case 'acknowledge':
              updateRequestStatus(data.requestId, 'acknowledged', { 
                message: 'Request has been acknowledged and will be processed soon.' 
              });
              break;
              
            case 'reject':
              updateRequestStatus(data.requestId, 'rejected', { 
                message: 'Request has been rejected due to unavailability.' 
              });
              break;
              
            case 'startProcessing':
              updateRequestStatus(data.requestId, 'in_progress', { 
                message: 'Order processing has started.' 
              });
              break;
              
            case 'ship':
              const trackingInfo = prompt('Enter tracking number (optional):', '');
              updateRequestStatus(data.requestId, 'shipped', { 
                message: `Order has been shipped.${trackingInfo ? ` Tracking: ${trackingInfo}` : ''}` 
              });
              break;
              
            case 'deliver':
              updateRequestStatus(data.requestId, 'delivered', { 
                message: 'Order has been successfully delivered.' 
              });
              break;
          }
          
          setConfirmModal({ isOpen: false, action: null, data: null });
        }}
        title={
          confirmModal.action === 'reject' 
            ? 'Reject Request' 
            : confirmModal.action === 'acknowledge'
              ? 'Acknowledge Request'
              : confirmModal.action === 'startProcessing'
                ? 'Start Processing'
                : confirmModal.action === 'ship'
                  ? 'Mark as Shipped'
                  : confirmModal.action === 'deliver'
                    ? 'Mark as Delivered'
                    : 'Update Status'
        }
        message={
          confirmModal.action === 'reject'
            ? 'Are you sure you want to reject this request? This action cannot be undone.'
            : confirmModal.action === 'acknowledge'
              ? 'Confirm that you have reviewed this request and will process it soon.'
              : confirmModal.action === 'startProcessing'
                ? 'Confirm that you want to start processing this order.'
                : confirmModal.action === 'ship'
                  ? 'Confirm that this order has been shipped.'
                  : confirmModal.action === 'deliver'
                    ? 'Confirm that this order has been delivered successfully.'
                    : 'Are you sure you want to update the status?'
        }
        confirmText={
          confirmModal.action === 'reject' ? 'Reject' : 'Confirm'
        }
        type={
          confirmModal.action === 'reject' ? 'danger' : 
          confirmModal.action === 'deliver' ? 'success' : 'info'
        }
      />
    </SupplierLayout>
  );
};

export default SupplierDashboard;