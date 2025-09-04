import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, ShoppingCart, Heart, Star, Eye,
  TrendingUp, Tag, ChevronLeft, ChevronRight, Grid, List,
  Loader2, AlertCircle, CheckCircle, Clock, Truck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ProductsCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Load products and categories
  useEffect(() => {
    loadData();
  }, [currentPage, selectedCategory, sortBy, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        status: 'active', // Only show active products to users
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
        ...(sortBy && { sort: sortBy })
      };

      const [productsResponse, categoriesResponse] = await Promise.all([
        productService.getProducts(params),
        categoryService.getCategories()
      ]);

      setProducts(productsResponse.data || []);
      setTotalPages(productsResponse.pagination?.totalPages || 1);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      toast.error('Failed to load products');
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData();
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Calculate discount percentage
  const calculateDiscount = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  // Get stock status
  const getStockStatus = (product) => {
    const stock = product.stock?.current || 0;
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50' };
    if (stock <= 10) return { text: `Only ${stock} left`, color: 'text-orange-600', bg: 'bg-orange-50' };
    return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-50' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold mb-4 text-center">Our Products</h1>
          <p className="text-xl text-center text-blue-100 mb-8">
            Discover amazing products at unbeatable prices
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-14 pr-6 py-4 text-gray-900 bg-white rounded-full text-lg shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filters and Products Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="featured">Featured</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="rating">Best Rated</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-all ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {products.length} products
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== 'all' && ` in ${categories.find(c => c._id === selectedCategory)?.name}`}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading products...</span>
          </div>
        ) : (
          <>
            {/* Products Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const discount = calculateDiscount(product.price, product.original_price);
                  
                  return (
                    <div
                      key={product._id}
                      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-20 h-20 text-gray-300" />
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          {product.featured && (
                            <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                              FEATURED
                            </span>
                          )}
                          {discount > 0 && (
                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                              -{discount}%
                            </span>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                            <Heart className="w-5 h-5 text-gray-600" />
                          </button>
                          <button 
                            onClick={() => navigate(`/product/${product._id}`)}
                            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                          >
                            <Eye className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>

                        {/* Add to Cart Button */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button className="w-full py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            Add to Cart
                          </button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        {/* Category */}
                        <p className="text-xs text-gray-500 font-medium mb-2">
                          {product.category?.name || 'Uncategorized'}
                        </p>

                        {/* Product Name */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer">
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (product.rating || 4)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-500 ml-1">
                            ({product.reviews || 0})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.original_price)}
                            </span>
                          )}
                        </div>

                        {/* Stock Status */}
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                          {stockStatus.text === 'In Stock' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : stockStatus.text === 'Out of Stock' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                          {stockStatus.text}
                        </div>

                        {/* Delivery Info */}
                        {product.stock?.current > 0 && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                            <Truck className="w-4 h-4" />
                            <span>Free delivery available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const discount = calculateDiscount(product.price, product.original_price);
                  
                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div className="w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-16 h-16 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                {product.category?.name || 'Uncategorized'}
                              </p>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {product.name}
                              </h3>
                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {product.short_description || 'No description available'}
                              </p>
                              
                              {/* Rating */}
                              <div className="flex items-center gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < (product.rating || 4)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="text-sm text-gray-500 ml-1">
                                  ({product.reviews || 0} reviews)
                                </span>
                              </div>

                              {/* Stock Status */}
                              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                                {stockStatus.text}
                              </div>
                            </div>

                            <div className="text-right">
                              {/* Badges */}
                              <div className="flex flex-col gap-2 mb-3">
                                {product.featured && (
                                  <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                                    FEATURED
                                  </span>
                                )}
                                {discount > 0 && (
                                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                    SAVE {discount}%
                                  </span>
                                )}
                              </div>

                              {/* Price */}
                              <div className="mb-4">
                                <div className="text-2xl font-bold text-gray-900">
                                  {formatPrice(product.price)}
                                </div>
                                {product.original_price && product.original_price > product.price && (
                                  <div className="text-sm text-gray-500 line-through">
                                    {formatPrice(product.original_price)}
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 justify-end">
                                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                  <Heart className="w-5 h-5 text-gray-600" />
                                </button>
                                <button
                                  onClick={() => navigate(`/product/${product._id}`)}
                                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                                >
                                  View Details
                                </button>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                                  <ShoppingCart className="w-4 h-4" />
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {products.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductsCatalog;