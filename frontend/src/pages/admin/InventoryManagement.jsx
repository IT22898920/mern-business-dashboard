import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Users,
  TrendingUp,
  TrendingDown,
  Edit,
  Eye,
  History,
  ShoppingCart,
  Clock,
  FileText,
  Download,
  Calendar
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

const InventoryManagement = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'restock',
    quantity: '',
    reason: '',
    supplier: ''
  });
  const [supplierData, setSupplierData] = useState({
    supplierId: '',
    leadTime: 7,
    minimumOrderQuantity: 1
  });
  const [reorderData, setReorderData] = useState({
    quantity: '',
    urgency: 'medium',
    message: '',
    expectedDeliveryDate: ''
  });
  const [reportData, setReportData] = useState({
    type: 'inventory_summary',
    format: 'pdf',
    dateRange: 'last_30_days',
    customStartDate: '',
    customEndDate: '',
    includeOutOfStock: true,
    includeLowStock: true,
    includeSupplierInfo: true
  });

  useEffect(() => {
    fetchInventoryData();
    fetchSuppliers();
  }, [currentPage, searchTerm, filterStatus, filterSupplier]);

  const fetchInventoryData = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: filterStatus,
        supplier: filterSupplier
      });

      const response = await fetch(`/api/inventory?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.data.products || []);
        setPagination(data.data.pagination || {});
        setStats(data.data.stats || {});
      } else if (response.status === 401 || response.status === 403) {
        console.error('Authorization error - user may not have permission');
        setProducts([]);
        setPagination({});
        setStats({});
      } else {
        console.error('Error response:', response.status);
        setProducts([]);
        setPagination({});
        setStats({});
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setProducts([]);
      setPagination({});
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/inventory/suppliers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.data.suppliers || []);
      } else {
        console.error('Error fetching suppliers:', response.status);
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliers([]);
    }
  };

  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/inventory/${selectedProduct._id}/adjust`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(adjustmentData)
      });

      if (response.ok) {
        setShowAdjustModal(false);
        setAdjustmentData({ type: 'restock', quantity: '', reason: '', supplier: '' });
        fetchInventoryData();
        alert('Stock adjusted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('Error adjusting stock');
      console.error('Error:', error);
    }
  };

  const handleSupplierAssignment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/inventory/${selectedProduct._id}/supplier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(supplierData)
      });

      if (response.ok) {
        setShowSupplierModal(false);
        setSupplierData({ supplierId: '', leadTime: 7, minimumOrderQuantity: 1 });
        fetchInventoryData();
        alert('Supplier assigned successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('Error assigning supplier');
      console.error('Error:', error);
    }
  };

  const openAdjustModal = (product) => {
    setSelectedProduct(product);
    setShowAdjustModal(true);
  };

  const openSupplierModal = (product) => {
    setSelectedProduct(product);
    setSupplierData({
      supplierId: product.supplier?._id || '',
      leadTime: product.supplier_info?.lead_time || 7,
      minimumOrderQuantity: product.supplier_info?.minimum_order_quantity || 1
    });
    setShowSupplierModal(true);
  };

  const openReorderModal = (product) => {
    setSelectedProduct(product);
    setReorderData({
      quantity: Math.max(product.stock.low_stock_threshold * 2, 10), // Default to 2x threshold
      urgency: product.stock.available <= 0 ? 'urgent' : 'medium',
      message: `Stock is running low for ${product.name}. Current stock: ${product.stock.available} units.`,
      expectedDeliveryDate: new Date(Date.now() + (product.supplier_info?.lead_time || 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setShowReorderModal(true);
  };

  const handleReorderSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct.supplier) {
      alert('No supplier assigned to this product. Please assign a supplier first.');
      return;
    }

    try {
      const response = await fetch('/api/reorders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: selectedProduct._id,
          supplierId: selectedProduct.supplier._id,
          quantity: parseInt(reorderData.quantity),
          urgency: reorderData.urgency,
          message: reorderData.message,
          expectedDeliveryDate: reorderData.expectedDeliveryDate
        })
      });

      if (response.ok) {
        setShowReorderModal(false);
        setReorderData({ quantity: '', urgency: 'medium', message: '', expectedDeliveryDate: '' });
        alert('Reorder request sent to supplier successfully!');
      } else {
        const error = await response.json();
        console.log('Reorder request error:', error);
        if (response.status === 401) {
          alert('Authentication expired. Please log in again.');
          // Optional: redirect to login
          window.location.href = '/login';
        } else {
          alert(`Error: ${error.message}`);
        }
      }
    } catch (error) {
      alert('Error sending reorder request');
      console.error('Error:', error);
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setReportGenerating(true);
    
    try {
      // Prepare query parameters
      const params = new URLSearchParams({
        type: reportData.type,
        format: reportData.format,
        dateRange: reportData.dateRange,
        includeOutOfStock: reportData.includeOutOfStock,
        includeLowStock: reportData.includeLowStock,
        includeSupplierInfo: reportData.includeSupplierInfo
      });

      if (reportData.dateRange === 'custom') {
        params.append('startDate', reportData.customStartDate);
        params.append('endDate', reportData.customEndDate);
      }

      const response = await fetch(`/api/inventory/reports/generate?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Handle file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_report_${new Date().toISOString().split('T')[0]}.${reportData.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setShowReportModal(false);
        alert('Report generated successfully! 🎉');
      } else {
        const error = await response.json();
        alert(`Error generating report: ${error.message}`);
      }
    } catch (error) {
      alert('Error generating report');
      console.error('Error:', error);
    } finally {
      setReportGenerating(false);
    }
  };

  const getStockStatus = (product) => {
    if (!product.stock.track_inventory) return 'Not Tracked';
    if (product.stock.available <= 0) return 'Out of Stock';
    if (product.stock.available <= product.stock.low_stock_threshold) return 'Low Stock';
    return 'In Stock';
  };

  const getStockStatusColor = (product) => {
    const status = getStockStatus(product);
    switch (status) {
      case 'Out of Stock': return 'text-red-600 bg-red-100';
      case 'Low Stock': return 'text-yellow-600 bg-yellow-100';
      case 'In Stock': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading inventory data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Manage stock levels and supplier assignments</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Products</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeProducts || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.lowStockProducts || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.outOfStockProducts || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Inventory Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${(stats.totalInventoryValue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterSupplier}
                onChange={(e) => setFilterSupplier(e.target.value)}
              >
                <option value="all">All Suppliers</option>
                {suppliers.map(supplier => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchInventoryData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              
              <button
                onClick={() => setShowReportModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-md hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Generate Report</span>
                <span className="sm:hidden">Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.brand && (
                          <div className="text-sm text-gray-500">{product.brand}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.stock.available}</div>
                      <div className="text-xs text-gray-500">
                        Total: {product.stock.current} | Reserved: {product.stock.reserved}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(product)}`}>
                        {getStockStatus(product)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.supplier ? (
                        <div>
                          <div className="font-medium">{product.supplier.name}</div>
                          <div className="text-xs text-gray-500">{product.supplier.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No supplier</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openAdjustModal(product)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Adjust Stock"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openSupplierModal(product)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded"
                          title="Assign Supplier"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                        {product.supplier && (
                          <button
                            onClick={() => openReorderModal(product)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Request Reorder"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                      disabled={currentPage === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Adjust Stock - {selectedProduct?.name}
            </h3>
            <form onSubmit={handleStockAdjustment}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjustment Type
                  </label>
                  <select
                    value={adjustmentData.type}
                    onChange={(e) => setAdjustmentData({...adjustmentData, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="restock">Restock</option>
                    <option value="adjustment">Direct Adjustment</option>
                    <option value="damaged">Damaged/Lost</option>
                    <option value="returned">Returned</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={adjustmentData.quantity}
                    onChange={(e) => setAdjustmentData({...adjustmentData, quantity: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {adjustmentData.type === 'restock' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier (Optional)
                    </label>
                    <select
                      value={adjustmentData.supplier}
                      onChange={(e) => setAdjustmentData({...adjustmentData, supplier: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select supplier (optional)</option>
                      {suppliers.map(supplier => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={adjustmentData.reason}
                    onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Adjust Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Assignment Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Assign Supplier - {selectedProduct?.name}
            </h3>
            <form onSubmit={handleSupplierAssignment}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier *
                  </label>
                  <select
                    value={supplierData.supplierId}
                    onChange={(e) => setSupplierData({...supplierData, supplierId: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name} - {supplier.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Time (days)
                  </label>
                  <input
                    type="number"
                    value={supplierData.leadTime}
                    onChange={(e) => setSupplierData({...supplierData, leadTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order Quantity
                  </label>
                  <input
                    type="number"
                    value={supplierData.minimumOrderQuantity}
                    onChange={(e) => setSupplierData({...supplierData, minimumOrderQuantity: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Assign Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reorder Request Modal */}
      {showReorderModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Request Reorder - {selectedProduct.name}
                </h3>
                <button
                  onClick={() => setShowReorderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Current Stock:</span> {selectedProduct.stock.available}
                  </div>
                  <div>
                    <span className="font-medium">Low Stock Threshold:</span> {selectedProduct.stock.low_stock_threshold}
                  </div>
                  <div>
                    <span className="font-medium">Supplier:</span> {selectedProduct.supplier?.name || 'Not Assigned'}
                  </div>
                  <div>
                    <span className="font-medium">Lead Time:</span> {selectedProduct.supplier_info?.lead_time || 'N/A'} days
                  </div>
                </div>
              </div>

              <form onSubmit={handleReorderSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity to Order *
                    </label>
                    <input
                      type="number"
                      value={reorderData.quantity}
                      onChange={(e) => setReorderData({...reorderData, quantity: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency Level
                    </label>
                    <select
                      value={reorderData.urgency}
                      onChange={(e) => setReorderData({...reorderData, urgency: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Delivery Date
                    </label>
                    <input
                      type="date"
                      value={reorderData.expectedDeliveryDate}
                      onChange={(e) => setReorderData({...reorderData, expectedDeliveryDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message to Supplier
                    </label>
                    <textarea
                      value={reorderData.message}
                      onChange={(e) => setReorderData({...reorderData, message: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Add any special instructions or notes for the supplier..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReorderModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Send Reorder Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto w-full max-w-4xl bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 animate-in">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-t-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Generate Inventory Report</h3>
                    <p className="text-green-100 mt-1">Create detailed reports for your inventory data</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-white/5 rounded-full"></div>
            </div>
            
            <div className="p-8">
              
              <form onSubmit={handleGenerateReport}>
                {/* Report Type Cards */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Select Report Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { value: 'inventory_summary', label: 'Inventory Summary', desc: 'Complete overview of all inventory items', icon: '📊' },
                      { value: 'low_stock', label: 'Low Stock Report', desc: 'Items running low on stock', icon: '⚠️' },
                      { value: 'out_of_stock', label: 'Out of Stock Report', desc: 'Items completely out of stock', icon: '❌' },
                      { value: 'stock_valuation', label: 'Stock Valuation', desc: 'Total value of inventory', icon: '💰' },
                      { value: 'supplier_analysis', label: 'Supplier Analysis', desc: 'Supplier performance overview', icon: '🏢' },
                      { value: 'stock_movement', label: 'Stock Movement', desc: 'Stock history and movements', icon: '📈' }
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => setReportData({...reportData, type: option.value})}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          reportData.type === option.value
                            ? 'border-green-500 bg-green-50 shadow-md'
                            : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <h4 className="font-semibold text-gray-900 mb-1">{option.label}</h4>
                        <p className="text-xs text-gray-600">{option.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Format */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export Format *
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'pdf', label: 'PDF Document', desc: 'Professional printable format', icon: '📄' },
                        { value: 'excel', label: 'Excel Spreadsheet', desc: 'Editable .xlsx format', icon: '📊' },
                        { value: 'csv', label: 'CSV File', desc: 'Data import/export format', icon: '📋' }
                      ].map((format) => (
                        <div
                          key={format.value}
                          onClick={() => setReportData({...reportData, format: format.value})}
                          className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                            reportData.format === format.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-lg">{format.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900">{format.label}</div>
                            <div className="text-xs text-gray-600">{format.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date Range *
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'today', label: 'Today', icon: '📅' },
                        { value: 'last_7_days', label: 'Last 7 Days', icon: '📆' },
                        { value: 'last_30_days', label: 'Last 30 Days', icon: '🗓️' },
                        { value: 'last_90_days', label: 'Last 90 Days', icon: '🗓️' },
                        { value: 'last_year', label: 'Last Year', icon: '📊' },
                        { value: 'custom', label: 'Custom Range', icon: '🔧' }
                      ].map((range) => (
                        <div
                          key={range.value}
                          onClick={() => setReportData({...reportData, dateRange: range.value})}
                          className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                            reportData.dateRange === range.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-lg">{range.icon}</span>
                          <div className="font-medium text-gray-900">{range.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom Date Range */}
                {reportData.dateRange === 'custom' && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Custom Date Range
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={reportData.customStartDate}
                          onChange={(e) => setReportData({...reportData, customStartDate: e.target.value})}
                          className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          required={reportData.dateRange === 'custom'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          End Date *
                        </label>
                        <input
                          type="date"
                          value={reportData.customEndDate}
                          onChange={(e) => setReportData({...reportData, customEndDate: e.target.value})}
                          className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          required={reportData.dateRange === 'custom'}
                          min={reportData.customStartDate}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Report Options */}
                <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Report Options
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'includeOutOfStock', label: 'Out of Stock Items', desc: 'Include items with zero stock', icon: '❌' },
                      { id: 'includeLowStock', label: 'Low Stock Items', desc: 'Include items below threshold', icon: '⚠️' },
                      { id: 'includeSupplierInfo', label: 'Supplier Information', desc: 'Include supplier details', icon: '🏢' }
                    ].map((option) => (
                      <div key={option.id} className="relative">
                        <input
                          type="checkbox"
                          id={option.id}
                          checked={reportData[option.id]}
                          onChange={(e) => setReportData({...reportData, [option.id]: e.target.checked})}
                          className="sr-only"
                        />
                        <label
                          htmlFor={option.id}
                          className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            reportData[option.id]
                              ? 'border-green-500 bg-green-50 shadow-md'
                              : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-lg">{option.icon}</span>
                            <div>
                              <div className="font-medium text-gray-900">{option.label}</div>
                              <div className="text-xs text-gray-600 mt-1">{option.desc}</div>
                            </div>
                            {reportData[option.id] && (
                              <div className="ml-auto">
                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Report will be downloaded automatically when generated
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center gap-2 font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reportGenerating}
                      className={`px-8 py-3 rounded-xl flex items-center gap-3 font-semibold shadow-lg transition-all duration-200 ${
                        reportGenerating 
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 hover:shadow-xl transform hover:scale-105'
                      } text-white`}
                    >
                      {reportGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Generating Report...</span>
                          <div className="w-4 h-4"></div>
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5" />
                          <span>Generate & Download Report</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default InventoryManagement;