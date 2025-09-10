import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Alert Context
const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

// Alert Provider Component
export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const newAlert = { id, message, type, duration };
    
    setAlerts(prev => [...prev, newAlert]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }
    
    return id;
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const showSuccess = (message, duration = 5000) => showAlert(message, 'success', duration);
  const showError = (message, duration = 5000) => showAlert(message, 'error', duration);
  const showWarning = (message, duration = 5000) => showAlert(message, 'warning', duration);
  const showInfo = (message, duration = 5000) => showAlert(message, 'info', duration);

  return (
    <AlertContext.Provider value={{ showAlert, showSuccess, showError, showWarning, showInfo, removeAlert }}>
      {children}
      <AlertContainer alerts={alerts} removeAlert={removeAlert} />
    </AlertContext.Provider>
  );
};

// Alert Container Component
const AlertContainer = ({ alerts, removeAlert }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 max-w-md">
      {alerts.map(alert => (
        <Alert key={alert.id} alert={alert} onClose={() => removeAlert(alert.id)} />
      ))}
    </div>
  );
};

// Individual Alert Component
const Alert = ({ alert, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (alert.duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (alert.duration / 100));
          if (newProgress <= 0) {
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [alert.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getAlertStyles = () => {
    switch (alert.type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          iconBg: 'bg-green-100',
          text: 'text-green-800',
          progress: 'bg-green-500'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          iconBg: 'bg-red-100',
          text: 'text-red-800',
          progress: 'bg-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
          iconBg: 'bg-yellow-100',
          text: 'text-yellow-800',
          progress: 'bg-yellow-500'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          iconBg: 'bg-blue-100',
          text: 'text-blue-800',
          progress: 'bg-blue-500'
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg shadow-lg border-2 transition-all duration-300
        ${styles.bg} ${styles.border}
        ${isExiting ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'}
        animate-slide-in
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={`flex-shrink-0 p-2 rounded-full ${styles.iconBg}`}>
            {styles.icon}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${styles.text}`}>
              {alert.message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`ml-4 inline-flex ${styles.text} hover:opacity-75 transition-opacity`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      {alert.duration > 0 && (
        <div className="h-1 bg-gray-200">
          <div
            className={`h-full ${styles.progress} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Confirmation Modal Component
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
  if (!isOpen) return null;

  const getModalStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
          iconBg: 'bg-red-100',
          confirmBtn: 'bg-red-600 hover:bg-red-700'
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          iconBg: 'bg-green-100',
          confirmBtn: 'bg-green-600 hover:bg-green-700'
        };
      case 'info':
        return {
          icon: <Info className="h-6 w-6 text-blue-600" />,
          iconBg: 'bg-blue-100',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'warning':
      default:
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
          iconBg: 'bg-yellow-100',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700'
        };
    }
  };

  const styles = getModalStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg animate-modal-in">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${styles.iconBg}`}>
                {styles.icon}
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onConfirm}
              className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${styles.confirmBtn}`}
            >
              {confirmText}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-modal-in {
          animation: modal-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AlertProvider;