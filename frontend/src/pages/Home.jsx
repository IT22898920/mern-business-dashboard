import React, { useState, useEffect } from 'react';
import { Star, ArrowRight, Mail, Phone, Eye, Calendar, User, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getAllDesigns } from '../services/designService';
import { useAuth } from '../contexts/AuthContext';

const InteriorDesignHomePage = () => {
  const { isAuthenticated } = useAuth();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setLoading(true);
        const designsData = await getAllDesigns();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 opacity-70"></div>
        
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500">
              Transform
            </span>
            <br />
            <span className="text-gray-800">Your Space</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Creating extraordinary living spaces that reflect your personality and lifestyle. 
            From concept to completion, we bring your dream home to life.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2">
              <span>Start Your Project</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            
            <button className="border-2 border-gray-800 text-gray-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 hover:text-white transition-all duration-300">
              View Portfolio
            </button>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-32 right-10 w-16 h-16 bg-pink-300 rounded-full opacity-50 animate-bounce"></div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-blue-200 rounded-full opacity-40 animate-ping"></div>
      </section>

      {/* Services Preview */}
      <section id="interior-design" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-800 mb-4">
              Interior Design Services
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
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
                className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8 rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <button className="text-purple-600 hover:text-pink-500 font-semibold flex items-center space-x-1">
                  <span>Learn More</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">What Our Clients Say</h2>
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
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-purple-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic leading-relaxed">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-800">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Designs Gallery */}
      <section id="designs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-800 mb-4">
              User Design Gallery
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Explore amazing interior designs created by our talented community of designers
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
              {designs.map((design) => (
                <div 
                  key={design._id} 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {design.imageURL && (
                    <Link to={`/design/${design._id}`} className="relative h-64 overflow-hidden block">
                      <img 
                        src={design.imageURL} 
                        alt={design.projectName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          design.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : design.status === 'Review'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {design.status}
                        </span>
                      </div>
                    </Link>
                  )}
                  
                  <div className="p-6">
                    <Link to={`/design/${design._id}`}>
                      <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-purple-600 transition-colors duration-300">{design.projectName}</h3>
                    </Link>
                    <p className="text-gray-600 mb-4 line-clamp-3">{design.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{design.clientName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(design.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <Link
                      to={`/design/${design._id}`}
                      className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Login Prompt for Non-Authenticated Users */}
          {!isAuthenticated && (
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
                <div className="flex justify-center mb-4">
                  <div className="bg-purple-100 rounded-full p-3">
                    <Lock className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Want to Contact Designers?
                </h3>
                <p className="text-gray-600 mb-6">
                  Register for free to contact designers, save your favorite designs, and get personalized recommendations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <User className="h-5 w-5" />
                    <span>Register Now</span>
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-purple-600 text-purple-600 py-3 px-6 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Lock className="h-5 w-5" />
                    <span>Login</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">Ready to Start Your Project?</h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Get in touch with us today for a free consultation and let's bring your vision to life
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full">
              <Mail className="h-5 w-5 text-purple-500" />
              <span className="text-sm sm:text-base">hello@furniturehub.com</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full">
              <Phone className="h-5 w-5 text-pink-500" />
              <span className="text-sm sm:text-base">+94 77 123 4567</span>
            </div>
          </div>
          
          <button className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Contact Us Today
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InteriorDesignHomePage;
