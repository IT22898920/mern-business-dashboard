import React, { useState, useRef } from 'react';
import { Upload, X, User, Camera } from 'lucide-react';
import { convertToBase64, compressImage } from '../../services/api';
import Button from './Button';

const ImageUpload = ({
  value,
  onChange,
  error,
  disabled = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  className = '',
  preview = true,
  circular = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      onChange?.(null, 'Invalid file format. Please select a valid image file.');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      onChange?.(null, `File size too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    try {
      setLoading(true);
      
      // Compress image if needed
      let processedFile = file;
      if (file.size > 1024 * 1024) { // If larger than 1MB, compress
        processedFile = await compressImage(file);
      }

      // Convert to base64
      const base64 = await convertToBase64(processedFile);
      onChange?.(base64, null);
    } catch (error) {
      console.error('Error processing image:', error);
      onChange?.(null, 'Error processing image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || loading) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange?.(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (!disabled && !loading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const containerClasses = `
    relative border-2 border-dashed rounded-lg transition-all duration-200
    ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-secondary-300 hover:border-secondary-400'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${error ? 'border-red-300 bg-red-50' : ''}
    ${circular ? 'rounded-full aspect-square' : ''}
    ${className}
  `;

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInputChange}
        disabled={disabled || loading}
        className="hidden"
      />

      <div
        className={containerClasses}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {value && preview ? (
          <div className="relative group">
            <img
              src={value}
              alt="Upload preview"
              className={`w-full h-full object-cover ${circular ? 'rounded-full' : 'rounded-lg'}`}
            />
            
            {!disabled && !loading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openFileDialog();
                    }}
                    className="text-white hover:bg-white hover:bg-opacity-20"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="text-white hover:bg-white hover:bg-opacity-20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
                <span className="text-sm text-secondary-600">Processing...</span>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  {circular ? (
                    <User className="w-12 h-12 text-secondary-400" />
                  ) : (
                    <Upload className="w-12 h-12 text-secondary-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-secondary-600">
                    {circular ? 'Upload profile picture' : 'Upload an image'}
                  </p>
                  <p className="text-xs text-secondary-500">
                    Drag and drop or click to browse
                  </p>
                  <p className="text-xs text-secondary-400">
                    Max size: {(maxSize / (1024 * 1024)).toFixed(1)}MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  );
};

export default ImageUpload;