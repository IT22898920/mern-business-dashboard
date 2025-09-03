import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({
  label,
  error,
  type = 'text',
  placeholder,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  showPasswordToggle = false,
  required = false,
  disabled = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  const inputClasses = `
    form-input
    ${error ? 'form-input-error' : ''}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon || (type === 'password' && showPasswordToggle) ? 'pr-10' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`relative ${containerClassName}`}>
      {label && (
        <label className={`form-label ${className?.includes('text-white') ? 'text-white/90' : ''}`}>
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-secondary-400 sm:text-sm">{leftIcon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={inputClasses}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />
        
        {type === 'password' && showPasswordToggle && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              className="text-secondary-400 hover:text-secondary-500 focus:outline-none focus:text-secondary-500 transition-colors"
              onClick={togglePassword}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        )}
        
        {rightIcon && !showPasswordToggle && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-secondary-400 sm:text-sm">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {error && <p className="form-error">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;