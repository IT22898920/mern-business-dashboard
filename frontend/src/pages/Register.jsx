import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Sparkles, Shield, Zap, Eye, EyeOff, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isFormFocused, setIsFormFocused] = useState(false);
  
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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

    const result = await register({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.toLowerCase().trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      password: formData.password,
      role: formData.role,
    });

    if (result.success) {
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please verify your email and sign in.' 
        } 
      });
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

  const roleOptions = [
    { value: 'user', label: 'Customer' },
    { value: 'supplier', label: 'Supplier' },
    { value: 'interior_designer', label: 'Interior Designer' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
        <div className="absolute top-1/2 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-3000"></div>
        
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
        <div className="absolute top-32 right-32 text-green-300/20 animate-float animation-delay-1000">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="absolute bottom-32 left-32 text-blue-300/20 animate-float animation-delay-2000">
          <Zap className="w-7 h-7" />
        </div>
        <div className="absolute top-1/3 left-1/2 text-purple-300/20 animate-float animation-delay-3000">
          <UserPlus className="w-6 h-6" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          {/* Header with 3D Effect */}
          <div className="text-center">
            <div className={`mx-auto relative transition-all duration-700 ${isFormFocused ? 'transform scale-110 rotate-3' : ''}`}>
              {/* 3D Icon Container */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl transform rotate-6 scale-105 opacity-20 blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl transform -rotate-6 scale-105 opacity-20 blur-sm"></div>
                <div className="relative h-16 w-16 bg-gradient-to-br from-green-500 via-blue-600 to-purple-500 rounded-xl flex items-center justify-center shadow-2xl transform transition-transform duration-300 hover:scale-110 hover:rotate-12">
                  <UserPlus className="h-8 w-8 text-white" />
                  <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <h2 className="mt-8 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-green-600 to-blue-600 animate-fade-in">
              Join Our Platform
            </h2>
            <p className="mt-3 text-lg text-gray-600 animate-slide-in">
              Create your account and start your journey with us
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-800 transition-all duration-300 hover:underline underline-offset-4"
              >
                Sign in here
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="group">
                  <Input
                    label="First Name"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={errors.firstName}
                    placeholder="Enter your first name"
                    leftIcon={<User className="h-5 w-5 group-hover:text-green-400 transition-colors" />}
                    required
                    disabled={isLoading}
                    autoComplete="given-name"
                    className="bg-white/50 border-gray-200/50 text-gray-800 placeholder-gray-500 focus:bg-white/70 focus:border-green-400 transition-all duration-300 hover:bg-white/60"
                    containerClassName="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  />
                </div>

                {/* Last Name */}
                <div className="group">
                  <Input
                    label="Last Name"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={errors.lastName}
                    placeholder="Enter your last name"
                    leftIcon={<User className="h-5 w-5 group-hover:text-blue-400 transition-colors" />}
                    required
                    disabled={isLoading}
                    autoComplete="family-name"
                    className="bg-white/50 border-gray-200/50 text-gray-800 placeholder-gray-500 focus:bg-white/70 focus:border-blue-400 transition-all duration-300 hover:bg-white/60"
                    containerClassName="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="group">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  placeholder="Enter your email address"
                  leftIcon={<Mail className="h-5 w-5 group-hover:text-purple-400 transition-colors" />}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                  className="bg-white/50 border-gray-200/50 text-gray-800 placeholder-gray-500 focus:bg-white/70 focus:border-purple-400 transition-all duration-300 hover:bg-white/60"
                  containerClassName="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="group">
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                    placeholder="Enter your phone number"
                    leftIcon={<Phone className="h-5 w-5 group-hover:text-green-400 transition-colors" />}
                    required
                    disabled={isLoading}
                    autoComplete="tel"
                    className="bg-white/50 border-gray-200/50 text-gray-800 placeholder-gray-500 focus:bg-white/70 focus:border-green-400 transition-all duration-300 hover:bg-white/60"
                    containerClassName="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  />
                </div>

                {/* Role Selection */}
                <div className="group">
                  <label className="form-label text-gray-700 mb-1">
                    Account Type
                    <span className="text-red-400 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="form-input bg-white/50 border-gray-200/50 text-gray-800 focus:bg-white/70 focus:border-blue-400 transition-all duration-300 hover:bg-white/60 pl-10"
                    >
                      {roleOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-secondary-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="group">
                <Input
                  label="Address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  error={errors.address}
                  placeholder="Enter your full address"
                  leftIcon={<MapPin className="h-5 w-5 group-hover:text-blue-400 transition-colors" />}
                  required
                  disabled={isLoading}
                  autoComplete="address-line1"
                  className="bg-white/50 border-gray-200/50 text-gray-800 placeholder-gray-500 focus:bg-white/70 focus:border-blue-400 transition-all duration-300 hover:bg-white/60"
                  containerClassName="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div className="group">
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={errors.password}
                    placeholder="Create a strong password"
                    leftIcon={<Lock className="h-5 w-5 group-hover:text-purple-400 transition-colors" />}
                    showPasswordToggle
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                    className="bg-white/50 border-gray-200/50 text-gray-800 placeholder-gray-500 focus:bg-white/70 focus:border-purple-400 transition-all duration-300 hover:bg-white/60"
                    containerClassName="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  />
                </div>

                {/* Confirm Password */}
                <div className="group">
                  <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={errors.confirmPassword}
                    placeholder="Confirm your password"
                    leftIcon={<Lock className="h-5 w-5 group-hover:text-red-400 transition-colors" />}
                    showPasswordToggle
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                    className="bg-white/50 border-gray-200/50 text-gray-800 placeholder-gray-500 focus:bg-white/70 focus:border-red-400 transition-all duration-300 hover:bg-white/60"
                    containerClassName="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded bg-white/70 transition-all duration-300 hover:scale-110"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="text-gray-700 cursor-pointer">
                    I agree to the{' '}
                    <Link
                      to="/terms"
                      className="font-medium text-blue-600 hover:text-blue-800 transition-all duration-300 hover:underline underline-offset-4"
                    >
                      Terms and Conditions
                    </Link>
                    {' '}and{' '}
                    <Link
                      to="/privacy"
                      className="font-medium text-blue-600 hover:text-blue-800 transition-all duration-300 hover:underline underline-offset-4"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                  {errors.agreeToTerms && <p className="form-error">{errors.agreeToTerms}</p>}
                </div>
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-gray-500 bg-gray-50/80 rounded-lg p-3 backdrop-blur-sm">
                <p className="font-medium mb-1">Password must contain:</p>
                <ul className="space-y-1">
                  <li className="flex items-center">
                    <span className={`mr-2 ${formData.password.length >= 8 ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    At least 8 characters
                  </li>
                  <li className="flex items-center">
                    <span className={`mr-2 ${/(?=.*[a-z])/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    One lowercase letter
                  </li>
                  <li className="flex items-center">
                    <span className={`mr-2 ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    One uppercase letter
                  </li>
                  <li className="flex items-center">
                    <span className={`mr-2 ${/(?=.*\d)/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    One number
                  </li>
                </ul>
              </div>

              {/* 3D Animated Submit Button */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl transform scale-105 opacity-20 blur-sm animate-pulse"></div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full relative z-10 bg-gradient-to-r from-green-500 via-blue-600 to-purple-500 hover:from-green-600 hover:via-blue-700 hover:to-purple-600 border-0 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-3xl text-white font-semibold"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Creating account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <UserPlus className="w-5 h-5 mr-2" />
                      Create Account
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
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* 3D Login Link */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="group relative w-full inline-flex justify-center py-3 px-6 border border-gray-200 rounded-xl shadow-lg bg-white/80 text-sm font-medium text-gray-700 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 group-hover:animate-spin text-blue-500" />
                    Sign in to existing account
                  </span>
                </Link>
              </div>
            </form>
          </div>

          {/* Footer with floating animation */}
          <div className="text-center animate-fade-in animation-delay-1000">
            <p className="text-gray-500 text-xs">
              Join thousands of users who trust our platform
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations in Style Tag */}
      <style jsx>{`
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
        
        .animation-delay-3000 {
          animation-delay: 3s;
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

export default Register;