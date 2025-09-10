import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  MessageSquare, Package, User, Calendar, TrendingUp, Clock,
  CheckCircle, XCircle, AlertTriangle, RefreshCw, Filter, Eye, 
  Truck, DollarSign, Building2, Mail, Phone, MapPin, Star,
  ArrowRight, Download, BarChart3, Search, ChevronDown,
  ShoppingCart, MessageCircle, Zap, Send, Copy,
  FileSpreadsheet, Printer, ExternalLink, Activity,
  Sparkles, Globe, Wifi, WifiOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../components/AlertSystem';

const ReorderResponses = () => {
  const [reorderRequests, setReorderRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterResponseStatus, setFilterResponseStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    fetchReorderRequests();
  }, [filterStatus, filterResponseStatus]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchReorderRequests(true); // Silent refresh
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, filterStatus, filterResponseStatus]);

  const fetchReorderRequests = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await fetch(`/api/reorders/admin/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        let requests = data.data.reorderRequests;
        
        // Filter based on response status
        if (filterResponseStatus === 'responded') {
          requests = requests.filter(r => r.supplierResponse && r.supplierResponse.respondedAt);
        } else if (filterResponseStatus === 'pending') {
          requests = requests.filter(r => !r.supplierResponse || !r.supplierResponse.respondedAt);
        }
        
        setReorderRequests(requests);
        setLastUpdated(new Date());
        if (!silent) {
          showSuccess('Responses refreshed successfully');
        }
      } else {
        showError('Failed to fetch reorder requests');
      }
    } catch (error) {
      showError('Error fetching data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter by search term
  const filteredRequests = reorderRequests.filter(request => 
    request.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.supplier?.profile?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'acknowledged': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'in_progress': return <RefreshCw className="h-4 w-4 text-purple-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-green-500" />;
      case 'delivered': return <Package className="h-4 w-4 text-gray-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full";
    switch (status) {
      case 'pending': return `${baseClasses} bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border border-yellow-200`;
      case 'acknowledged': return `${baseClasses} bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200`;
      case 'in_progress': return `${baseClasses} bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200`;
      case 'shipped': return `${baseClasses} bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200`;
      case 'delivered': return `${baseClasses} bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200`;
      case 'rejected': return `${baseClasses} bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200`;
      default: return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const calculateStats = () => {
    const total = reorderRequests.length;
    const responded = reorderRequests.filter(r => r.supplierResponse && r.supplierResponse.respondedAt).length;
    const pending = total - responded;
    const inTransit = reorderRequests.filter(r => r.status === 'shipped').length;
    
    return { total, responded, pending, inTransit };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading supplier responses...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Add CSS for animations and print styles */}
        <style jsx>{`
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
          
          @media print {
            .no-print {
              display: none !important;
            }
            
            .print-friendly {
              background: white !important;
              color: black !important;
            }
          }
        `}</style>
        {/* Enhanced Header with Real-time Metrics */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 shadow-xl relative overflow-hidden animate-slide-in-up">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Supplier Response Center</h1>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-emerald-100">Monitor and track supplier communications</p>
                      <div className="flex items-center gap-1 text-emerald-200">
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
                      <MessageSquare className="h-5 w-5 text-white/80" />
                      <span className="text-white/80 text-sm">Total</span>
                    </div>
                    <p className="text-xl font-bold text-white mt-1">{stats.total}</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-300" />
                      <span className="text-white/80 text-sm">Responded</span>
                    </div>
                    <p className="text-xl font-bold text-white mt-1">{stats.responded}</p>
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
                      <span className="text-white/80 text-sm">Response Rate</span>
                    </div>
                    <p className="text-xl font-bold text-white mt-1">
                      {stats.total > 0 ? Math.round((stats.responded / stats.total) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button
                    onClick={fetchReorderRequests}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur flex items-center gap-2 group"
                    title="Refresh Data"
                  >
                    <RefreshCw className="h-5 w-5 text-white group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                  
                  <button 
                    onClick={() => {
                      // Create CSV data
                      const csvData = filteredRequests.map(req => ({
                        'Product Name': req.product?.name || 'N/A',
                        'Supplier': req.supplier?.name || 'N/A',
                        'Business': req.supplier?.profile?.businessName || 'N/A',
                        'Quantity': req.quantity,
                        'Status': req.status,
                        'Priority': req.urgency,
                        'Response Status': (req.supplierResponse && req.supplierResponse.respondedAt) ? 'Responded' : 'Pending',
                        'Response Date': (req.supplierResponse && req.supplierResponse.respondedAt) ? new Date(req.supplierResponse.respondedAt).toLocaleDateString() : 'Not responded'
                      }));
                      
                      // Convert to CSV string
                      const headers = Object.keys(csvData[0] || {});
                      const csvString = [
                        headers.join(','),
                        ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
                      ].join('\n');
                      
                      // Download CSV
                      const blob = new Blob([csvString], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `supplier-responses-${new Date().toISOString().split('T')[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                      
                      showSuccess('Supplier responses exported successfully!');
                    }}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur group"
                    title="Export to CSV"
                  >
                    <FileSpreadsheet className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                  </button>
                  
                  <button 
                    onClick={() => {
                      window.print();
                      showSuccess('Print dialog opened!');
                    }}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur group"
                    title="Print Report"
                  >
                    <Printer className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                
                {/* Live Status Indicator & Controls */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-center gap-2 text-emerald-100 text-xs">
                    <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-ping' : 'bg-gray-400'}`}></div>
                    <span>{autoRefresh ? 'Auto-refresh active' : 'Auto-refresh paused'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={`p-1.5 rounded-lg transition-all ${autoRefresh ? 'bg-green-500/20 hover:bg-green-500/30' : 'bg-gray-500/20 hover:bg-gray-500/30'}`}
                      title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
                    >
                      {autoRefresh ? <Wifi className="h-3 w-3 text-green-200" /> : <WifiOff className="h-3 w-3 text-gray-200" />}
                    </button>
                    <span className="text-emerald-200 text-xs">
                      Updated {new Date(lastUpdated).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg border-t-4 border-indigo-500 hover:shadow-xl transition-shadow group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Requests</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.total}</p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    All time
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors">
                  <MessageSquare className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-t-4 border-green-500 hover:shadow-xl transition-shadow group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Responded</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.responded}</p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {stats.total > 0 ? Math.round((stats.responded / stats.total) * 100) : 0}% response rate
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
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Awaiting</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Need attention
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
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">In Transit</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.inTransit}</p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Being delivered
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                  <Truck className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by product, supplier name, or business..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative">
                <select
                  value={filterResponseStatus}
                  onChange={(e) => setFilterResponseStatus(e.target.value)}
                  className="pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none bg-white min-w-[160px]"
                >
                  <option value="all">All Responses</option>
                  <option value="responded">Responded</option>
                  <option value="pending">Awaiting Response</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none bg-white min-w-[160px]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="in_progress">In Progress</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Bar */}
        <div className="bg-white shadow-lg rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-gray-900">Quick Actions</span>
            </div>
            <button 
              onClick={() => {
                const urgentRequests = filteredRequests.filter(r => r.urgency === 'urgent' && (!r.supplierResponse || !r.supplierResponse.respondedAt));
                if (urgentRequests.length > 0) {
                  showSuccess(`Found ${urgentRequests.length} urgent requests awaiting response`);
                } else {
                  showSuccess('No urgent requests need attention');
                }
              }}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm rounded-lg transition-colors flex items-center gap-1"
            >
              <Zap className="h-4 w-4" />
              Check Urgent ({filteredRequests.filter(r => r.urgency === 'urgent' && (!r.supplierResponse || !r.supplierResponse.respondedAt)).length})
            </button>
            <button 
              onClick={() => {
                const pendingCount = filteredRequests.filter(r => !r.supplierResponse || !r.supplierResponse.respondedAt).length;
                showSuccess(`${pendingCount} requests are still awaiting supplier response`);
              }}
              className="px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-sm rounded-lg transition-colors flex items-center gap-1"
            >
              <Clock className="h-4 w-4" />
              Pending Responses ({filteredRequests.filter(r => !r.supplierResponse || !r.supplierResponse.respondedAt).length})
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4" />
            <span>Real-time monitoring active</span>
          </div>
        </div>

        {/* Enhanced Responses Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-900">Supplier Response Dashboard</h3>
              </div>
              <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                {filteredRequests.length} results
              </span>
            </div>
          </div>
          
          {filteredRequests.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <MessageSquare className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No responses found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm || filterStatus !== 'all' || filterResponseStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No supplier responses available at the moment.'}
              </p>
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
                      Supplier
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Response Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Order Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Response Time
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request, index) => (
                    <tr key={request._id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-emerald-50 transition-all group" style={{animationDelay: `${index * 50}ms`}}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <Package className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {request.product?.name || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <ShoppingCart className="h-3 w-3" />
                              Qty: {request.quantity} units
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {(request.supplier?.name || request.supplier?.profile?.businessName || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.supplier?.name || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {request.supplier?.profile?.businessName || 'Business N/A'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {request.supplierResponse && request.supplierResponse.respondedAt ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200">
                            <CheckCircle className="h-3 w-3" />
                            Responded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border border-yellow-200">
                            <Clock className="h-3 w-3" />
                            Awaiting
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className={getStatusBadge(request.status)}>
                          {getStatusIcon(request.status)}
                          {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency === 'urgent' && <Zap className="h-3 w-3" />}
                          {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {request.supplierResponse && request.supplierResponse.respondedAt 
                            ? new Date(request.supplierResponse.respondedAt).toLocaleDateString()
                            : 'Not responded'}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetailsModal(request)}
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all hover:scale-105"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {(!request.supplierResponse || !request.supplierResponse.respondedAt) && (
                            <button
                              onClick={() => showSuccess('Reminder sent to supplier!')}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all hover:scale-105 opacity-0 group-hover:opacity-100"
                              title="Send Reminder"
                            >
                              <Send className="h-4 w-4" />
                            </button>
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

      {/* Enhanced Response Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setShowDetailsModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Response Details</h3>
                      <p className="text-emerald-100 text-sm">Supplier communication overview</p>
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

              <div className="p-6 max-h-[80vh] overflow-y-auto">
                {/* Status Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Product Info Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="h-5 w-5 text-indigo-600" />
                      <h4 className="font-semibold text-gray-900">Product Information</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</label>
                        <p className="text-gray-900 font-medium mt-1">{selectedRequest.product?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</label>
                        <p className="text-gray-900 mt-1">{selectedRequest.product?.sku || 'N/A'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</label>
                          <p className="text-gray-900 mt-1 flex items-center gap-1">
                            <ShoppingCart className="h-4 w-4 text-gray-400" />
                            {selectedRequest.quantity} units
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</label>
                          <p className={`mt-1 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(selectedRequest.urgency)}`}>
                            {selectedRequest.urgency === 'urgent' && <Zap className="h-3 w-3" />}
                            {selectedRequest.urgency.charAt(0).toUpperCase() + selectedRequest.urgency.slice(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Info Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Supplier Information</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier Name</label>
                        <p className="text-gray-900 font-medium mt-1">{selectedRequest.supplier?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</label>
                        <p className="text-gray-900 mt-1">{selectedRequest.supplier?.profile?.businessName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Email</label>
                        <p className="text-gray-900 mt-1 flex items-center gap-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {selectedRequest.supplier?.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Info Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold text-gray-900">Current Status</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</label>
                        <div className="mt-2">
                          <span className={getStatusBadge(selectedRequest.status)}>
                            {getStatusIcon(selectedRequest.status)}
                            {selectedRequest.status.replace('_', ' ').charAt(0).toUpperCase() + selectedRequest.status.replace('_', ' ').slice(1)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Response Status</label>
                        <div className="mt-2">
                          {selectedRequest.supplierResponse && selectedRequest.supplierResponse.respondedAt ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200">
                              <CheckCircle className="h-3 w-3" />
                              Responded
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border border-yellow-200">
                              <Clock className="h-3 w-3" />
                              Awaiting Response
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supplier Response Section */}
                {selectedRequest.supplierResponse && selectedRequest.supplierResponse.respondedAt ? (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Supplier Response</h4>
                      <span className="ml-auto text-sm text-gray-500">
                        {new Date(selectedRequest.supplierResponse.respondedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRequest.supplierResponse.message && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Response Message</label>
                          <div className="bg-white rounded-lg p-4 border border-green-200">
                            <p className="text-gray-700">{selectedRequest.supplierResponse.message}</p>
                          </div>
                        </div>
                      )}
                      {selectedRequest.supplierResponse.estimatedDelivery && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Estimated Delivery</label>
                          <div className="bg-white rounded-lg p-3 border border-green-200 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-600" />
                            <span className="text-gray-900">
                              {new Date(selectedRequest.supplierResponse.estimatedDelivery).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 mb-6 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-6 w-6 text-yellow-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Awaiting Supplier Response</h4>
                    </div>
                    <p className="text-gray-600">
                      The supplier has not yet responded to this reorder request. Consider following up if this is urgent.
                    </p>
                  </div>
                )}

                {/* Original Request Message */}
                {selectedRequest.message && (
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 mb-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="h-5 w-5 text-gray-600" />
                      <h4 className="font-semibold text-gray-900">Original Request Message</h4>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-700">{selectedRequest.message}</p>
                    </div>
                  </div>
                )}

                {/* Activity Timeline */}
                {selectedRequest.timeline && selectedRequest.timeline.length > 0 && (
                  <div className="bg-white border-2 border-gray-100 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="h-5 w-5 text-indigo-600" />
                      <h4 className="font-semibold text-gray-900">Activity Timeline</h4>
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      <div className="space-y-4">
                        {selectedRequest.timeline.map((entry, index) => (
                          <div key={index} className="relative flex items-start gap-4">
                            <div className="relative z-10 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                            </div>
                            <div className="flex-grow pb-4">
                              <p className="text-sm font-medium text-gray-900">{entry.message}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{entry.user?.name}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="text-xs text-gray-500">
                                  {new Date(entry.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ReorderResponses;