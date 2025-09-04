import React from 'react';
import { Star, ArrowRight, Mail, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const InteriorDesignHomePage = () => {
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
