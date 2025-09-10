import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Lock, LogIn, UserPlus } from 'lucide-react';

const ProtectedDesignRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex justify-center mb-6">
                <div className="bg-purple-100 rounded-full p-4">
                  <Lock className="h-12 w-12 text-purple-600" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Please Login to View Designs
              </h2>
              
              <p className="text-gray-600 mb-8">
                Our interior designs are exclusively available to registered users. 
                Please log in to your account or create a new one to access our design gallery.
              </p>
              
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Login to Your Account</span>
                </Link>
                
                <Link
                  to="/register"
                  className="w-full border-2 border-purple-600 text-purple-600 py-3 px-6 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Create New Account</span>
                </Link>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  to="/home"
                  className="text-gray-500 hover:text-purple-600 transition-colors duration-300 text-sm"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedDesignRoute;
