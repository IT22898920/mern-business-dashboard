import React, { useState, useEffect } from 'react';
import { 
  X, Upload, Image, Loader2, Package, DollarSign, 
  Tag, Barcode, Camera, Star, Eye, Truck, 
  Palette, Ruler, Weight, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';

const EditProductModal = ({ isOpen, onClose, onProductUpdated, product }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    sku: '',
    category: '',
    brand: '',
    tags: '',
    price: '',
    cost_price: '',
    compare_at_price: '',
    stock: {
      current: '',
      low_stock_threshold: '',
      track_inventory: true
    },
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
      unit: 'cm',
      weight_unit: 'kg'
    },
    status: 'active',
    visibility: 'public',
    featured: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImage, setExistingImage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (product) {
        populateFormData(product);
      }
    }
  }, [isOpen, product]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const populateFormData = (product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      short_description: product.short_description || '',
      sku: product.sku || '',
      category: product.category?._id || product.category || '',
      brand: product.brand || '',
      tags: product.tags ? product.tags.join(', ') : '',
      price: product.price || '',
      cost_price: product.cost_price || '',
      compare_at_price: product.compare_at_price || '',
      stock: {
        current: product.stock?.current || '',
        low_stock_threshold: product.stock?.low_stock_threshold || '',
        track_inventory: product.stock?.track_inventory ?? true
      },
      dimensions: {
        length: product.dimensions?.length || '',
        width: product.dimensions?.width || '',
        height: product.dimensions?.height || '',
        weight: product.dimensions?.weight || '',
        unit: product.dimensions?.unit || 'cm',
        weight_unit: product.dimensions?.weight_unit || 'kg'
      },
      status: product.status || 'active',
      visibility: product.visibility || 'public',
      featured: product.featured || false
    });

    // Set existing image
    if (product.images && product.images[0]) {
      setExistingImage(product.images[0]);
      setImagePreview(''); // Clear any new image preview
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setExistingImage(null); // Clear existing image when new one is selected
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setExistingImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare product data
      const productData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        price: parseFloat(formData.price) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        compare_at_price: parseFloat(formData.compare_at_price) || 0,
        stock: {
          current: parseInt(formData.stock.current) || 0,
          low_stock_threshold: parseInt(formData.stock.low_stock_threshold) || 10,
          track_inventory: formData.stock.track_inventory
        },
        dimensions: {
          length: parseFloat(formData.dimensions.length) || 0,
          width: parseFloat(formData.dimensions.width) || 0,
          height: parseFloat(formData.dimensions.height) || 0,
          weight: parseFloat(formData.dimensions.weight) || 0,
          unit: formData.dimensions.unit,
          weight_unit: formData.dimensions.weight_unit
        }
      };

      // Handle image updates
      if (imageFile && imagePreview) {
        try {
          // Upload new image to Cloudinary
          const uploadResult = await productService.uploadImage(imagePreview, formData.name);
          
          if (uploadResult.success) {
            productData.images = [{
              public_id: uploadResult.data.public_id,
              url: uploadResult.data.url,
              alt_text: uploadResult.data.alt_text || formData.name,
              is_primary: true
            }];
          }
        } catch (uploadError) {
          toast.error('Failed to upload image');
          console.error('Image upload error:', uploadError);
          setLoading(false);
          return;
        }
      } else if (existingImage) {
        // Keep existing image
        productData.images = [existingImage];
      } else {
        // Remove all images
        productData.images = [];
      }

      await productService.updateProduct(product._id, productData);
      toast.success('Product updated successfully!');
      onProductUpdated();
      handleClose();
    } catch (error) {
      toast.error('Failed to update product');
      console.error('Update product error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      short_description: '',
      sku: '',
      category: '',
      brand: '',
      tags: '',
      price: '',
      cost_price: '',
      compare_at_price: '',
      stock: {
        current: '',
        low_stock_threshold: '',
        track_inventory: true
      },
      dimensions: {
        length: '',
        width: '',
        height: '',
        weight: '',
        unit: 'cm',
        weight_unit: 'kg'
      },
      status: 'active',
      visibility: 'public',
      featured: false
    });
    setImageFile(null);
    setImagePreview('');
    setExistingImage(null);
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden animate-in fade-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-10 rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="flex items-center justify-between relative">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Product</h2>
                <p className="text-emerald-100">Update product information</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[calc(95vh-140px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Image Upload Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Camera className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Product Image</h3>
              </div>
              
              <div className="relative">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors duration-200">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img 
                        src={imagePreview} 
                        alt="New Preview" 
                        className="max-w-full max-h-48 mx-auto rounded-lg shadow-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        Remove New Image
                      </button>
                    </div>
                  ) : existingImage ? (
                    <div className="space-y-4">
                      <img 
                        src={existingImage.url} 
                        alt={existingImage.alt_text || product.name} 
                        className="max-w-full max-h-48 mx-auto rounded-lg shadow-lg object-cover"
                      />
                      <div className="flex justify-center space-x-2">
                        <span className="text-sm text-gray-600">Current image</span>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                        >
                          Remove Current Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                        <Upload className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Click to upload product image</p>
                        <p className="text-gray-400 text-sm">PNG, JPG or WEBP up to 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Short Description
                      </label>
                      <input
                        type="text"
                        name="short_description"
                        value={formData.short_description}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Brief product description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="Detailed product description"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                          <Barcode className="w-4 h-4" />
                          <span>SKU</span>
                        </label>
                        <input
                          type="text"
                          name="sku"
                          value={formData.sku}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                          <Palette className="w-4 h-4" />
                          <span>Brand</span>
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={formData.brand}
                          onChange={handleInputChange}
                          placeholder="Product brand"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                        <Tag className="w-4 h-4" />
                        <span>Tags</span>
                      </label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="tag1, tag2, tag3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Ruler className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Dimensions & Weight</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                      <input
                        type="number"
                        name="dimensions.length"
                        value={formData.dimensions.length}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                      <input
                        type="number"
                        name="dimensions.width"
                        value={formData.dimensions.width}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                      <input
                        type="number"
                        name="dimensions.height"
                        value={formData.dimensions.height}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                        <Weight className="w-4 h-4" />
                        <span>Weight</span>
                      </label>
                      <input
                        type="number"
                        name="dimensions.weight"
                        value={formData.dimensions.weight}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Settings Sidebar */}
              <div className="space-y-6">
                {/* Pricing */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6 shadow-sm">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selling Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="cost_price"
                        value={formData.cost_price}
                        onChange={handleInputChange}
                        required
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compare At Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="compare_at_price"
                        value={formData.compare_at_price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Stock */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Package className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Inventory</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Stock
                      </label>
                      <input
                        type="number"
                        name="stock.current"
                        value={formData.stock.current}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Low Stock Alert
                      </label>
                      <input
                        type="number"
                        name="stock.low_stock_threshold"
                        value={formData.stock.low_stock_threshold}
                        onChange={handleInputChange}
                        placeholder="10"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Eye className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Visibility
                      </label>
                      <select
                        name="visibility"
                        value={formData.visibility}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <Star className="w-4 h-4" />
                        <span>Featured Product</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Updating Product...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Update Product</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;