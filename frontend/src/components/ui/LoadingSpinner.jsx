import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '', text = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-primary-600 border-t-transparent ${sizes[size]}`} />
      {text && <p className="mt-2 text-sm text-secondary-600">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;