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
  Filter,
  BarChart3,
  Star,
  Zap,
  Award,
  Activity,
  Bell,
  Sparkles,
  ChevronRight,
  Users,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Box
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
  
  // New state for assigned products
  const [assignedProducts, setAssignedProducts] = useState([]);
  const [productStats, setProductStats] = useState({});
  const [productPage, setProductPage] = useState(1);
  const [productPagination, setProductPagination] = useState({});
  const [productSearch, setProductSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, reorders, products
  
  const [responseData, setResponseData] = useState({
    status: '',
    message: '',
    estimatedDelivery: ''
  });

  useEffect(() => {
    fetchReorderRequests();
    fetchAssignedProducts();
  }, [currentPage, filterStatus, productPage, productSearch]);

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

  const fetchAssignedProducts = async () => {
    setLoadingProducts(true);
    try {
      const params = new URLSearchParams({
        page: productPage,
        limit: 10,
        ...(productSearch && { search: productSearch })
      });

      const response = await fetch(`/api/products/supplier/my-products?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAssignedProducts(data.data?.products || data.data || []);
        setProductPagination(data.data?.pagination || {});
        setProductStats(data.data?.stats || {});
      } else {
        console.error('Failed to fetch assigned products');
        setAssignedProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setAssignedProducts([]);
    } finally {
      setLoadingProducts(false);
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
      case 'pending': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'acknowledged': return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
      case 'in_progress': return 'bg-gradient-to-r from-purple-400 to-purple-600 text-white';
      case 'shipped': return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
      case 'delivered': return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
      case 'rejected': return 'bg-gradient-to-r from-red-400 to-red-600 text-white';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading && reorderRequests.length === 0) {
    return (
      <SupplierLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-ping"></div>
              </div>
              <RefreshCw className="h-12 w-12 animate-spin text-gradient bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-4 relative z-10" />
            </div>
            <p className="text-gray-600 font-medium mt-4">Loading your dashboard...</p>
          </div>
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Header */}
          <div className="mb-8 relative">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <h1 className="text-4xl font-bold">Supplier Dashboard</h1>
                    </div>
                    <p className="text-blue-100 text-lg">
                      Welcome back! Manage your products and orders efficiently
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Object.values(stats).reduce((sum, stat) => sum + (stat.count || 0), 0)}</div>
                      <div className="text-blue-100 text-sm">Total Orders</div>
                    </div>
                    <div className="w-px h-12 bg-white/20"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{productStats.totalProducts || 0}</div>
                      <div className="text-blue-100 text-sm">Products</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
            <div className="border-b border-gray-100">
              <nav className="flex">
                {[
                  { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-5 w-5" />, desc: 'Dashboard summary' },
                  { id: 'reorders', label: 'Reorder Requests', icon: <ShoppingCart className="h-5 w-5" />, count: stats.pending?.count },
                  { id: 'products', label: 'My Products', icon: <Package className="h-5 w-5" />, count: productStats.totalProducts }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative py-4 px-6 text-sm font-medium transition-all duration-300 group ${
                      activeTab === tab.id
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      }`}>
                        {tab.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{tab.label}</div>
                        {tab.desc && (
                          <div className="text-xs text-gray-400">{tab.desc}</div>
                        )}
                      </div>
                      {tab.count > 0 && (
                        <span className={`ml-2 px-2 py-1 text-xs font-bold rounded-full ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </div>
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Enhanced Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Requests Card */}
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full -mr-16 -mt-16 opacity-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl">
                        <ShoppingCart className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-full">
                        ORDERS
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-1">
                      {Object.values(stats).reduce((sum, stat) => sum + (stat.count || 0), 0)}
                    </p>
                    <p className="text-sm text-gray-500">Total Requests</p>
                    <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Pending Orders Card */}
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-orange-100 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full -mr-16 -mt-16 opacity-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      {stats.pending?.count > 0 && (
                        <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded-full animate-pulse">
                          URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-1">
                      {stats.pending?.count || 0}
                    </p>
                    <p className="text-sm text-gray-500">Pending Orders</p>
                    <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full animate-pulse" 
                           style={{ width: `${((stats.pending?.count || 0) / Math.max(Object.values(stats).reduce((sum, stat) => sum + (stat.count || 0), 0), 1)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Products Card */}
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-purple-100 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full -mr-16 -mt-16 opacity-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded-full">
                        INVENTORY
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-1">
                      {productStats.totalProducts || 0}
                    </p>
                    <p className="text-sm text-gray-500">Total Products</p>
                    <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-400 to-indigo-600 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Performance Score Card */}
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-green-100 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full -mr-16 -mt-16 opacity-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                        RATING
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-1">
                      4.8
                    </p>
                    <p className="text-sm text-gray-500">Performance Score</p>
                    <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Section */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Zap className="h-6 w-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-gray-800">Quick Actions</h3>
                  </div>
                  <span className="text-sm text-gray-500">Most used features</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { 
                      title: 'View Pending Orders', 
                      description: 'Review and manage pending reorder requests', 
                      icon: <ShoppingCart className="h-8 w-8 text-orange-600" />,
                      action: () => setActiveTab('reorders'),
                      color: 'orange',
                      count: stats.pending?.count || 0
                    },
                    { 
                      title: 'Check Inventory', 
                      description: 'Monitor stock levels and product status', 
                      icon: <Box className="h-8 w-8 text-blue-600" />,
                      action: () => setActiveTab('products'),
                      color: 'blue',
                      count: productStats.lowStockProducts || 0
                    },
                    { 
                      title: 'Performance Analytics', 
                      description: 'View detailed performance metrics', 
                      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
                      action: () => showInfo('Analytics feature coming soon!'),
                      color: 'green',
                      count: '4.8'
                    }
                  ].map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="group p-4 border-2 border-gray-100 rounded-xl hover:border-purple-300 hover:shadow-lg transition-all duration-300 text-left"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-lg bg-${action.color}-50 group-hover:scale-110 transition-transform`}>
                          {action.icon}
                        </div>
                        {action.count > 0 && (
                          <span className={`px-2 py-1 text-xs font-bold rounded-full bg-${action.color}-100 text-${action.color}-700`}>
                            {action.count}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">{action.title}</h4>
                      <p className="text-sm text-gray-500">{action.description}</p>
                      <ChevronRight className="h-4 w-4 text-gray-400 mt-2 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <Activity className="h-6 w-6 text-blue-600" />
                      Recent Orders
                    </h3>
                    <button 
                      onClick={() => setActiveTab('reorders')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      View All <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {reorderRequests.slice(0, 5).map((request) => (
                      <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{request.product.name}</p>
                            <p className="text-xs text-gray-500">{request.quantity} units</p>
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    ))}
                    {reorderRequests.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No recent orders</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                      Stock Alerts
                    </h3>
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center gap-1"
                    >
                      View All <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {assignedProducts
                      .filter(p => p.stock?.current <= p.stock?.low_stock_threshold)
                      .slice(0, 5)
                      .map((product) => (
                        <div key={product._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                              <AlertTriangle className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                              <p className="text-xs text-orange-600">Only {product.stock?.current || 0} left</p>
                            </div>
                          </div>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            Low Stock
                          </span>
                        </div>
                      ))}
                    {assignedProducts.filter(p => p.stock?.current <= p.stock?.low_stock_threshold).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-300" />
                        <p>All products well stocked!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reorders' && (
            <div className="space-y-6 animate-fade-in">
              {/* Enhanced Statistics Cards for Reorders */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-blue-100 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full -mr-16 -mt-16 opacity-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl">
                        <ShoppingCart className="h-6 w-6 text-white" />
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-1">
                      {Object.values(stats).reduce((sum, stat) => sum + (stat.count || 0), 0)}
                    </p>
                    <p className="text-sm text-gray-500">Total Requests</p>
                    <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-yellow-100 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full -mr-16 -mt-16 opacity-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      {stats.pending?.count > 0 && <Bell className="h-5 w-5 text-orange-500 animate-bounce" />}
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-1">
                      {stats.pending?.count || 0}
                    </p>
                    <p className="text-sm text-gray-500">Pending Orders</p>
                    <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" 
                           style={{ width: `${((stats.pending?.count || 0) / Math.max(Object.values(stats).reduce((sum, stat) => sum + (stat.count || 0), 0), 1)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-purple-100 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full -mr-16 -mt-16 opacity-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl">
                        <Truck className="h-6 w-6 text-white" />
                      </div>
                      <Activity className="h-5 w-5 text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-1">
                      {(stats.acknowledged?.count || 0) + (stats.in_progress?.count || 0) + (stats.shipped?.count || 0)}
                    </p>
                    <p className="text-sm text-gray-500">In Progress</p>
                    <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-400 to-indigo-600 rounded-full" 
                           style={{ width: `${(((stats.acknowledged?.count || 0) + (stats.in_progress?.count || 0) + (stats.shipped?.count || 0)) / Math.max(Object.values(stats).reduce((sum, stat) => sum + (stat.count || 0), 0), 1)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-green-100 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full -mr-16 -mt-16 opacity-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <Star className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-1">
                      {stats.delivered?.count || 0}
                    </p>
                    <p className="text-sm text-gray-500">Completed</p>
                    <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full" 
                           style={{ width: `${((stats.delivered?.count || 0) / Math.max(Object.values(stats).reduce((sum, stat) => sum + (stat.count || 0), 0), 1)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Filters */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-gray-800">Filter Orders</span>
                  </div>
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: 'all', label: 'All Status', count: Object.values(stats).reduce((sum, stat) => sum + (stat.count || 0), 0), color: 'gray' },
                    { value: 'pending', label: 'Pending', count: stats.pending?.count || 0, color: 'orange' },
                    { value: 'acknowledged', label: 'Acknowledged', count: stats.acknowledged?.count || 0, color: 'blue' },
                    { value: 'in_progress', label: 'In Progress', count: stats.in_progress?.count || 0, color: 'purple' },
                    { value: 'shipped', label: 'Shipped', count: stats.shipped?.count || 0, color: 'green' },
                    { value: 'delivered', label: 'Delivered', count: stats.delivered?.count || 0, color: 'gray' },
                    { value: 'rejected', label: 'Rejected', count: stats.rejected?.count || 0, color: 'red' }
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setFilterStatus(filter.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        filterStatus === filter.value
                          ? `bg-${filter.color}-100 text-${filter.color}-700 border-2 border-${filter.color}-300 shadow-md`
                          : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      {filter.label}
                      {filter.count > 0 && (
                        <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                          filterStatus === filter.value
                            ? `bg-${filter.color}-200 text-${filter.color}-800`
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {filter.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhanced Reorder Requests Table */}
              <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                    Reorder Requests
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Product Details
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Quantity & Urgency
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Timeline
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reorderRequests.map((request, index) => (
                        <tr key={request._id} className="hover:bg-blue-50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mr-4">
                                <Package className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">
                                  {request.product.name}
                                </div>
                                <div className="text-sm text-gray-500 font-mono">
                                  SKU: {request.product.sku}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="text-sm font-bold text-gray-900">
                                  {request.quantity} units
                                </div>
                                <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full border ${getUrgencyColor(request.urgency)}`}>
                                  {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-md ${getStatusColor(request.status)}`}>
                              {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="text-gray-900 font-medium">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </div>
                              <div className={`text-xs font-semibold ${
                                request.daysPending > 7 ? 'text-red-600' : 
                                request.daysPending > 3 ? 'text-orange-600' : 'text-green-600'
                              }`}>
                                {request.daysPending} days ago
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => openDetailsModal(request)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {reorderRequests.length === 0 && (
                  <div className="text-center py-16">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-24 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full opacity-20 animate-ping"></div>
                      </div>
                      <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4 relative z-10" />
                    </div>
                    <p className="text-xl text-gray-500 font-medium">No reorder requests found</p>
                    <p className="text-gray-400 mt-2">
                      {filterStatus !== 'all' ? 'Try adjusting your filter criteria' : 'New requests will appear here'}
                    </p>
                  </div>
                )}

                {/* Enhanced Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        Showing page <span className="font-bold text-blue-600">{currentPage}</span> of{' '}
                        <span className="font-bold text-blue-600">{pagination.totalPages}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                        disabled={currentPage === pagination.totalPages}
                        className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              {/* Enhanced Statistics Cards for Products */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-blue-100 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full -mr-16 -mt-16 opacity-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-full">
                        TOTAL
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-1">
                      {productStats.totalProducts || 0}
                    </p>
                    <p className="text-sm text-gray-500">Total Products</p>
                    <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-green-100 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full -mr-16 -mt-16 opacity-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-1">
                      {productStats.activeProducts || 0}
                    </p>
                    <p className="text-sm text-gray-500">Active Products</p>
                    <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full" 
                           style={{ width: `${((productStats.activeProducts || 0) / Math.max(productStats.totalProducts || 1, 1)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-yellow-100 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full -mr-16 -mt-16 opacity-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      {productStats.lowStockProducts > 0 && (
                        <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded-full animate-pulse">
                          WARNING
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-1">
                      {productStats.lowStockProducts || 0}
                    </p>
                    <p className="text-sm text-gray-500">Low Stock Items</p>
                    <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" 
                           style={{ width: `${((productStats.lowStockProducts || 0) / Math.max(productStats.totalProducts || 1, 1)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-red-100 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400 to-red-600 rounded-full -mr-16 -mt-16 opacity-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-xl">
                        <XCircle className="h-6 w-6 text-white" />
                      </div>
                      {productStats.outOfStockProducts > 0 && (
                        <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-full animate-bounce">
                          CRITICAL
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-1">
                      {productStats.outOfStockProducts || 0}
                    </p>
                    <p className="text-sm text-gray-500">Out of Stock</p>
                    <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full" 
                           style={{ width: `${((productStats.outOfStockProducts || 0) / Math.max(productStats.totalProducts || 1, 1)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Search Bar for Products */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="relative group">
                      <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="text"
                        placeholder="Search products by name, SKU, or category..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setProductPage(1);
                      fetchAssignedProducts();
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
                  >
                    <Package className="h-5 w-5" />
                    Search Products
                  </button>
                </div>
              </div>

              {/* Enhanced Products Table */}
              <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                    <Layers className="h-6 w-6 text-purple-600" />
                    Products Assigned to You
                  </h3>
                </div>
                
                {loadingProducts ? (
                  <div className="p-16 text-center">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-24 w-24 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-20 animate-ping"></div>
                      </div>
                      <RefreshCw className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4 relative z-10" />
                    </div>
                    <p className="text-gray-600 font-medium">Loading products...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Product Details
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            SKU & Category
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Stock Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Price & Value
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {assignedProducts && assignedProducts.length > 0 ? (
                          assignedProducts.map((product, index) => (
                            <tr key={product._id} className="hover:bg-purple-50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mr-4">
                                    <Package className="h-6 w-6 text-purple-600" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-gray-900 hover:text-purple-600 transition-colors">
                                      {product.name}
                                    </div>
                                    {product.short_description && (
                                      <div className="text-sm text-gray-500 truncate max-w-xs">
                                        {product.short_description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block mb-1">
                                    {product.sku}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Layers className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                      {product.category?.name || 'Uncategorized'}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className={`w-3 h-3 rounded-full ${
                                        product.stock?.current <= 0 ? 'bg-red-500 animate-pulse' :
                                        product.stock?.current <= product.stock?.low_stock_threshold ? 'bg-yellow-500 animate-pulse' :
                                        'bg-green-500'
                                      }`}></div>
                                      <span className={`text-sm font-bold ${
                                        product.stock?.current <= 0 ? 'text-red-600' :
                                        product.stock?.current <= product.stock?.low_stock_threshold ? 'text-yellow-600' :
                                        'text-green-600'
                                      }`}>
                                        {product.stock?.current || 0} units
                                      </span>
                                    </div>
                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          product.stock?.current <= 0 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                                          product.stock?.current <= product.stock?.low_stock_threshold ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                          'bg-gradient-to-r from-green-400 to-green-600'
                                        }`}
                                        style={{ 
                                          width: `${Math.min(((product.stock?.current || 0) / Math.max(product.stock?.low_stock_threshold || 10, 10)) * 100, 100)}%` 
                                        }}
                                      ></div>
                                    </div>
                                    {product.stock?.current <= product.stock?.low_stock_threshold && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Threshold: {product.stock?.low_stock_threshold}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <div className="flex items-center gap-1 mb-1">
                                    <DollarSign className="h-4 w-4 text-green-500" />
                                    <span className="text-sm font-bold text-gray-900">
                                      {product.price?.toFixed(2) || '0.00'}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Value: ${((product.price || 0) * (product.stock?.current || 0)).toFixed(2)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-md ${
                                  product.status === 'active' ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' :
                                  product.status === 'draft' ? 'bg-gradient-to-r from-gray-400 to-gray-600 text-white' :
                                  product.status === 'out_of_stock' ? 'bg-gradient-to-r from-red-400 to-red-600 text-white' :
                                  'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                                }`}>
                                  {product.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-16 text-center">
                              <div className="relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="h-24 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full opacity-20 animate-ping"></div>
                                </div>
                                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4 relative z-10" />
                              </div>
                              <p className="text-xl text-gray-500 font-medium">No products assigned to you yet</p>
                              <p className="text-gray-400 mt-2">Products will appear here when assigned by administrators</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Enhanced Product Pagination */}
                {productPagination.totalPages > 1 && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        Showing page <span className="font-bold text-purple-600">{productPage}</span> of{' '}
                        <span className="font-bold text-purple-600">{productPagination.totalPages}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setProductPage(Math.max(1, productPage - 1))}
                        disabled={productPage === 1}
                        className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                      </button>
                      <button
                        onClick={() => setProductPage(Math.min(productPagination.totalPages, productPage + 1))}
                        disabled={productPage === productPagination.totalPages}
                        className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Request Details Modal */}
        {showDetailsModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold">Reorder Request Details</h3>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[calc(90vh-100px)] overflow-y-auto">
                {/* Product Info */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Product Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Product:</span> 
                      <span className="font-bold text-gray-900">{selectedRequest.product.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">SKU:</span> 
                      <span className="font-mono text-gray-900">{selectedRequest.product.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Current Stock:</span> 
                      <span className="font-bold text-gray-900">{selectedRequest.product.stock?.available || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Low Stock Threshold:</span> 
                      <span className="font-bold text-gray-900">{selectedRequest.product.stock?.low_stock_threshold || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Request Info */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Request Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Quantity:</span> 
                      <span className="font-bold text-gray-900">{selectedRequest.quantity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Urgency:</span> 
                      <span className={`font-bold px-2 py-1 rounded ${getUrgencyColor(selectedRequest.urgency)}`}>
                        {selectedRequest.urgency.charAt(0).toUpperCase() + selectedRequest.urgency.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Requested By:</span> 
                      <span className="font-bold text-gray-900">{selectedRequest.requestedBy.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Date:</span> 
                      <span className="font-bold text-gray-900">{new Date(selectedRequest.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {selectedRequest.message && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                      <span className="font-medium text-gray-600">Message:</span>
                      <p className="text-gray-700 mt-1 italic">"{selectedRequest.message}"</p>
                    </div>
                  )}
                </div>

                {/* Response Form */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    Your Response
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Status Update
                      </label>
                      <select
                        value={responseData.status}
                        onChange={(e) => setResponseData({...responseData, status: e.target.value})}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      >
                        <option value="pending">Pending Review</option>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="in_progress">In Progress</option>
                        <option value="shipped">Shipped</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Estimated Delivery Date
                      </label>
                      <input
                        type="date"
                        value={responseData.estimatedDelivery}
                        onChange={(e) => setResponseData({...responseData, estimatedDelivery: e.target.value})}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Message to Administrator
                      </label>
                      <textarea
                        value={responseData.message}
                        onChange={(e) => setResponseData({...responseData, message: e.target.value})}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                        rows="4"
                        placeholder="Add any notes, updates, or tracking information..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => updateRequestStatus(
                        selectedRequest._id, 
                        responseData.status,
                        {
                          message: responseData.message,
                          estimatedDelivery: responseData.estimatedDelivery || undefined
                        }
                      )}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Update Request
                    </button>
                  </div>
                </div>
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
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
          animation-fill-mode: both;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </SupplierLayout>
  );
};

export default SupplierDashboard;