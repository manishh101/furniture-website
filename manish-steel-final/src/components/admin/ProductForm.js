import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI, uploadAPI } from '../../services/api';
import ImageUploader from './ImageUploader';

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    subcategoryId: '',
    price: '',
    description: '',
    images: [],
    features: [],
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    material: '',
    colors: [],
    isAvailable: true
  });
  
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryAPI.getAll();
        const allCategories = response.data;
        
        // Split into parent categories and subcategories
        const parentCats = allCategories.filter(cat => !cat.parentId);
        const subcats = allCategories.filter(cat => cat.parentId);
        
        setCategories(parentCats);
        setSubcategories(subcats);
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error loading categories:', err);
      }
    };
    
    loadCategories();
  }, []);
  
  // Update subcategory options when category changes
  useEffect(() => {
    if (formData.categoryId) {
      const filtered = subcategories.filter(
        sub => sub.parentId === formData.categoryId
      );
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.categoryId, subcategories]);
  
  // Initialize form with product data when editing
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        features: product.features || [],
        colors: product.colors || [],
        dimensions: product.dimensions || { length: '', width: '', height: '' }
      });
    }
  }, [product]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties like dimensions.length
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    // Clear subcategory when category changes
    setFormData({
      ...formData,
      categoryId,
      subcategoryId: ''
    });
  };
  
  const handleArrayInputChange = (e) => {
    const { name, value } = e.target;
    const arrayValues = value.split(',').map(item => item.trim()).filter(Boolean);
    
    setFormData({
      ...formData,
      [name]: arrayValues
    });
  };
  
  const handleRemoveExistingImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({...formData, images: updatedImages});
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      // Validate required fields
      if (!formData.name || !formData.price || !formData.description || !formData.categoryId) {
        setError('Please fill all required fields');
        setIsLoading(false);
        return;
      }
      
      // Upload images if there are new ones
      let productImages = [...formData.images];
      
      if (uploadFiles.length > 0) {
        const formDataUpload = new FormData();
        uploadFiles.forEach(file => {
          formDataUpload.append('images', file);
        });
        
        const uploadResponse = await uploadAPI.uploadImages(formDataUpload);
        productImages = [...productImages, ...uploadResponse.data.urls];
      }
      
      if (productImages.length === 0 && !product) {
        setError('Please add at least one image');
        setIsLoading(false);
        return;
      }
      
      // Prepare product data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        images: productImages
      };
      
      // Save product (create or update)
      if (product && product._id) {
        await productAPI.update(product._id, productData);
        setSuccess('Product updated successfully');
      } else {
        await productAPI.create(productData);
        setSuccess('Product created successfully');
      }
      
      // Notify parent component
      onSave();
      
    } catch (err) {
      setError('Error saving product: ' + (err.response?.data?.msg || err.message));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        
        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-1">
            Price (₹) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            min="0"
            step="0.01"
            required
          />
        </div>
        
        {/* Category */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium mb-1">
            Category *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleCategoryChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Subcategory */}
        <div>
          <label htmlFor="subcategoryId" className="block text-sm font-medium mb-1">
            Subcategory
          </label>
          <select
            id="subcategoryId"
            name="subcategoryId"
            value={formData.subcategoryId || ''}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            disabled={!formData.categoryId || filteredSubcategories.length === 0}
          >
            <option value="">Select Subcategory</option>
            {filteredSubcategories.map((subcategory) => (
              <option key={subcategory._id} value={subcategory._id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Material */}
        <div>
          <label htmlFor="material" className="block text-sm font-medium mb-1">
            Material
          </label>
          <input
            type="text"
            id="material"
            name="material"
            value={formData.material}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        
        {/* Availability */}
        <div>
          <label htmlFor="isAvailable" className="block text-sm font-medium mb-1">
            Status
          </label>
          <select
            id="isAvailable"
            name="isAvailable"
            value={formData.isAvailable}
            onChange={e => setFormData({...formData, isAvailable: e.target.value === 'true'})}
            className="w-full border rounded px-3 py-2"
          >
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>
        
        {/* Dimensions */}
        <div className="md:col-span-2 grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="dimensions.length" className="block text-sm font-medium mb-1">
              Length (cm)
            </label>
            <input
              type="number"
              id="dimensions.length"
              name="dimensions.length"
              value={formData.dimensions.length}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="dimensions.width" className="block text-sm font-medium mb-1">
              Width (cm)
            </label>
            <input
              type="number"
              id="dimensions.width"
              name="dimensions.width"
              value={formData.dimensions.width}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="dimensions.height" className="block text-sm font-medium mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              id="dimensions.height"
              name="dimensions.height"
              value={formData.dimensions.height}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              min="0"
            />
          </div>
        </div>
        
        {/* Description - Full width */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            rows="4"
            required
          ></textarea>
        </div>
        
        {/* Colors - comma separated */}
        <div className="md:col-span-2">
          <label htmlFor="colors" className="block text-sm font-medium mb-1">
            Colors (comma-separated)
          </label>
          <input
            type="text"
            id="colors"
            name="colors"
            value={formData.colors.join(', ')}
            onChange={handleArrayInputChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Red, Blue, Black"
          />
        </div>
        
        {/* Features - comma separated */}
        <div className="md:col-span-2">
          <label htmlFor="features" className="block text-sm font-medium mb-1">
            Features (comma-separated)
          </label>
          <textarea
            id="features"
            name="features"
            value={formData.features.join(', ')}
            onChange={handleArrayInputChange}
            className="w-full border rounded px-3 py-2"
            rows="3"
            placeholder="Durable, Waterproof, Easy to clean"
          ></textarea>
        </div>
        
        {/* Image Uploader - Full width */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Product Images {formData.images.length === 0 ? '*' : ''}
          </label>
          <ImageUploader
            onImagesSelected={setUploadFiles}
            existingImages={formData.images}
            onRemoveExisting={handleRemoveExistingImage}
          />
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          className="px-4 py-2 border rounded"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded disabled:bg-gray-400"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
