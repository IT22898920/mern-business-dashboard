import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, handleAPIError } from '../services/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTION_TYPES = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_ERROR: 'AUTH_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTION_TYPES.AUTH_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTION_TYPES.AUTH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTION_TYPES.AUTH_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        user: null,
        isAuthenticated: false,
      };

    case AUTH_ACTION_TYPES.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        user: action.payload.user,
        isAuthenticated: true,
      };

    case AUTH_ACTION_TYPES.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTION_TYPES.UPDATE_PROFILE:
      return {
        ...state,
        user: action.payload.user,
        error: null,
      };

    case AUTH_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth();
  }, []);

  // Check authentication status
  const checkAuth = async () => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.AUTH_START });

      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        dispatch({ type: AUTH_ACTION_TYPES.AUTH_SUCCESS });
        return;
      }

      // Verify token with backend
      const response = await authAPI.getProfile();
      const user = response.data.data.user;

      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTION_TYPES.LOGIN_SUCCESS,
        payload: { user },
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      
      // Clear invalid tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      dispatch({
        type: AUTH_ACTION_TYPES.AUTH_ERROR,
        payload: handleAPIError(error),
      });
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.AUTH_START });

      const response = await authAPI.register(userData);
      const { user, token } = response.data.data;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTION_TYPES.LOGIN_SUCCESS,
        payload: { user },
      });

      toast.success('Registration successful! Please verify your email.');
      return { success: true, user };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      
      dispatch({
        type: AUTH_ACTION_TYPES.AUTH_ERROR,
        payload: errorMessage,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.AUTH_START });

      const response = await authAPI.login(credentials);
      const { user, token } = response.data.data;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTION_TYPES.LOGIN_SUCCESS,
        payload: { user },
      });

      toast.success(`Welcome back, ${user.name}!`);
      return { success: true, user };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      
      dispatch({
        type: AUTH_ACTION_TYPES.AUTH_ERROR,
        payload: errorMessage,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear storage and state regardless of API call result
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      dispatch({ type: AUTH_ACTION_TYPES.LOGOUT });
      toast.success('Logged out successfully');
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.AUTH_START });

      const response = await authAPI.updateProfile(profileData);
      const user = response.data.data.user;

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTION_TYPES.UPDATE_PROFILE,
        payload: { user },
      });

      toast.success('Profile updated successfully');
      return { success: true, user };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      
      dispatch({
        type: AUTH_ACTION_TYPES.AUTH_ERROR,
        payload: errorMessage,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.AUTH_START });

      await authAPI.changePassword(passwordData);

      dispatch({ type: AUTH_ACTION_TYPES.AUTH_SUCCESS });
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      
      dispatch({
        type: AUTH_ACTION_TYPES.AUTH_ERROR,
        payload: errorMessage,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.AUTH_START });

      await authAPI.forgotPassword(email);

      dispatch({ type: AUTH_ACTION_TYPES.AUTH_SUCCESS });
      toast.success('Password reset instructions sent to your email');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      
      dispatch({
        type: AUTH_ACTION_TYPES.AUTH_ERROR,
        payload: errorMessage,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Reset password
  const resetPassword = async (resetData) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.AUTH_START });

      await authAPI.resetPassword(resetData);

      dispatch({ type: AUTH_ACTION_TYPES.AUTH_SUCCESS });
      toast.success('Password reset successfully. You can now login.');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      
      dispatch({
        type: AUTH_ACTION_TYPES.AUTH_ERROR,
        payload: errorMessage,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.AUTH_START });

      await authAPI.verifyEmail(token);

      // Refresh user data
      await checkAuth();

      toast.success('Email verified successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      
      dispatch({
        type: AUTH_ACTION_TYPES.AUTH_ERROR,
        payload: errorMessage,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Resend email verification
  const resendVerification = async () => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.AUTH_START });

      await authAPI.resendVerification();

      dispatch({ type: AUTH_ACTION_TYPES.AUTH_SUCCESS });
      toast.success('Verification email sent successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      
      dispatch({
        type: AUTH_ACTION_TYPES.AUTH_ERROR,
        payload: errorMessage,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTION_TYPES.CLEAR_ERROR });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  // Check if user is admin
  const isAdmin = () => {
    return state.user?.role === 'admin';
  };

  // Check if user is staff (admin or employee)
  const isStaff = () => {
    return ['admin', 'employee'].includes(state.user?.role);
  };

  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    clearError,
    checkAuth,
    
    // Utilities
    hasRole,
    hasAnyRole,
    isAdmin,
    isStaff,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;