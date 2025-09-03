import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuth();

  // Redirect if no token provided
  useEffect(() => {
    if (!token) {
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const validateForm = () => {
    const newErrors = {};

    // Password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

    const result = await resetPassword({
      token,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    });

    if (result.success) {
      setIsSubmitted(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-secondary-900">
              Password reset successful!
            </h2>
            <p className="mt-4 text-sm text-secondary-600">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <p className="mt-2 text-sm text-secondary-500">
              Redirecting to sign in page in 3 seconds...
            </p>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Sign in now
            </Link>
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
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-secondary-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Enter your new password below to complete the reset process.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* New Password */}
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleInputChange}
              error={errors.newPassword}
              placeholder="Enter your new password"
              leftIcon={<Lock className="h-5 w-5" />}
              showPasswordToggle
              required
              disabled={isLoading}
              autoComplete="new-password"
            />

            {/* Confirm Password */}
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              placeholder="Confirm your new password"
              leftIcon={<Lock className="h-5 w-5" />}
              showPasswordToggle
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium mb-2">Password requirements:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• At least 6 characters long</li>
              <li>• Contains at least one lowercase letter</li>
              <li>• Contains at least one uppercase letter</li>
              <li>• Contains at least one number</li>
            </ul>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            Reset password
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

export default ResetPassword;