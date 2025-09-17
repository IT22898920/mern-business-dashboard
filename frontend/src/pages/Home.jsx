import React, { useState, useEffect } from 'react';
import { Star, ArrowRight, Mail, Phone, Eye, Calendar, User, Lock, UserCircle, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import designService from '../services/designService';
import { useAuth } from '../contexts/AuthContext';

const InteriorDesignHomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Hero images for sliding carousel
  const heroImages = [
    {
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Modern Living Room',
      description: 'Elegant contemporary design'
    },
    {
      url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Luxury Bedroom',
      description: 'Sophisticated comfort'
    },
    {
      url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Minimalist Kitchen',
      description: 'Clean and functional design'
    },
    {
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Cozy Reading Nook',
      description: 'Perfect for relaxation'
    }
  ];

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setLoading(true);
        const designsData = await designService.getAllDesigns();
        setDesigns(designsData);
      } catch (err) {
        setError('Failed to load designs');
        console.error('Error fetching designs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <Navbar />

      {/* Profile Icon for Employees */}
      {isAuthenticated && user && user.role === 'employee' && (
        <div className="fixed top-24 right-6 z-50">
          <Link
            to="/staff/dashboard"
            className="group bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            title="Go to Staff Dashboard"
          >
            <UserCircle className="h-8 w-8 text-[#9c7c38] group-hover:text-[#8a6d32] transition-colors duration-300" />
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Sliding Images Background */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
                <div className="absolute inset-0 bg-black/50"></div>
            </div>
          ))}
        </div>
        
        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-all duration-300"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-all duration-300"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
        
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          {/* Employee Welcome Message */}
          {isAuthenticated && user && user.role === 'employee' && (
            <div className="mb-8">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white mb-4">
                <UserCircle className="h-5 w-5 mr-2 text-white" />
                <span className="text-sm font-medium">Welcome back, {user.name || 'Employee'}!</span>
              </div>
              <div className="flex justify-center">
                <Link
                  to="/staff/dashboard"
                  className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm text-black rounded-full font-semibold hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <UserCircle className="h-5 w-5 mr-2" />
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </div>
          )}
          
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-6">
            <span className="text-white">
              Transform
            </span>
            <br />
            <span className="text-[#9c7c38]">Your Space</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Creating extraordinary living spaces that reflect your personality and lifestyle. 
            From concept to completion, we bring your dream home to life.
          </p>
          
          {/* Scroll down arrow */}
          <div className="flex justify-center mt-12">
            <a 
              href="#interior-design"
              className="animate-bounce text-white hover:text-[#9c7c38] transition-colors duration-300"
              aria-label="Scroll to services section"
            >
              <ChevronDown className="h-8 w-8" />
            </a>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-[#9c7c38] rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-32 right-10 w-16 h-16 bg-[#9c7c38] rounded-full opacity-50 animate-bounce"></div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-[#9c7c38] rounded-full opacity-40 animate-ping"></div>
      </section>

      {/* Services Preview */}
      <section id="interior-design" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-black mb-4">
              Interior Design Services
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
              Comprehensive design solutions tailored to your unique style and needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Residential Design",
                description: "Complete home makeovers from living rooms to bedrooms",
                icon: "🏠"
              },
              {
                title: "Commercial Spaces",
                description: "Professional office and retail space design",
                icon: "🏢"
              },
              {
                title: "Custom Furniture",
                description: "Bespoke furniture pieces designed for your space",
                icon: "🪑"
              }
            ].map((service, index) => (
              <div 
                key={index} 
                className="group relative bg-white p-8 rounded-3xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 border border-gray-100 overflow-hidden"
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#9c7c38]/5 via-transparent to-[#9c7c38]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Icon with animated background */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#9c7c38]/10 to-[#9c7c38]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{service.icon}</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-black mb-4 group-hover:text-[#9c7c38] transition-colors duration-300">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{service.description}</p>
                
                {/* Enhanced button */}
                <button className="relative group/btn text-black hover:text-[#9c7c38] font-semibold flex items-center space-x-2 transition-all duration-300 hover:translate-x-1">
                  <span>Learn More</span>
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#9c7c38] group-hover:w-full transition-all duration-300"></div>
                </button>
                
                {/* Decorative corner element */}
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#9c7c38]/20 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">What Our Clients Say</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                text: "Furniture Hub transformed our home beyond our wildest dreams. The attention to detail is incredible!",
                rating: 5
              },
              {
                name: "Michael Chen",
                text: "Professional, creative, and always on time. Our office space has never looked better.",
                rating: 5
              },
              {
                name: "Emily Davis",
                text: "The custom furniture pieces they designed are absolutely stunning. Highly recommend!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-500 border border-gray-100 overflow-hidden"
                style={{
                  animationDelay: `${index * 0.15}s`,
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                {/* Animated background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#9c7c38]/3 via-transparent to-[#9c7c38]/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Quote icon */}
                <div className="absolute top-4 left-4 text-[#9c7c38]/20 text-4xl font-serif group-hover:text-[#9c7c38]/30 transition-colors duration-300">
                  "
                </div>
                
                {/* Stars with staggered animation */}
                <div className="flex items-center mb-6 mt-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-5 w-5 text-[#9c7c38] fill-current group-hover:scale-110 transition-all duration-300" 
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        animation: 'fadeInScale 0.6s ease-out forwards'
                      }}
                    />
                  ))}
                </div>
                
                {/* Testimonial text */}
                <p className="text-gray-600 mb-6 italic leading-relaxed relative z-10 group-hover:text-gray-700 transition-colors duration-300 text-lg">
                  {testimonial.text}
                </p>
                
                {/* Author with enhanced styling */}
                <div className="flex items-center space-x-3 relative z-10">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#9c7c38]/20 to-[#9c7c38]/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-[#9c7c38] font-bold text-sm">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-black group-hover:text-[#9c7c38] transition-colors duration-300">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500">Verified Customer</p>
                  </div>
                </div>
                
                {/* Decorative bottom border */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#9c7c38]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Designs Gallery */}
      <section id="designs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-black mb-4">
              User Design Gallery
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
              Explore amazing interior designs created by our talented community of designers
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          ) : designs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No designs available yet. Be the first to share your design!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {designs.map((design, index) => (
                <div 
                  key={design._id} 
                  className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-gray-100"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'fadeInUp 0.8s ease-out forwards'
                  }}
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#9c7c38]/5 via-transparent to-[#9c7c38]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                  
                  {design.imageURL && (
                    <Link to={`/design/${design._id}`} className="relative h-64 overflow-hidden block">
                      <img 
                        src={design.imageURL} 
                        alt={design.projectName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      {/* Image overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                      
                      {/* Enhanced status badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border shadow-lg transition-all duration-300 ${
                          design.status === 'Completed' 
                            ? 'bg-green-100/90 text-green-800 border-green-200' 
                            : design.status === 'Review'
                            ? 'bg-yellow-100/90 text-yellow-800 border-yellow-200'
                            : 'bg-blue-100/90 text-blue-800 border-blue-200'
                        } group-hover:scale-110`}>
                          {design.status}
                        </span>
                      </div>
                      
                      {/* Hover overlay with view icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                          <Eye className="h-8 w-8 text-[#9c7c38]" />
                        </div>
                      </div>
                    </Link>
                  )}
                  
                  <div className="p-6 relative z-10">
                    <Link to={`/design/${design._id}`}>
                      <h3 className="text-xl font-bold text-black mb-3 hover:text-[#9c7c38] transition-colors duration-300 group-hover:translate-x-1">
                        {design.projectName}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                      {design.description}
                    </p>
                    
                    {/* Enhanced metadata */}
                    <div className="flex items-center justify-between text-sm mb-6">
                      <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-3 py-2 group-hover:bg-[#9c7c38]/10 transition-colors duration-300">
                        <User className="h-4 w-4 text-[#9c7c38]" />
                        <span className="text-gray-600 font-medium">{design.clientName}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-3 py-2 group-hover:bg-[#9c7c38]/10 transition-colors duration-300">
                        <Calendar className="h-4 w-4 text-[#9c7c38]" />
                        <span className="text-gray-600 font-medium">{new Date(design.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Enhanced button */}
                    <Link
                      to={`/design/${design._id}`}
                      className="group/btn relative w-full bg-[#9c7c38] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#8a6d32] hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                      <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                      <span>View Details</span>
                    </Link>
                  </div>
                  
                  {/* Decorative corner */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#9c7c38]/20 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          )}

          {/* Login Prompt for Non-Authenticated Users */}
          {!isAuthenticated && (
            <div className="mt-16 text-center">
              <div className="group relative bg-white rounded-3xl p-10 border border-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 overflow-hidden max-w-2xl mx-auto">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#9c7c38]/5 via-transparent to-[#9c7c38]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Floating particles animation */}
                <div className="absolute top-4 left-4 w-2 h-2 bg-[#9c7c38]/30 rounded-full animate-ping"></div>
                <div className="absolute top-8 right-8 w-1 h-1 bg-[#9c7c38]/40 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-[#9c7c38]/30 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
                
                <div className="relative z-10">
                  {/* Enhanced icon with animation */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="bg-[#9c7c38] rounded-full p-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                        <Lock className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="absolute inset-0 bg-[#9c7c38]/20 rounded-full animate-ping"></div>
                  </div>
                </div>
                  
                  <h3 className="text-2xl font-bold text-black mb-3 group-hover:text-[#9c7c38] transition-colors duration-300">
                  Want to Contact Designers?
                </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed text-lg group-hover:text-gray-700 transition-colors duration-300">
                  Register for free to contact designers, save your favorite designs, and get personalized recommendations.
                </p>
                  
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/register"
                      className="group/btn relative bg-[#9c7c38] text-white py-4 px-8 rounded-xl font-semibold hover:bg-[#8a6d32] hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 overflow-hidden"
                  >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                      <User className="h-5 w-5 group-hover/btn:scale-110 transition-transform duration-300" />
                    <span>Register Now</span>
                  </Link>
                  <Link
                    to="/login"
                      className="group/btn relative border-2 border-[#9c7c38] text-[#9c7c38] py-4 px-8 rounded-xl font-semibold hover:bg-[#9c7c38] hover:text-white transition-all duration-300 flex items-center justify-center space-x-2 overflow-hidden"
                  >
                      <div className="absolute inset-0 bg-[#9c7c38] scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left"></div>
                      <Lock className="h-5 w-5 group-hover/btn:scale-110 transition-transform duration-300 relative z-10" />
                      <span className="relative z-10">Login</span>
                  </Link>
                </div>
                </div>
                
                {/* Decorative corners */}
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#9c7c38]/20 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#9c7c38]/20 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">Ready to Start Your Project?</h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Get in touch with us today for a free consultation and let's bring your vision to life
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full">
              <Mail className="h-5 w-5 text-[#9c7c38]" />
              <span className="text-sm sm:text-base">hello@furniturehub.com</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full">
              <Phone className="h-5 w-5 text-[#9c7c38]" />
              <span className="text-sm sm:text-base">+94 77 123 4567</span>
            </div>
          </div>
          
          <button className="bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#9c7c38] hover:text-white hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Contact Us Today
          </button>
        </div>
      </section>

      <Footer />
    </div>
    
  );
};

export default InteriorDesignHomePage;
