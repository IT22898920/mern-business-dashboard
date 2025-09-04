import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, Shield, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isFormFocused, setIsFormFocused] = useState(false);
  
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/Home';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const result = await login({
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      rememberMe: formData.rememberMe,
    });

    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>

        {/* Floating Icons */}
        <div className="absolute top-20 left-20 text-gray-300/20 animate-float">
          <Shield className="w-8 h-8" />
        </div>
        <div className="absolute top-32 right-32 text-blue-300/20 animate-float animation-delay-1000">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="absolute bottom-32 left-32 text-purple-300/20 animate-float animation-delay-2000">
          <Zap className="w-7 h-7" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header with 3D Effect */}
          <div className="text-center">
            <div className={`mx-auto relative transition-all duration-700 ${isFormFocused ? 'transform scale-110 rotate-3' : ''}`}>
              {/* 3D Icon Container */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl transform rotate-6 scale-105 opacity-20 blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl transform -rotate-6 scale-105 opacity-20 blur-sm"></div>
                <div className="relative h-16 w-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-2xl transform transition-transform duration-300 hover:scale-110 hover:rotate-12">
                  <LogIn className="h-8 w-8 text-white" />
                  <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <h2 className="mt-8 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 animate-fade-in">
              Welcome Back
            </h2>
            <p className="mt-3 text-lg text-gray-600 animate-slide-in">
              Sign in to your account and continue your journey
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Or{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-800 transition-all duration-300 hover:underline underline-offset-4"
              >
                create a new account
              </Link>
            </p>
          </div>


          {/* Form with Glass Morphism */}
          <div 
            className={`backdrop-blur-xl bg-white/70 p-8 rounded-2xl shadow-2xl border border-white/40 transition-all duration-500 ${isFormFocused ? 'bg-white/80 scale-105 shadow-3xl' : ''}`}
            onFocus={() => setIsFormFocused(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setIsFormFocused(false);
              }
            }}
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Email with 3D hover effect */}
                <div className="group">
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    placeholder="Enter your email address"
                    leftIcon={<Mail className="h-5 w-5 group-hover:text-blue-400 transition-colors" />}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                    className="bg-white/50 border-gray-200/50 text-gray-800 placeholder-gray-500 focus:bg-white/70 focus:border-blue-400 transition-all duration-300 hover:bg-white/60"
                    containerClassName="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  />
                </div>

                {/* Password with 3D hover effect */}
                <div className="group">
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={errors.password}
                    placeholder="Enter your password"
                    leftIcon={<Lock className="h-5 w-5 group-hover:text-purple-400 transition-colors" />}
                    showPasswordToggle
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="bg-white/50 border-gray-200/50 text-gray-800 placeholder-gray-500 focus:bg-white/70 focus:border-purple-400 transition-all duration-300 hover:bg-white/60"
                    containerClassName="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center group">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded bg-white/70 transition-all duration-300 hover:scale-110"
                  />
                  <label htmlFor="rememberMe" className="ml-3 block text-sm text-gray-700 group-hover:text-gray-900 transition-colors cursor-pointer">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-800 transition-all duration-300 hover:underline underline-offset-4 transform hover:scale-105 inline-block"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* 3D Animated Submit Button */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl transform scale-105 opacity-20 blur-sm animate-pulse"></div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full relative z-10 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 hover:from-blue-600 hover:via-purple-700 hover:to-pink-600 border-0 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-3xl text-white font-semibold"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign in
                    </div>
                  )}
                </Button>
              </div>

              {/* Animated Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-r from-transparent via-gray-50 to-transparent text-gray-600">
                    New to our platform?
                  </span>
                </div>
              </div>

              {/* 3D Register Link */}
              <div className="text-center">
                <Link
                  to="/register"
                  className="group relative w-full inline-flex justify-center py-3 px-6 border border-gray-200 rounded-xl shadow-lg bg-white/80 text-sm font-medium text-gray-700 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 group-hover:animate-spin text-blue-500" />
                    Create new account
                  </span>
                </Link>
              </div>
            </form>
          </div>

          {/* Footer with floating animation */}
          <div className="text-center animate-fade-in animation-delay-1000">
            <p className="text-gray-500 text-xs">
              Secured with enterprise-grade encryption
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations in Style Tag */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-slide-in {
          animation: slide-in 0.6s ease-out forwards;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Login;