import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Filter, Edit, Trash2, Eye, 
  AlertTriangle, CheckCircle, XCircle, Star, Image,
  DollarSign, TrendingUp, TrendingDown, MoreHorizontal,
  Tag, Layers, ShoppingCart, BarChart3, Download,
  Upload, RefreshCw, Archive, Copy, ExternalLink, Loader2,
  Grid, List, ChevronLeft, ChevronRight, Clock, Barcode, Palette
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import inventoryService from '../../services/inventoryService';
import AddProductModal from '../../components/admin/AddProductModal';
import EditProductModal from '../../components/admin/EditProductModal';

const ProductsManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportOptions, setReportOptions] = useState({
    type: 'inventory_summary',
    format: 'pdf',
    dateRange: 'last_30_days',
    includeSupplierInfo: true,
    includeOutOfStock: true,
    includeLowStock: true
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, [currentPage, selectedCategory, selectedStatus, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load products with filters
      const params = {
        page: currentPage,
        limit: 12,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(searchQuery && { search: searchQuery })
      };

      const [productsResponse, categoriesResponse, statsResponse] = await Promise.all([
        productService.getProducts(params),
        categoryService.getCategories(),
        productService.getProductStats()
      ]);

      setProducts(productsResponse.data || []);
      setTotalPages(productsResponse.pagination?.totalPages || 1);
      setCategories(categoriesResponse.data || []);
      setStats(statsResponse.data || {});
    } catch (error) {
      toast.error('Failed to load products');
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get stock status
  const getStockStatus = (product) => {
    if (!product.stock?.track_inventory) {
      return { status: 'not_tracked', label: 'Not Tracked', color: 'gray' };
    }
    
    const available = product.stock.available || 0;
    const threshold = product.stock.low_stock_threshold || 10;
    
    if (available <= 0) {
      return { status: 'out_of_stock', label: 'Out of Stock', color: 'red' };
    } else if (available <= threshold) {
      return { status: 'low_stock', label: 'Low Stock', color: 'orange' };
    } else {
      return { status: 'in_stock', label: 'In Stock', color: 'green' };
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData();
  };

  // Handle view product
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  // Handle delete product
  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // Confirm delete product
  const confirmDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      await productService.deleteProduct(selectedProduct._id);
      toast.success('Product deleted successfully');
      setShowDeleteModal(false);
      setSelectedProduct(null);
      loadData();
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Delete error:', error);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedProducts.length === 0) {
      toast.error('Please select products first');
      return;
    }

    try {
      let updateData = {};
      let message = '';

      switch (action) {
        case 'activate':
          updateData = { status: 'active' };
          message = 'Products activated successfully';
          break;
        case 'deactivate':
          updateData = { status: 'inactive' };
          message = 'Products deactivated successfully';
          break;
        case 'delete':
          if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return;
          for (const productId of selectedProducts) {
            await productService.deleteProduct(productId);
          }
          message = 'Products deleted successfully';
          setSelectedProducts([]);
          loadData();
          toast.success(message);
          return;
        default:
          return;
      }

      await productService.bulkUpdateProducts(selectedProducts, updateData);
      toast.success(message);
      setSelectedProducts([]);
      loadData();
    } catch (error) {
      toast.error('Bulk action failed');
      console.error('Bulk action error:', error);
    }
  };

  // Generate beautiful inventory report
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const reportTypeNames = {
        'inventory_summary': 'Inventory Summary',
        'low_stock': 'Low Stock',
        'out_of_stock': 'Out of Stock',
        'stock_valuation': 'Stock Valuation',
        'supplier_analysis': 'Supplier Analysis'
      };
      
      toast.success(`Generating ${reportTypeNames[reportOptions.type]} report...`, { duration: 2000 });
      
      await inventoryService.generateReport({
        type: reportOptions.type,
        format: reportOptions.format,
        dateRange: reportOptions.dateRange,
        includeSupplierInfo: reportOptions.includeSupplierInfo.toString(),
        includeOutOfStock: reportOptions.includeOutOfStock.toString(),
        includeLowStock: reportOptions.includeLowStock.toString()
      });
      
      toast.success('Beautiful professional report downloaded successfully! 🎉');
      setShowReportModal(false);
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('Report generation error:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Handle product added
  const handleProductAdded = () => {
    loadData();
  };

  // Handle product updated
  const handleProductUpdated = () => {
    loadData();
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-300 to-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        
        <div className="relative z-10 space-y-8 pb-8">
          {/* Header */}
          <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="text-center sm:text-left">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                  Our Products
                </h1>
                <p className="text-gray-600 text-lg">Discover our amazing collection of quality products</p>
              </div>
              
              <div className="flex items-center gap-4 justify-center sm:justify-end">
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl text-sm font-medium hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                
                <button
                  onClick={() => setShowReportModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Generate Report
                </button>
                
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Product
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl hover:scale-105 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Total Products</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalProducts || 0}</p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">Complete inventory</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <Package className="w-10 h-10 text-blue-600 group-hover:animate-bounce" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl hover:scale-105 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Active Products</p>
                    <p className="text-4xl font-bold text-green-600 mt-2">{stats.activeProducts || 0}</p>
                    <p className="text-xs text-green-600 mt-2 font-medium">Ready to sell</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <CheckCircle className="w-10 h-10 text-green-600 group-hover:animate-bounce" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl hover:scale-105 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Low Stock</p>
                    <p className="text-4xl font-bold text-orange-600 mt-2">{stats.lowStockProducts || 0}</p>
                    <p className="text-xs text-orange-600 mt-2 font-medium">Need attention</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <AlertTriangle className="w-10 h-10 text-orange-600 group-hover:animate-bounce" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl hover:scale-105 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Out of Stock</p>
                    <p className="text-4xl font-bold text-red-600 mt-2">{stats.outOfStockProducts || 0}</p>
                    <p className="text-xs text-red-600 mt-2 font-medium">Urgent restock</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <XCircle className="w-10 h-10 text-red-600 group-hover:animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md text-gray-900"
                  />
                </div>
              </form>

              {/* Filters and Actions */}
              <div className="flex items-center gap-4">
                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none px-6 py-4 pr-10 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md text-gray-900 font-medium"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none px-6 py-4 pr-10 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md text-gray-900 font-medium"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-4 transition-all duration-300 ${
                      viewMode === 'table' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Table View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-4 transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedProducts.length} product(s) selected
                </span>
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Products Table/Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading products...</span>
            </div>
          ) : viewMode === 'table' ? (
            /* Table View */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts(products.map(p => p._id));
                          } else {
                            setSelectedProducts([]);
                          }
                        }}
                        className="rounded"
                      />
                    </th>
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
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProducts([...selectedProducts, product._id]);
                              } else {
                                setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                              }
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {product.images && product.images[0] ? (
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={product.images[0].url}
                                  alt={product.images[0].alt_text || product.name}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Image className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.short_description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.category?.name || 'Uncategorized'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900">{product.stock?.current || 0}</span>
                            <span
                              className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                stockStatus.color === 'green'
                                  ? 'bg-green-100 text-green-800'
                                  : stockStatus.color === 'orange'
                                  ? 'bg-orange-100 text-orange-800'
                                  : stockStatus.color === 'red'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {stockStatus.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              product.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : product.status === 'inactive'
                                ? 'bg-gray-100 text-gray-800'
                                : product.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewProduct(product)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Product"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="text-green-600 hover:text-green-900"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {products.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No products found</p>
                </div>
              )}
            </div>
          ) : (
            /* Grid View */
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <div key={product._id} className="group relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden hover:shadow-3xl hover:scale-105 transition-all duration-500">
                      {/* Product Image */}
                      <div className="relative overflow-hidden">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].alt_text || product.name}
                            className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <Image className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Action Buttons Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewProduct(product)}
                              className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl text-blue-600 hover:text-blue-800 hover:scale-110 transition-all duration-200 shadow-lg"
                              title="View Product"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl text-green-600 hover:text-green-800 hover:scale-110 transition-all duration-200 shadow-lg"
                              title="Edit Product"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product)}
                              className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl text-red-600 hover:text-red-800 hover:scale-110 transition-all duration-200 shadow-lg"
                              title="Delete Product"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm ${
                              product.status === 'active'
                                ? 'bg-green-500/90 text-white shadow-lg shadow-green-500/25'
                                : product.status === 'inactive'
                                ? 'bg-gray-500/90 text-white shadow-lg shadow-gray-500/25'
                                : product.status === 'draft'
                                ? 'bg-yellow-500/90 text-white shadow-lg shadow-yellow-500/25'
                                : 'bg-red-500/90 text-white shadow-lg shadow-red-500/25'
                            }`}
                          >
                            {product.status.toUpperCase()}
                          </span>
                        </div>
                        
                        {/* Checkbox */}
                        <div className="absolute top-4 right-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProducts([...selectedProducts, product._id]);
                              } else {
                                setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                              }
                            }}
                            className="w-5 h-5 rounded-lg border-2 border-white/50 bg-white/20 backdrop-blur-sm"
                          />
                        </div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="p-6 space-y-4">
                        {/* Product Name */}
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                          {product.short_description || 'No description available'}
                        </p>
                        
                        {/* Price and SKU */}
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                            SKU: {product.sku}
                          </span>
                        </div>
                        
                        {/* Stock Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Stock:</span>
                            <span className="text-lg font-bold text-gray-900">{product.stock?.current || 0}</span>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${
                              stockStatus.color === 'green'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : stockStatus.color === 'orange'
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : stockStatus.color === 'red'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}
                          >
                            {stockStatus.label}
                          </span>
                        </div>
                        
                        {/* Category */}
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Category:</span>
                            <span className="text-sm font-medium text-gray-700 bg-blue-50 px-2 py-1 rounded-lg">
                              {product.category?.name || 'Uncategorized'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover Effect Border */}
                      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-500 pointer-events-none"></div>
                    </div>
                  );
                })}
              </div>

              {products.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No products found</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Product Modal */}
        <AddProductModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onProductAdded={handleProductAdded}
        />

        {/* Beautiful Product Details Modal */}
        {showViewModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden animate-in fade-in duration-300">
              {/* Header with Gradient */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -translate-y-20 translate-x-20"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-10 -translate-x-10"></div>
                
                <div className="flex items-start justify-between relative">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white bg-opacity-20 p-3 rounded-2xl backdrop-blur-sm">
                      <Package className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-1">{selectedProduct.name}</h2>
                      <div className="flex items-center space-x-4 text-blue-100">
                        <span className="flex items-center space-x-1">
                          <Barcode className="w-4 h-4" />
                          <span className="text-sm">{selectedProduct.sku}</span>
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          selectedProduct.status === 'active'
                            ? 'bg-green-500 bg-opacity-20 text-green-100'
                            : selectedProduct.status === 'inactive'
                            ? 'bg-gray-500 bg-opacity-20 text-gray-100'
                            : selectedProduct.status === 'draft'
                            ? 'bg-yellow-500 bg-opacity-20 text-yellow-100'
                            : 'bg-red-500 bg-opacity-20 text-red-100'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            selectedProduct.status === 'active'
                              ? 'bg-green-400'
                              : selectedProduct.status === 'inactive'
                              ? 'bg-gray-400'
                              : selectedProduct.status === 'draft'
                              ? 'bg-yellow-400'
                              : 'bg-red-400'
                          }`}></div>
                          {selectedProduct.status.charAt(0).toUpperCase() + selectedProduct.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="max-h-[calc(95vh-160px)] overflow-y-auto">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Product Image Gallery */}
                    <div className="lg:col-span-1">
                      <div className="sticky top-0">
                        {selectedProduct.images && selectedProduct.images[0] ? (
                          <div className="space-y-4">
                            <div className="relative group">
                              <img
                                src={selectedProduct.images[0].url}
                                alt={selectedProduct.images[0].alt_text || selectedProduct.name}
                                className="w-full h-80 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-2xl transition-all duration-300"></div>
                              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full">
                                  <span className="text-xs font-medium text-gray-700">
                                    {selectedProduct.images[0].format || 'IMAGE'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Additional Images Preview */}
                            {selectedProduct.images.length > 1 && (
                              <div className="grid grid-cols-3 gap-2">
                                {selectedProduct.images.slice(1, 4).map((image, index) => (
                                  <img
                                    key={index}
                                    src={image.url}
                                    alt={image.alt_text || selectedProduct.name}
                                    className="w-full h-20 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                                  />
                                ))}
                              </div>
                            )}
                            
                            {selectedProduct.images.length > 4 && (
                              <div className="text-center">
                                <span className="text-sm text-gray-500">
                                  +{selectedProduct.images.length - 4} more images
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                            <div className="text-center">
                              <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">No image available</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Information */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Pricing Section */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Pricing Information</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Selling Price</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatPrice(selectedProduct.price)}</p>
                          </div>
                          
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Cost Price</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatPrice(selectedProduct.cost_price || 0)}</p>
                          </div>
                          
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Profit Margin</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">
                              {selectedProduct.profit_margin ? `${selectedProduct.profit_margin}%` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                <Tag className="w-4 h-4" />
                                <span>Category</span>
                              </label>
                              <div className="bg-gray-50 rounded-lg px-3 py-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {selectedProduct.category?.name || 'Uncategorized'}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                <Palette className="w-4 h-4" />
                                <span>Brand</span>
                              </label>
                              <div className="bg-gray-50 rounded-lg px-3 py-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {selectedProduct.brand || 'Not specified'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                <Eye className="w-4 h-4" />
                                <span>Visibility</span>
                              </label>
                              <div className="bg-gray-50 rounded-lg px-3 py-2">
                                <span className="text-sm font-medium text-gray-900 capitalize">
                                  {selectedProduct.visibility || 'Public'}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                <Star className="w-4 h-4" />
                                <span>Featured</span>
                              </label>
                              <div className="bg-gray-50 rounded-lg px-3 py-2">
                                <span className={`inline-flex items-center text-sm font-medium ${
                                  selectedProduct.featured ? 'text-yellow-700' : 'text-gray-700'
                                }`}>
                                  {selectedProduct.featured ? (
                                    <>
                                      <Star className="w-4 h-4 mr-1 fill-current" />
                                      Featured
                                    </>
                                  ) : (
                                    'Not featured'
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {selectedProduct.description && (
                          <div className="mt-6 pt-6 border-t border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Description</label>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {selectedProduct.description}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
                            <div className="flex flex-wrap gap-2">
                              {selectedProduct.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Inventory */}
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="bg-yellow-100 p-2 rounded-lg">
                            <Package className="w-5 h-5 text-yellow-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Inventory</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Current Stock</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{selectedProduct.stock?.current || 0}</p>
                            <div className="mt-2">
                              {(() => {
                                const stockStatus = getStockStatus(selectedProduct);
                                return (
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    stockStatus.color === 'green'
                                      ? 'bg-green-100 text-green-800'
                                      : stockStatus.color === 'yellow'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : stockStatus.color === 'red'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    <div className={`w-2 h-2 rounded-full mr-2 ${
                                      stockStatus.color === 'green'
                                        ? 'bg-green-500'
                                        : stockStatus.color === 'yellow'
                                        ? 'bg-yellow-500'
                                        : stockStatus.color === 'red'
                                        ? 'bg-red-500'
                                        : 'bg-gray-500'
                                    }`}></div>
                                    {stockStatus.label}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Low Stock Alert</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{selectedProduct.stock?.low_stock_threshold || 10}</p>
                            <p className="text-xs text-gray-500 mt-2">Alert when stock falls below this level</p>
                          </div>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <Clock className="w-5 h-5 text-gray-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Created</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{formatDate(selectedProduct.createdAt)}</p>
                            {selectedProduct.created_by && (
                              <p className="text-xs text-gray-500 mt-1">
                                by {selectedProduct.created_by.name || selectedProduct.created_by.email}
                              </p>
                            )}
                          </div>
                          
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Last Updated</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{formatDate(selectedProduct.updatedAt)}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(selectedProduct.updatedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      Product ID: {selectedProduct._id}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleEditProduct(selectedProduct);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Product
                    </button>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        <EditProductModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          product={selectedProduct}
          onProductUpdated={handleProductUpdated}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete this product? This action cannot be undone.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-3 mt-4">
                  <div className="flex items-center">
                    {selectedProduct.images && selectedProduct.images[0] && (
                      <img
                        src={selectedProduct.images[0].url}
                        alt={selectedProduct.name}
                        className="w-12 h-12 object-cover rounded-lg mr-3"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{selectedProduct.name}</p>
                      <p className="text-sm text-gray-500">SKU: {selectedProduct.sku}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
                    <div className="text-sm text-red-700">
                      <p className="font-medium">Warning:</p>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>This will permanently delete the product</li>
                        <li>All related data will be removed</li>
                        <li>This action cannot be reversed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProduct}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Professional Report Generation Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowReportModal(false)}></div>
              
              <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 transform transition-all">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl">
                      <BarChart3 className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Generate Professional Report</h3>
                      <p className="text-gray-600">Create beautiful inventory reports for your business</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Report Type Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      <BarChart3 className="w-4 h-4 inline mr-2" />
                      Report Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { value: 'inventory_summary', label: 'Inventory Summary', desc: 'Complete overview of all products' },
                        { value: 'low_stock', label: 'Low Stock Alert', desc: 'Products needing attention' },
                        { value: 'out_of_stock', label: 'Out of Stock', desc: 'Products currently unavailable' },
                        { value: 'stock_valuation', label: 'Stock Valuation', desc: 'Financial value analysis' }
                      ].map(option => (
                        <label key={option.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="reportType"
                            value={option.value}
                            checked={reportOptions.type === option.value}
                            onChange={(e) => setReportOptions(prev => ({...prev, type: e.target.value}))}
                            className="sr-only"
                          />
                          <div className={`p-4 rounded-xl border-2 transition-all ${
                            reportOptions.type === option.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                          }`}>
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-600 mt-1">{option.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Date Range Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Time Period
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { value: 'last_7_days', label: 'Last 7 Days' },
                        { value: 'last_30_days', label: 'Last 30 Days' },
                        { value: 'last_90_days', label: 'Last 3 Months' },
                        { value: 'last_year', label: 'Last Year' }
                      ].map(option => (
                        <label key={option.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="dateRange"
                            value={option.value}
                            checked={reportOptions.dateRange === option.value}
                            onChange={(e) => setReportOptions(prev => ({...prev, dateRange: e.target.value}))}
                            className="sr-only"
                          />
                          <div className={`p-3 rounded-lg border-2 text-center transition-all ${
                            reportOptions.dateRange === option.value
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-green-300'
                          }`}>
                            <div className="text-sm font-medium">{option.label}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      <Tag className="w-4 h-4 inline mr-2" />
                      Include Options
                    </label>
                    <div className="space-y-3">
                      {[
                        { key: 'includeSupplierInfo', label: 'Supplier Information', desc: 'Include supplier details and contact info' },
                        { key: 'includeOutOfStock', label: 'Out of Stock Items', desc: 'Show products that are out of stock' },
                        { key: 'includeLowStock', label: 'Low Stock Items', desc: 'Include products below threshold' }
                      ].map(option => (
                        <label key={option.key} className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={reportOptions[option.key]}
                            onChange={(e) => setReportOptions(prev => ({...prev, [option.key]: e.target.checked}))}
                            className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateReport}
                    disabled={generatingReport}
                    className="px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Download className={`w-5 h-5 mr-2 inline ${generatingReport ? 'animate-bounce' : ''}`} />
                    {generatingReport ? 'Generating...' : 'Generate Professional Report'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductsManagement;