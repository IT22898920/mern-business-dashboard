import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, User, MapPin, MessageCircle, Star, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getDesignById } from '../services/designService';
import { createClientContact } from '../services/clientContactService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const DesignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        setLoading(true);
        const designData = await getDesignById(id);
        setDesign(designData);
      } catch (err) {
        setError('Failed to load design details');
        console.error('Error fetching design:', err);
        toast.error('Failed to load design details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDesign();
    }
  }, [id]);

  const handleContactFormChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  const handleContactClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to contact the designer');
      navigate('/login');
      return;
    }
    setShowContactForm(true);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Save client contact to database
      await createClientContact({
        designId: design._id,
        clientName: contactForm.name,
        clientEmail: contactForm.email,
        clientPhone: contactForm.phone,
        message: contactForm.message
      });

      // Create mailto link with form data
      const subject = `Inquiry about ${design.projectName} Design`;
      const body = `Hello,

I am interested in your design project "${design.projectName}".

My Details:
Name: ${contactForm.name}
Email: ${contactForm.email}
Phone: ${contactForm.phone}

Message:
${contactForm.message}

Please contact me to discuss further.

Best regards,
${contactForm.name}`;

      const mailtoLink = `mailto:${design.contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
      
      toast.success('Your inquiry has been sent! Opening email client...');
      setShowContactForm(false);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error saving client contact:', error);
      toast.error('Failed to send inquiry. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Design Not Found</h2>
            <p className="text-gray-600 mb-8">The design you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/home')}
              className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors duration-300 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Design Image */}
          <div className="space-y-6">
            {design.imageURL && (
              <div className="relative">
                <img
                  src={design.imageURL}
                  alt={design.projectName}
                  className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-xl"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(design.status)}`}>
                    {design.status}
                  </span>
                </div>
              </div>
            )}
            
            {/* Additional Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Created</span>
                </div>
                <p className="text-gray-800 font-semibold">
                  {new Date(design.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Client</span>
                </div>
                <p className="text-gray-800 font-semibold">{design.clientName}</p>
              </div>
            </div>
          </div>

          {/* Design Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                {design.projectName}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {design.description}
              </p>
            </div>

            {/* Designer Contact Info */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                <span>Contact Designer</span>
                {!isAuthenticated && (
                  <span className="text-sm text-gray-500 font-normal">(Login Required)</span>
                )}
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">{design.contact}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Client: {design.clientName}</span>
                </div>
              </div>

              {!isAuthenticated ? (
                <div className="text-center py-6">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex justify-center mb-4">
                      <div className="bg-purple-100 rounded-full p-3">
                        <Lock className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      Login Required to Contact Designer
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Please login or register to contact the designer and access all features.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => navigate('/login')}
                        className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <Lock className="h-4 w-4" />
                        <span>Login</span>
                      </button>
                      <button
                        onClick={() => navigate('/register')}
                        className="border-2 border-purple-600 text-purple-600 py-2 px-4 rounded-lg font-semibold hover:bg-purple-50 transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <User className="h-4 w-4" />
                        <span>Register</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : !showContactForm ? (
                <button
                  onClick={handleContactClick}
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Contact Designer</span>
                </button>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactFormChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactFormChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleContactFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactFormChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Tell the designer about your project requirements..."
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Send Message
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick Contact Options */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Contact</h3>
              <div className="space-y-3">
                <a
                  href={`mailto:${design.contact}?subject=Inquiry about ${design.projectName}`}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                >
                  <Mail className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">Send Email</span>
                </a>
                
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Please login to copy contact information');
                      navigate('/login');
                      return;
                    }
                    navigator.clipboard.writeText(design.contact);
                    toast.success('Email copied to clipboard!');
                  }}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                >
                  <User className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Copy Email Address</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DesignDetail;
