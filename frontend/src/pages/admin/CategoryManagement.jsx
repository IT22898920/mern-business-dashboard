import React, { useState, useEffect } from 'react';
import { 
  Tag, Plus, Search, Filter, Edit, Trash2, Eye, X,
  AlertTriangle, CheckCircle, XCircle, Star,
  DollarSign, TrendingUp, TrendingDown, MoreHorizontal,
  Layers, ShoppingCart, BarChart3, Download,
  Upload, RefreshCw, Archive, Copy, ExternalLink, Loader2,
  Grid, List, ChevronLeft, ChevronRight, FolderTree
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { categoryService } from '../../services/categoryService';
import AddCategoryModal from '../../components/admin/AddCategoryModal';

const CategoryManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [currentPage, selectedStatus, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load categories with filters
      const params = {
        page: currentPage,
        limit: 12,
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(searchQuery && { search: searchQuery })
      };

      const [categoriesResponse, statsResponse] = await Promise.all([
        categoryService.getCategories(params),
        categoryService.getCategoryStats()
      ]);

      setCategories(categoriesResponse.data || []);
      setTotalPages(categoriesResponse.pagination?.totalPages || 1);
      setStats(statsResponse.data || {});
    } catch (error) {
      toast.error('Failed to load categories');
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search - auto search on input change
  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle form submit search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  // Handle delete category
  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  // Confirm delete category
  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      await categoryService.deleteCategory(categoryToDelete._id);
      toast.success('Category deleted successfully');
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      loadData();
    } catch (error) {
      toast.error('Failed to delete category');
      console.error('Delete error:', error);
    }
  };

  // Handle view category
  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  // Handle edit category
  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedCategories.length === 0) {
      toast.error('Please select categories first');
      return;
    }

    try {
      let message = '';

      switch (action) {
        case 'activate':
          for (const categoryId of selectedCategories) {
            await categoryService.updateCategory(categoryId, { status: 'active' });
          }
          message = 'Categories activated successfully';
          break;
        case 'deactivate':
          for (const categoryId of selectedCategories) {
            await categoryService.updateCategory(categoryId, { status: 'inactive' });
          }
          message = 'Categories deactivated successfully';
          break;
        case 'delete':
          if (!window.confirm(`Are you sure you want to delete ${selectedCategories.length} categories?`)) return;
          for (const categoryId of selectedCategories) {
            await categoryService.deleteCategory(categoryId);
          }
          message = 'Categories deleted successfully';
          break;
        default:
          return;
      }

      toast.success(message);
      setSelectedCategories([]);
      loadData();
    } catch (error) {
      toast.error('Bulk action failed');
      console.error('Bulk action error:', error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Handle category added
  const handleCategoryAdded = () => {
    loadData();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
            <p className="text-gray-600 mt-1">Manage product categories and hierarchy</p>
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
            
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Categories</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCategories || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Tag className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Categories</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeCategories || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Parent Categories</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.parentCategories || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FolderTree className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">With Products</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.categoriesWithProducts || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-orange-600" />
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
              <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>

              {/* Filters and Actions */}
              <div className="flex items-center gap-3">
                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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

            {/* Bulk Actions */}
            {selectedCategories.length > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedCategories.length} category(s) selected
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

          {/* Categories Table/Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading categories...</span>
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
                        checked={selectedCategories.length === categories.length && categories.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories(categories.map(c => c._id));
                          } else {
                            setSelectedCategories([]);
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category._id]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(id => id !== category._id));
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <Tag className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                            <div className="text-sm text-gray-500">#{category.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {category.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            category.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {category.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.productCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(category.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewCategory(category)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Category"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditCategory(category)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit Category"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {categories.length === 0 && (
                <div className="text-center py-12">
                  <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No categories found</p>
                </div>
              )}
            </div>
          ) : (
            /* Grid View */
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <div key={category._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                            <Tag className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                            <p className="text-sm text-gray-500">#{category.slug}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category._id]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(id => id !== category._id));
                            }
                          }}
                          className="rounded"
                        />
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            category.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {category.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {category.productCount || 0} products
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {formatDate(category.createdAt)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewCategory(category)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="View Category"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditCategory(category)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Edit Category"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {categories.length === 0 && (
                <div className="text-center py-12">
                  <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No categories found</p>
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

        {/* Add Category Modal */}
        <AddCategoryModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onCategoryAdded={handleCategoryAdded}
        />

        {/* View Category Modal */}
        {showViewModal && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Category Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{selectedCategory.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <p className="text-gray-600">#{selectedCategory.slug}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{selectedCategory.description || 'No description'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      selectedCategory.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedCategory.status}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Products</label>
                    <p className="text-gray-900">{selectedCategory.productCount || 0}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <p className="text-gray-600">{formatDate(selectedCategory.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 p-6 border-t">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditCategory(selectedCategory);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Edit Category
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {showEditModal && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Edit Category</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  status: formData.get('status')
                };
                
                try {
                  await categoryService.updateCategory(selectedCategory._id, data);
                  toast.success('Category updated successfully');
                  setShowEditModal(false);
                  loadData();
                } catch (error) {
                  toast.error('Failed to update category');
                  console.error('Update error:', error);
                }
              }} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedCategory.name}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={selectedCategory.description}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={selectedCategory.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Update Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && categoryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
                    <p className="text-gray-600">This action cannot be undone.</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <Tag className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{categoryToDelete.name}</p>
                      <p className="text-sm text-gray-500">#{categoryToDelete.slug}</p>
                    </div>
                  </div>
                  {categoryToDelete.productCount > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                        <p className="text-sm text-yellow-800">
                          This category has {categoryToDelete.productCount} product(s) associated with it.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete the category "{categoryToDelete.name}"? 
                  {categoryToDelete.productCount > 0 && (
                    <span className="text-red-600"> Products in this category will need to be reassigned.</span>
                  )}
                </p>
                
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCategoryToDelete(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteCategory}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <Trash2 className="w-4 h-4 mr-2 inline" />
                    Delete Category
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

export default CategoryManagement;