import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { forgotPassword, isLoading } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
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

    const result = await forgotPassword(email.toLowerCase().trim());

    if (result.success) {
      setIsSubmitted(true);
    }
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);

    // Clear error for email field
    if (errors.email) {
      setErrors(prev => ({
        ...prev,
        email: ''
      }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-secondary-900">
              Check your email
            </h2>
            <p className="mt-4 text-sm text-secondary-600">
              We've sent password reset instructions to{' '}
              <span className="font-medium text-secondary-900">{email}</span>
            </p>
            <p className="mt-2 text-sm text-secondary-600">
              The link will expire in 1 hour for security reasons.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => setIsSubmitted(false)}
            >
              Try different email
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-secondary-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="Enter your email address"
              leftIcon={<Mail className="h-5 w-5" />}
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            Send reset instructions
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;