import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, Plus, Minus, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle, XCircle, RefreshCw, Download, Upload,
  BarChart3, Calendar, Clock, Eye, Edit, History, Box, Layers,
  ArrowUpDown, ArrowUp, ArrowDown, Settings, Bell, Target,
  Loader2, ChevronLeft, ChevronRight, Grid, List, Archive, User, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';

const InventoryManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [stockHistory, setStockHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyStats, setHistoryStats] = useState(null);
  const [historyFilters, setHistoryFilters] = useState({
    type: '',
    reason: '',
    startDate: '',
    endDate: ''
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [currentPage, selectedCategory, stockFilter, debouncedSearchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 20,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(debouncedSearchQuery && { search: debouncedSearchQuery })
      };

      const [productsResponse, categoriesResponse, statsResponse] = await Promise.all([
        productService.getProducts(params),
        categoryService.getCategories(),
        productService.getInventoryStats()
      ]);

      let filteredProducts = productsResponse.data || [];
      
      // Apply stock filter
      if (stockFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => {
          const stockStatus = getStockStatus(product);
          return stockStatus.status === stockFilter;
        });
      }

      setProducts(filteredProducts);
      setTotalPages(productsResponse.pagination?.totalPages || 1);
      setCategories(categoriesResponse.data || []);
      setInventoryStats(statsResponse.data || {});
    } catch (error) {
      toast.error('Failed to load inventory data');
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get stock status
  const getStockStatus = (product) => {
    if (!product.stock?.track_inventory) {
      return { status: 'not_tracked', label: 'Not Tracked', color: 'gray', icon: Archive };
    }
    
    const available = product.stock.current || 0;
    const threshold = product.stock.low_stock_threshold || 10;
    
    if (available <= 0) {
      return { status: 'out_of_stock', label: 'Out of Stock', color: 'red', icon: XCircle };
    } else if (available <= threshold) {
      return { status: 'low_stock', label: 'Low Stock', color: 'orange', icon: AlertTriangle };
    } else {
      return { status: 'in_stock', label: 'In Stock', color: 'green', icon: CheckCircle };
    }
  };

  // Handle stock adjustment
  const handleStockAdjustment = async () => {
    if (!selectedProduct || !adjustmentQuantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const quantity = parseInt(adjustmentQuantity);
      const newStock = adjustmentType === 'add' 
        ? (selectedProduct.stock?.current || 0) + quantity
        : Math.max(0, (selectedProduct.stock?.current || 0) - quantity);

      const updateData = {
        stock: {
          ...selectedProduct.stock,
          current: newStock
        }
      };

      await productService.updateProduct(selectedProduct._id, updateData);
      
      // Log the adjustment (in a real app, you'd save this to a stock_movements table)
      toast.success(`Stock ${adjustmentType === 'add' ? 'increased' : 'decreased'} successfully`);
      
      setShowAdjustModal(false);
      setSelectedProduct(null);
      setAdjustmentQuantity('');
      setAdjustmentReason('');
      loadData();
    } catch (error) {
      toast.error('Failed to adjust stock');
      console.error('Stock adjustment error:', error);
    }
  };

  // Load stock history
  const loadStockHistory = async (productId) => {
    if (!productId) return;
    
    setHistoryLoading(true);
    try {
      const params = {
        limit: 50,
        ...historyFilters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await productService.getStockHistory(productId, params);
      setStockHistory(response.data.movements || []);
      setHistoryStats(response.data.summary || null);
    } catch (error) {
      toast.error('Failed to load stock history');
      console.error('Load stock history error:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get stock value
  const getStockValue = (product) => {
    const current = product.stock?.current || 0;
    const costPrice = product.cost_price || product.price * 0.6; // Estimate if not available
    return current * costPrice;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Track and manage your product stock levels</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Inventory Stats */}
        {inventoryStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900">{inventoryStats.totalProducts || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-3xl font-bold text-orange-600">{inventoryStats.lowStockProducts || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-3xl font-bold text-red-600">{inventoryStats.outOfStockProducts || 0}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Stock Value</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${products.reduce((total, product) => total + getStockValue(product), 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search products by name, SKU, or description..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {debouncedSearchQuery && loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Stock Filter */}
                <select
                  value={stockFilter}
                  onChange={(e) => {
                    setStockFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Stock Levels</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="not_tracked">Not Tracked</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results Info */}
          {!loading && (debouncedSearchQuery || products.length > 0) && (
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {debouncedSearchQuery ? (
                    <>
                      <span className="font-medium">{products.length}</span> results found for "
                      <span className="font-medium">{debouncedSearchQuery}</span>"
                    </>
                  ) : (
                    <>
                      Showing <span className="font-medium">{products.length}</span> products
                    </>
                  )}
                </div>
                {debouncedSearchQuery && (
                  <button
                    onClick={clearSearch}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Inventory Table/Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading inventory...</span>
            </div>
          ) : viewMode === 'table' ? (
            /* Table View */
            <div className="overflow-x-auto">
              <table className="w-full">
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
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const StatusIcon = stockStatus.icon;
                    const stockValue = getStockValue(product);
                    
                    return (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {product.images && product.images[0] ? (
                                <img
                                  className="h-10 w-10 rounded-lg object-cover"
                                  src={product.images[0].url}
                                  alt={product.images[0].alt_text || product.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.category?.name || 'Uncategorized'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg font-semibold text-gray-900">
                              {product.stock?.current || 0}
                            </span>
                            {product.stock?.low_stock_threshold && (
                              <span className="ml-2 text-xs text-gray-500">
                                / {product.stock.low_stock_threshold}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              stockStatus.color === 'green'
                                ? 'bg-green-100 text-green-800'
                                : stockStatus.color === 'orange'
                                ? 'bg-orange-100 text-orange-800'
                                : stockStatus.color === 'red'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${stockValue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(product.updatedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowAdjustModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Adjust Stock"
                            >
                              <ArrowUpDown className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowHistoryModal(true);
                                loadStockHistory(product._id);
                              }}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="View History"
                            >
                              <History className="w-4 h-4" />
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
                  <p className="text-gray-600 text-lg font-medium mb-2">
                    {debouncedSearchQuery ? 'No products match your search' : 'No products found'}
                  </p>
                  {debouncedSearchQuery && (
                    <div className="text-sm text-gray-500">
                      <p className="mb-2">Searched for: "<span className="font-medium">{debouncedSearchQuery}</span>"</p>
                      <button
                        onClick={clearSearch}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Clear search and show all products
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Grid View */
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const StatusIcon = stockStatus.icon;
                  const stockValue = getStockValue(product);
                  
                  return (
                    <div key={product._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-w-16 aspect-h-12 relative">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].alt_text || product.name}
                            className="w-full h-40 object-cover"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xl font-bold text-gray-900">
                            {product.stock?.current || 0}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              stockStatus.color === 'green'
                                ? 'bg-green-100 text-green-800'
                                : stockStatus.color === 'orange'
                                ? 'bg-orange-100 text-orange-800'
                                : stockStatus.color === 'red'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {stockStatus.label}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-600">Value: ${stockValue.toLocaleString()}</span>
                          <span className="text-sm text-gray-500">{product.category?.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowAdjustModal(true);
                            }}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                          >
                            <ArrowUpDown className="w-4 h-4 mr-1" />
                            Adjust
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowHistoryModal(true);
                              loadStockHistory(product._id);
                            }}
                            className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {products.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg font-medium mb-2">
                    {debouncedSearchQuery ? 'No products match your search' : 'No products found'}
                  </p>
                  {debouncedSearchQuery && (
                    <div className="text-sm text-gray-500">
                      <p className="mb-2">Searched for: "<span className="font-medium">{debouncedSearchQuery}</span>"</p>
                      <button
                        onClick={clearSearch}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Clear search and show all products
                      </button>
                    </div>
                  )}
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

        {/* Stock Adjustment Modal */}
        {showAdjustModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in duration-300">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      <ArrowUpDown className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Adjust Stock</h3>
                      <p className="text-blue-100 text-sm">{selectedProduct.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAdjustModal(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Current Stock Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Current Stock</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {selectedProduct.stock?.current || 0}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Package className="w-4 h-4 mr-1" />
                    SKU: {selectedProduct.sku}
                  </div>
                </div>

                {/* Adjustment Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjustment Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setAdjustmentType('add')}
                      className={`flex items-center justify-center px-4 py-3 rounded-lg border transition-colors ${
                        adjustmentType === 'add'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <ArrowUp className="w-4 h-4 mr-2" />
                      Add Stock
                    </button>
                    <button
                      onClick={() => setAdjustmentType('subtract')}
                      className={`flex items-center justify-center px-4 py-3 rounded-lg border transition-colors ${
                        adjustmentType === 'subtract'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <ArrowDown className="w-4 h-4 mr-2" />
                      Remove Stock
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={adjustmentQuantity}
                    onChange={(e) => setAdjustmentQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Reason */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Optional)
                  </label>
                  <select
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select reason</option>
                    <option value="stock_received">Stock Received</option>
                    <option value="stock_sold">Stock Sold</option>
                    <option value="damaged_goods">Damaged Goods</option>
                    <option value="theft_loss">Theft/Loss</option>
                    <option value="inventory_count">Inventory Count</option>
                    <option value="return_refund">Return/Refund</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Preview */}
                {adjustmentQuantity && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-6">
                    <div className="text-sm text-blue-800">
                      <strong>Preview:</strong> Stock will change from{' '}
                      <span className="font-semibold">{selectedProduct.stock?.current || 0}</span> to{' '}
                      <span className="font-semibold">
                        {adjustmentType === 'add' 
                          ? (selectedProduct.stock?.current || 0) + parseInt(adjustmentQuantity || 0)
                          : Math.max(0, (selectedProduct.stock?.current || 0) - parseInt(adjustmentQuantity || 0))
                        }
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAdjustModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStockAdjustment}
                    disabled={!adjustmentQuantity}
                    className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${
                      adjustmentType === 'add'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {adjustmentType === 'add' ? 'Add' : 'Remove'} Stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stock History Modal */}
        {showHistoryModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden animate-in fade-in duration-300">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      <History className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Stock History</h3>
                      <p className="text-purple-100 text-sm">{selectedProduct.name} - SKU: {selectedProduct.sku}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col h-[calc(95vh-140px)]">
                {/* Statistics Summary */}
                {historyStats && (
                  <div className="bg-gray-50 border-b p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Total In</div>
                        <div className="text-lg font-bold text-green-600">+{historyStats.total_in}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Total Out</div>
                        <div className="text-lg font-bold text-red-600">-{historyStats.total_out}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Net Movement</div>
                        <div className={`text-lg font-bold ${historyStats.net_movement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {historyStats.net_movement >= 0 ? '+' : ''}{historyStats.net_movement}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Current Stock</div>
                        <div className="text-lg font-bold text-blue-600">{historyStats.current_stock}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filters */}
                <div className="bg-white border-b p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <select
                      value={historyFilters.type}
                      onChange={(e) => setHistoryFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="adjustment_in">Stock In</option>
                      <option value="adjustment_out">Stock Out</option>
                      <option value="sale">Sale</option>
                      <option value="purchase">Purchase</option>
                      <option value="damage_loss">Damage/Loss</option>
                      <option value="return_in">Return In</option>
                      <option value="inventory_count">Count Adjustment</option>
                    </select>
                    
                    <select
                      value={historyFilters.reason}
                      onChange={(e) => setHistoryFilters(prev => ({ ...prev, reason: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">All Reasons</option>
                      <option value="manual_adjustment">Manual Adjustment</option>
                      <option value="inventory_count">Inventory Count</option>
                      <option value="stock_sold">Stock Sold</option>
                      <option value="damaged_goods">Damaged Goods</option>
                      <option value="theft_loss">Theft/Loss</option>
                    </select>

                    <input
                      type="date"
                      value={historyFilters.startDate}
                      onChange={(e) => setHistoryFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Start Date"
                    />

                    <button
                      onClick={() => loadStockHistory(selectedProduct._id)}
                      className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto p-4">
                  {historyLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                      <span className="ml-2 text-gray-600">Loading history...</span>
                    </div>
                  ) : stockHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No stock movements found</p>
                      <p className="text-sm text-gray-500">Stock movements will appear here once recorded</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stockHistory.map((movement, index) => {
                        const isInbound = movement.direction === 'in' || 
                          ['adjustment_in', 'purchase', 'return_in', 'transfer_in', 'production_in', 'initial_stock'].includes(movement.type);
                        
                        return (
                          <div
                            key={movement._id || index}
                            className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <div className={`p-2 rounded-lg ${
                                  isInbound 
                                    ? 'bg-green-100 text-green-600' 
                                    : 'bg-red-100 text-red-600'
                                }`}>
                                  {isInbound ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">
                                      {movement.description || movement.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </h4>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      isInbound 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {isInbound ? '+' : '-'}{movement.quantity}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                    <span className="flex items-center">
                                      <Clock className="w-4 h-4 mr-1" />
                                      {new Date(movement.movement_date).toLocaleString()}
                                    </span>
                                    <span className="flex items-center">
                                      <User className="w-4 h-4 mr-1" />
                                      {movement.created_by?.name || 'System'}
                                    </span>
                                  </div>

                                  <div className="flex items-center text-sm text-gray-500">
                                    <span className="mr-4">
                                      Stock: {movement.previous_stock} → {movement.new_stock}
                                    </span>
                                    {movement.total_cost && (
                                      <span>Value: ${movement.total_cost.toFixed(2)}</span>
                                    )}
                                  </div>

                                  {movement.notes && (
                                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                                      <strong>Note:</strong> {movement.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default InventoryManagement;