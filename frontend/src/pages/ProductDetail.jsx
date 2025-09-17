import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { productService } from '../services/productService';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await productService.getProduct(id);
      console.log('Product API Response:', response);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product details');
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock?.current || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    toast.success(`Added ${quantity} ${product.name} to cart!`);
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-black animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-600">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">Sorry, we couldn't find the product you're looking for.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Back to Products
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Extract image URLs from product data
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => img.url || img) 
    : ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PGcgZmlsbD0iIzlmYTZiNyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjI2cHgiPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iMC4zZW0iPk5vIEltYWdlPC90ZXh0PjwvZz48L3N2Zz4='];
  
  console.log('Product images:', product.images);
  console.log('Processed images:', images);
  const stockStatus = product.stock?.current > 0 ? 'In Stock' : 'Out of Stock';
  const stockColor = product.stock?.current > 10 ? 'text-green-600' : product.stock?.current > 0 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/products')}
          className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 mb-8 transition-colors duration-300"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Products</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PGcgZmlsbD0iIzlmYTZiNyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjI2cHgiPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iMC4zZW0iPk5vIEltYWdlPC90ZXh0PjwvZz48L3N2Zz4=';
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === index ? 'border-amber-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjxnIGZpbGw9IiM5ZmE2YjciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2Usc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMnB4Ij48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZHk9IjAuM2VtIj5ObyBJbWFnZTwvdGV4dD48L2c+PC9zdmc+';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-black mb-2">{product.name}</h1>
              <p className="text-sm text-amber-600 font-medium uppercase tracking-wide">
                {product.category?.name || 'Uncategorized'}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-bold text-black">
                ${product.price?.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating || 4.5)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({product.reviews || 0} reviews)
              </span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <span className={`font-semibold ${stockColor}`}>{stockStatus}</span>
              {product.stock?.current > 0 && (
                <span className="text-sm text-gray-600">
                  ({product.stock.current} available)
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-black mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            {product.stock?.current > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                      disabled={quantity >= product.stock.current}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add to Cart</span>
                  </button>
                  
                  <button
                    onClick={handleToggleWishlist}
                    className={`px-6 py-4 rounded-full font-semibold border-2 transition-all duration-300 ${
                      isWishlisted
                        ? 'bg-red-50 border-red-500 text-red-500'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Truck className="h-5 w-5 text-amber-500" />
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="h-5 w-5 text-amber-500" />
                <span>1 Year Warranty</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <RefreshCw className="h-5 w-5 text-amber-500" />
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;