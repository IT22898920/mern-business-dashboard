import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../services/api';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setVerificationStatus('error');
        setMessage('Invalid verification link. Token not found.');
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        
        if (response.data.status === 'success') {
          setVerificationStatus('success');
          setMessage('Email verified successfully! You can now log in to your account.');
          toast.success('Email verified successfully!');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setVerificationStatus('error');
          setMessage(response.data.message || 'Email verification failed.');
          toast.error('Email verification failed');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setVerificationStatus('error');
        
        if (error.response?.data?.message) {
          setMessage(error.response.data.message);
        } else {
          setMessage('Email verification failed. The link may be expired or invalid.');
        }
        
        toast.error('Email verification failed');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const getIcon = () => {
    switch (verificationStatus) {
      case 'verifying':
        return <Loader className="w-16 h-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Loader className="w-16 h-16 text-blue-500 animate-spin" />;
    }
  };

  const getTitle = () => {
    switch (verificationStatus) {
      case 'verifying':
        return 'Verifying Email...';
      case 'success':
        return 'Email Verified!';
      case 'error':
        return 'Verification Failed';
      default:
        return 'Verifying Email...';
    }
  };

  const getSubtitle = () => {
    switch (verificationStatus) {
      case 'verifying':
        return 'Please wait while we verify your email address.';
      case 'success':
        return 'Your email has been successfully verified. Redirecting to login...';
      case 'error':
        return 'We encountered an issue verifying your email.';
      default:
        return 'Please wait while we verify your email address.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            {getIcon()}
          </div>
          
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            {getTitle()}
          </h1>
          
          <p className="text-secondary-600 mb-4">
            {getSubtitle()}
          </p>
          
          {message && (
            <div className={`p-4 rounded-md mb-4 ${
              verificationStatus === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
          
          <div className="space-y-3">
            {verificationStatus === 'success' && (
              <button
                onClick={() => navigate('/login')}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to Login
              </button>
            )}
            
            {verificationStatus === 'error' && (
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Back to Register
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Go to Login
                </button>
              </div>
            )}
            
            <button
              onClick={() => navigate('/home')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;