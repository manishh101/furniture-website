import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

const SingleImageUploader = ({ onImageSelected, existingImage = null, onRemoveImage, imageType = 'general' }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  // Define recommended dimensions based on image type
  const getRecommendedDimensions = () => {
    switch (imageType) {
      case 'story':
        return '1000x600 pixels';
      case 'banner':
        return '1920x600 pixels';
      case 'thumbnail':
        return '400x400 pixels';
      default:
        return '1000x700 pixels';
    }
  };

  const onDrop = useCallback(acceptedFiles => {
    // Only use the first file if multiple are dropped
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Check file size (max 5MB for reasonable loading performance)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Image exceeds the 5MB size limit. Please compress your image.');
        setTimeout(() => setError(''), 5000);
        return;
      }

      // Create preview URL for the file
      const fileWithPreview = Object.assign(selectedFile, {
        preview: URL.createObjectURL(selectedFile)
      });
      
      // Set the file and clear any previous errors
      setFile(fileWithPreview);
      setError('');
      
      // Notify parent component
      onImageSelected([fileWithPreview]);
    }
  }, [onImageSelected]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1, // Only allow one file
  });
  
  const removeFile = () => {
    // Release object URL to prevent memory leaks
    if (file && file.preview) {
      URL.revokeObjectURL(file.preview);
    }
    
    setFile(null);
    onImageSelected([]);
  };
  
  return (
    <div className="mt-2">
      {/* Dropzone area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}
        `}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-primary">Drop the image here...</p>
        ) : (
          <div className="flex flex-col items-center">
            <PhotoIcon className="h-10 w-10 text-gray-400 mb-2" />
            <p className="mb-1">Drag & drop image here, or click to select a file</p>
            <p className="text-sm text-gray-500">Supports: JPG, PNG, GIF, WEBP (Max 5MB)</p>
            <p className="text-xs text-gray-400 mt-1">Recommended dimensions: {getRecommendedDimensions()}</p>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {/* Preview existing image */}
      {existingImage && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Current Image</label>
          <div className="relative group inline-block">
            <img
              src={existingImage}
              alt="Current image"
              className="max-h-48 rounded-md border border-gray-200"
            />
            <button
              type="button"
              onClick={() => onRemoveImage()}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove image"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Preview selected file */}
      {file && file.preview && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Selected Image</label>
          <div className="relative group inline-block">
            <img
              src={file.preview}
              alt="Preview"
              className="max-h-48 rounded-md border border-gray-200"
              onLoad={() => {
                // Free memory when image is loaded
                URL.revokeObjectURL(file.preview);
              }}
            />
            <button
              type="button"
              onClick={removeFile}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove image"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleImageUploader;
