import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Calendar,
  Search,
  Filter,
  ChevronDown,
  AlertTriangle,
  TrendingUp,
  RefreshCcw
} from 'lucide-react';
import SupplierLayout from '../../components/layout/SupplierLayout';

const SupplierRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockRequests = [
      {
        id: 1,
        productName: 'Premium Oak Dining Table',
        category: 'Furniture',
        requestedQuantity: 5,
        currentStock: 2,
        requestDate: '2024-01-15',
        status: 'pending',
        priority: 'high',
        estimatedCost: 2500,
        notes: 'Urgent reorder needed for upcoming sale'
      },
      {
        id: 2,
        productName: 'Modern Office Chair',
        category: 'Office Furniture',
        requestedQuantity: 10,
        currentStock: 0,
        requestDate: '2024-01-14',
        status: 'accepted',
        priority: 'medium',
        estimatedCost: 1200,
        notes: 'Standard reorder'
      },
      {
        id: 3,
        productName: 'LED Desk Lamp',
        category: 'Lighting',
        requestedQuantity: 15,
        currentStock: 3,
        requestDate: '2024-01-13',
        status: 'rejected',
        priority: 'low',
        estimatedCost: 450,
        notes: 'Budget constraints'
      },
      {
        id: 4,
        productName: 'Ergonomic Keyboard',
        category: 'Electronics',
        requestedQuantity: 8,
        currentStock: 1,
        requestDate: '2024-01-12',
        status: 'pending',
        priority: 'medium',
        estimatedCost: 320,
        notes: 'Regular stock replenishment'
      }
    ];

    setTimeout(() => {
      setRequests(mockRequests);
      setStats({
        total: mockRequests.length,
        pending: mockRequests.filter(r => r.status === 'pending').length,
        accepted: mockRequests.filter(r => r.status === 'accepted').length,
        rejected: mockRequests.filter(r => r.status === 'rejected').length
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'accepted': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (requestId, newStatus) => {
    setRequests(prev => prev.map(request => 
      request.id === requestId ? { ...request, status: newStatus } : request
    ));
    
    // Update stats
    const updatedRequests = requests.map(request => 
      request.id === requestId ? { ...request, status: newStatus } : request
    );
    setStats({
      total: updatedRequests.length,
      pending: updatedRequests.filter(r => r.status === 'pending').length,
      accepted: updatedRequests.filter(r => r.status === 'accepted').length,
      rejected: updatedRequests.filter(r => r.status === 'rejected').length
    });
  };

  if (loading) {
    return (
      <SupplierLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Reorder Requests</h1>
              <p className="text-green-100">Manage product reorder requests from the admin</p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl">
              <Package className="h-12 w-12" />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Accepted</p>
                <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No reorder requests found</p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:border-green-300 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{request.productName}</h3>
                          <p className="text-gray-600">{request.category}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Requested Qty</p>
                          <p className="font-semibold text-gray-900">{request.requestedQuantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Current Stock</p>
                          <p className="font-semibold text-gray-900">{request.currentStock}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Estimated Cost</p>
                          <p className="font-semibold text-gray-900">${request.estimatedCost}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Request Date</p>
                          <p className="font-semibold text-gray-900">{request.requestDate}</p>
                        </div>
                      </div>

                      {request.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">Notes:</p>
                          <p className="text-gray-900">{request.notes}</p>
                        </div>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'accepted')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'rejected')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SupplierLayout>
  );
};

export default SupplierRequests;