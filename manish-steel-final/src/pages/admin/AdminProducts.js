import React, { useState, useEffect, useCallback } from 'react';
import { productAPI, categoryAPI, subcategoryAPI, uploadAPI } from '../../services/api';
import { 
  PencilSquareIcon, 
  TrashIcon, 
  PlusCircleIcon, 
  XMarkIcon, 
  CheckCircleIcon,
  PhotoIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '../../components/common/OptimizedImage';
import ImageService from '../../services/imageService';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null for add, product object for edit
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    categoryId: '',
    subcategoryId: '',
    price: '',
    description: '',
    image: '', // Main image URL (will be set after upload)
    images: [], // Additional image URLs (will be set after upload)
    features: [], // Features (comma-separated string for input)
    imageFile: null, // For file upload (main image)
    additionalImageFiles: [null, null, null], // For additional image uploads (up to 3 more)
    imagePreviews: {
      main: '', // Preview URL for main image
      additional: ['', '', ''] // Preview URLs for additional images
    }
  });
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [error, setError] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Get all products with high limit to ensure we see all 39 products in admin
      const response = await productAPI.getAll(1, 1000);
      
      // Check if response.data is an array (direct) or nested in a products property
      const products = Array.isArray(response.data) ? response.data : 
                      response.data?.products ? response.data.products : [];
                      
      console.log('Loaded products for admin:', products.length, 'products');
      console.log('API response structure:', {
        isArray: Array.isArray(response.data),
        hasProducts: !!response.data?.products,
        totalProducts: response.data?.totalProducts,
        actualLoaded: products.length
      });
      
      setProducts(products);
      setLoading(false);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products.');
      setProducts([]);
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching categories from API...');
      
      // Fetch main categories
      const categoriesResponse = await categoryAPI.getAll();
      const loadedCategories = categoriesResponse.data;
      
      if (!Array.isArray(loadedCategories)) {
        console.error('Invalid category data received:', loadedCategories);
        return;
      }
      
      console.log('Loaded main categories:', loadedCategories);
      setCategories(loadedCategories);
      
      // Fetch all subcategories in a single request
      const subcategoriesResponse = await subcategoryAPI.getAll();
      const loadedSubcategories = subcategoriesResponse.data;
      
      if (!Array.isArray(loadedSubcategories)) {
        console.error('Invalid subcategory data received:', loadedSubcategories);
        return;
      }
      
      // Process subcategories for direct ObjectId usage
      const processedSubcategories = loadedSubcategories.map(sub => ({
        ...sub
      }));
      
      console.log('Loaded subcategories:', processedSubcategories);
      setSubcategories(processedSubcategories);
      setLoading(false);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories: ' + (err.message || 'Unknown error'));
      
      // Fallback to local data if API fails
      console.log('Using fallback category data due to API error');
      
      // Define main categories with ObjectIds
      const mainCategories = [
        { _id: "674a1c854ddc5e6b9da63c90", name: "Household Furniture" },
        { _id: "674a1c854ddc5e6b9da63c91", name: "Office Furniture" },
        { _id: "674a1c854ddc5e6b9da63c92", name: "Commercial Furniture" }
      ];
      
      // Define subcategories with proper ObjectId references
      const subcats = [
        { _id: "674a1c854ddc5e6b9da63c93", name: "Almirahs & Wardrobes", categoryId: "674a1c854ddc5e6b9da63c90" },
        { _id: "674a1c854ddc5e6b9da63c94", name: "Beds", categoryId: "674a1c854ddc5e6b9da63c90" },
        { _id: "674a1c854ddc5e6b9da63c95", name: "Chairs", categoryId: "674a1c854ddc5e6b9da63c90" },
        { _id: "674a1c854ddc5e6b9da63c96", name: "Tables", categoryId: "674a1c854ddc5e6b9da63c90" },
        { _id: "674a1c854ddc5e6b9da63c97", name: "Storage Racks", categoryId: "674a1c854ddc5e6b9da63c90" },
        { _id: "674a1c854ddc5e6b9da63c98", name: "Office Desks", categoryId: "674a1c854ddc5e6b9da63c91" },
        { _id: "674a1c854ddc5e6b9da63c99", name: "Office Chairs", categoryId: "674a1c854ddc5e6b9da63c91" },
        { _id: "674a1c854ddc5e6b9da63c9a", name: "Filing Cabinets", categoryId: "674a1c854ddc5e6b9da63c91" },
        { _id: "674a1c854ddc5e6b9da63c9b", name: "Office Storage", categoryId: "674a1c854ddc5e6b9da63c91" },
        { _id: "674a1c854ddc5e6b9da63c9c", name: "Lockers", categoryId: "674a1c854ddc5e6b9da63c92" },
        { _id: "674a1c854ddc5e6b9da63c9d", name: "Commercial Shelving", categoryId: "674a1c854ddc5e6b9da63c92" },
        { _id: "674a1c854ddc5e6b9da63c9e", name: "Counters", categoryId: "674a1c854ddc5e6b9da63c92" },
        { _id: "674a1c854ddc5e6b9da63c9f", name: "Display Units", categoryId: "674a1c854ddc5e6b9da63c92" }
      ];
      
      console.log('Fallback main categories:', mainCategories);
      console.log('Fallback subcategories:', subcats);
      
      setCategories(mainCategories);
      setSubcategories(subcats);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  // Filter subcategories based on selected category (ObjectId-based)
  useEffect(() => {
    console.log('Current category ID:', formData.categoryId);
    console.log('All subcategories:', subcategories);
    
    if (formData.categoryId) {
      try {
        // Pure ObjectId-based filtering - no string conversion needed
        const filtered = subcategories.filter(sub => {
          if (!sub) {
            console.warn('Found null or undefined subcategory in list, skipping');
            return false;
          }
          
          // Direct ObjectId comparison for categoryId (primary method)
          const match = sub.categoryId === formData.categoryId;
          
          console.log(`Subcategory ${sub.name || 'unnamed'}:`, {
            subcategoryId: sub._id,
            categoryId: sub.categoryId,
            selectedCategoryId: formData.categoryId,
            isMatch: match
          });
          
          return match;
        });
        
        setFilteredSubcategories(filtered);
        console.log('Filtered subcategories for category', formData.categoryId, ':', filtered);
        
        // If current subcategory is not in the filtered list, reset it
        if (formData.subcategoryId && !filtered.some(sub => sub._id === formData.subcategoryId)) {
          setFormData(prev => ({ ...prev, subcategoryId: '' }));
          console.log('Reset subcategoryId because it was not found in filtered subcategories');
        }
      } catch (err) {
        console.error('Error filtering subcategories:', err);
        setFilteredSubcategories([]);
      }
    } else {
      setFilteredSubcategories([]);
      setFormData(prev => ({ ...prev, subcategoryId: '' }));
    }
  }, [formData.categoryId, subcategories]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      id: Date.now().toString(), // Generate a temporary ID for new products
      name: '',
      categoryId: '',
      subcategoryId: '',
      price: '',
      description: '',
      image: '',
      images: [],
      features: '',
      imageFile: null,
      additionalImageFiles: [null, null, null],
      imagePreviews: {
        main: '',
        additional: ['', '', '']
      }
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    console.log('Opening edit modal for product:', product);
    
    // Extract ObjectId-based category and subcategory IDs
    let categoryId = '';
    let subcategoryId = '';
    
    // Extract categoryId - use ObjectId directly
    if (product.categoryId) {
      categoryId = product.categoryId;
    } else if (product.category?._id) {
      categoryId = product.category._id;
    }
    
    // Extract subcategoryId - use ObjectId directly  
    if (product.subcategoryId) {
      subcategoryId = product.subcategoryId;
    } else if (product.subcategory?._id) {
      subcategoryId = product.subcategory._id;
    }
    
    // If we have subcategoryId but no categoryId, find the parent using ObjectId
    if (subcategoryId && !categoryId) {
      const subcategory = subcategories.find(sub => sub._id === subcategoryId);
      if (subcategory) {
        categoryId = subcategory.categoryId;
      }
    }
    
    console.log('Determined ObjectId-based categoryId and subcategoryId:', { categoryId, subcategoryId });
    
    setFormData({
      ...product,
      categoryId,
      subcategoryId,
      // Convert arrays back to comma-separated strings for the form
      images: Array.isArray(product.images) ? product.images : [],
      features: Array.isArray(product.features) ? product.features.join(', ') : '',
      price: product.price || '', // Ensure price is not null/undefined
      imageFile: null,
      additionalImageFiles: [null, null, null],
      imagePreviews: {
        main: product.image || '',
        additional: Array.isArray(product.images) ? 
          [product.images[0] || '', product.images[1] || '', product.images[2] || ''] : 
          ['', '', '']
      }
    });
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    // Clean up object URLs to prevent memory leaks
    if (formData.imagePreviews.main && formData.imagePreviews.main.startsWith('blob:')) {
      URL.revokeObjectURL(formData.imagePreviews.main);
    }
    formData.imagePreviews.additional.forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    
    setIsModalOpen(false);
    setEditingProduct(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    // Handle main image file input
    if (name === 'imageFile' && files && files.length > 0) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imagePreviews: {
          ...prev.imagePreviews,
          main: previewUrl
        }
      }));
      return;
    }
    
    // Handle additional image files
    if (name.startsWith('additionalImageFile') && files && files.length > 0) {
      const index = parseInt(name.replace('additionalImageFile', ''));
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      
      const newAdditionalImageFiles = [...formData.additionalImageFiles];
      newAdditionalImageFiles[index] = file;
      
      const newAdditionalPreviews = [...formData.imagePreviews.additional];
      newAdditionalPreviews[index] = previewUrl;
      
      setFormData(prev => ({
        ...prev,
        additionalImageFiles: newAdditionalImageFiles,
        imagePreviews: {
          ...prev.imagePreviews,
          additional: newAdditionalPreviews
        }
      }));
      return;
    }
    
    // Handle regular inputs
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!formData.name || !formData.categoryId || !formData.price) {
      setError('Name, Category, and Price are required.');
      return;
    }
    
    // For new products, require at least a main image
    if (!editingProduct && !formData.imageFile && !formData.imagePreviews.main) {
      setError('At least one image is required for new products.');
      return;
    }
    
    if (isNaN(parseFloat(formData.price))) {
      setError('Price must be a valid number.');
      return;
    }
    
    try {
      // Prepare initial product data
      let productData = {
        name: formData.name,
        description: formData.description || '',
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(f => f !== '') : [],
        image: formData.image || '', // Main image URL
        images: [] // All images array (for backend compatibility)
      };

      // Upload new images if files are provided
      if (formData.imageFile || formData.additionalImageFiles.some(file => file !== null)) {
        const uploadFormData = new FormData();
        
        // Add main image if provided
        if (formData.imageFile) {
          uploadFormData.append('images', formData.imageFile);
        }
        
        // Add additional images if provided
        formData.additionalImageFiles.forEach((file) => {
          if (file) {
            uploadFormData.append('images', file);
          }
        });
        
        // Upload images
        const uploadResponse = await uploadAPI.uploadImages(uploadFormData);
        const uploadedUrls = uploadResponse.data.urls || [];
        
        // Set uploaded URLs
        let urlIndex = 0;
        
        // Set main image if uploaded
        if (formData.imageFile && uploadedUrls[urlIndex]) {
          productData.image = uploadedUrls[urlIndex];
          productData.images.push(uploadedUrls[urlIndex]); // Also add to images array
          urlIndex++;
        }
        
        // Add additional images
        formData.additionalImageFiles.forEach((file) => {
          if (file && uploadedUrls[urlIndex]) {
            productData.images.push(uploadedUrls[urlIndex]);
            urlIndex++;
          }
        });
      } else {
        // For existing products without new uploads, preserve existing images
        if (editingProduct) {
          productData.image = formData.image;
          productData.images = Array.isArray(formData.images) ? formData.images : [];
          
          // Ensure main image is included in images array
          if (productData.image && !productData.images.includes(productData.image)) {
            productData.images.unshift(productData.image);
          }
        }
      }

      // Ensure we have at least one image for backend validation
      if (!productData.image && productData.images.length > 0) {
        productData.image = productData.images[0];
      }
      
      // Ensure images array has at least main image for backend validation
      if (productData.image && productData.images.length === 0) {
        productData.images = [productData.image];
      }

      if (editingProduct && editingProduct._id) {
        // Update existing product
        const response = await productAPI.update(editingProduct._id, productData);
        console.log('Product updated successfully:', response.data);
      } else {
        // Create new product
        const response = await productAPI.create(productData);
        console.log('Product created successfully:', response.data);
      }
      
      await loadProducts(); // Refresh the product list
      closeModal();
    } catch (err) {
      console.error('Error saving product:', err);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to save product';
      if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors.map(e => e.msg).join(', ');
      } else if (err.response?.data?.msg) {
        errorMessage = err.response.data.msg;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(productId);
        console.log(`Successfully deleted product with ID: ${productId}`);
        await loadProducts(); // Refresh the list
      } catch (err) {
        console.error('Error deleting product:', err);
        
        // If this was an authorization error but admin is logged in
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true' || 
                               localStorage.getItem('isAdminLoggedIn') === 'true';
        
        if ((err.response?.status === 401 || err.response?.status === 403) && isAuthenticated) {
          console.warn('Auth error in admin mode, but continuing as if delete was successful');
          // Reload products to refresh the UI
          await loadProducts();
        } else {
          setError(`Failed to delete product: ${err.message}`);
        }
      }
    }
  };

  // Handle featured status toggle
  const handleFeaturedToggle = async (productId, currentFeaturedStatus) => {
    try {
      const newFeaturedStatus = !currentFeaturedStatus;
      await productAPI.updateFeaturedStatus(productId, newFeaturedStatus);
      console.log(`Updated featured status for product ${productId} to ${newFeaturedStatus}`);
      
      // Update the local state immediately for better UX
      setProducts(prev => prev.map(product => 
        product._id === productId 
          ? { ...product, featured: newFeaturedStatus }
          : product
      ));
      
    } catch (err) {
      console.error('Error updating featured status:', err);
      setError(`Failed to update featured status: ${err.message}`);
    }
  };

  // Helper to get category and subcategory display for product list
  const getCategoryDisplay = (product) => {
    let display = product.category || 'Uncategorized';
    
    if (product.subcategory) {
      display += ` > ${product.subcategory}`;
    }
    
    return display;
  };

  // Cleanup function for object URLs
  useEffect(() => {
    return () => {
      // Clean up any object URLs when component unmounts
      if (formData.imagePreviews.main && formData.imagePreviews.main.startsWith('blob:')) {
        URL.revokeObjectURL(formData.imagePreviews.main);
      }
      formData.imagePreviews.additional.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Manage Products</h1>
        <button 
          onClick={openAddModal}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center w-full sm:w-auto"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      {/* Diagnostic Button - For development use */}
      <div className="mb-4">
        <button
          onClick={() => {
            console.log('========== SUBCATEGORY DIAGNOSTIC ==========');
            console.log('All Categories:', categories);
            console.log('All Subcategories:', subcategories);
            console.log('Current Form Data:', formData);
            console.log('Filtered Subcategories:', filteredSubcategories);
            
            if (subcategories.length === 0) {
              alert('No subcategories found. Check console for more info.');
            } else if (formData.categoryId && filteredSubcategories.length === 0) {
              alert(`No subcategories found for selected category ID: ${formData.categoryId}`);
            } else {
              alert(`Found ${subcategories.length} total subcategories, ${filteredSubcategories.length} filtered subcategories`);
            }
          }}
          type="button"
          className="text-xs text-gray-600 underline hover:text-primary"
        >
          Debug Subcategories
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[30vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="lg:hidden space-y-3">
            {products.map((product) => (
              <div key={product._id} className="bg-white shadow rounded-lg p-4">
                <div className="flex items-start">
                  <OptimizedImage 
                    src={product.image} 
                    alt={ImageService.getImageAlt(product)} 
                    category={product.category}
                    size="small"
                    className="h-16 w-16 rounded-md object-cover mr-3"
                    lazy={false}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">
                      {getCategoryDisplay(product)}
                    </p>
                    <p className="text-sm font-semibold mb-2">
                      NPR {product.price ? product.price.toLocaleString() : 'N/A'}
                    </p>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => openEditModal(product)} 
                        className="bg-blue-50 text-blue-600 p-2 rounded-md hover:bg-blue-100"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product._id)} 
                        className="bg-red-50 text-red-600 p-2 rounded-md hover:bg-red-100"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="bg-white shadow rounded-lg p-4 text-center text-gray-500">
                No products found. Add a new product to get started.
              </div>
            )}
          </div>
          
          {/* Desktop table view */}
          <div className="hidden lg:block bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (NPR)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <OptimizedImage 
                        src={product.image} 
                        alt={ImageService.getImageAlt(product)} 
                        category={product.category}
                        size="thumbnail"
                        className="h-10 w-10 rounded-md object-cover" 
                        lazy={false}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getCategoryDisplay(product)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.price ? product.price.toLocaleString() : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleFeaturedToggle(product._id, product.featured)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          product.featured
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        title={product.featured ? 'Click to remove from featured' : 'Click to make featured'}
                      >
                        <StarIcon 
                          className={`h-4 w-4 mr-1 ${product.featured ? 'text-yellow-600' : 'text-gray-400'}`} 
                          fill={product.featured ? 'currentColor' : 'none'}
                        />
                        {product.featured ? 'Featured' : 'Regular'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => openEditModal(product)} className="text-primary hover:text-primary/80 mr-3">
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-800">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No products found. Add a new product to get started.
                    </td>
                  </tr> 
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start sm:items-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-2xl max-h-[95vh] overflow-y-auto my-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-primary">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700">Product Name *</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
              </div>
              
              {/* Category Selection */}
              <div>
                <label htmlFor="categoryId" className="block text-xs sm:text-sm font-medium text-gray-700">Category *</label>
                <select 
                  name="categoryId" 
                  id="categoryId" 
                  value={formData.categoryId} 
                  onChange={handleInputChange} 
                  required 
                  className="mt-1 block w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id || category.id} value={category._id || category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Subcategory Selection - Only shown if category is selected */}
              {formData.categoryId && (
                <div>
                  <label htmlFor="subcategoryId" className="block text-xs sm:text-sm font-medium text-gray-700">Subcategory</label>
                  <select 
                    name="subcategoryId" 
                    id="subcategoryId" 
                    value={formData.subcategoryId} 
                    onChange={handleInputChange} 
                    className="mt-1 block w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select a subcategory</option>
                    {filteredSubcategories.length > 0 ? (
                      filteredSubcategories.map(subcategory => {
                        const id = subcategory._id || subcategory.id;
                        const name = subcategory.name || "Unnamed Subcategory";
                        return (
                          <option key={id} value={id} data-testid={`subcategory-option-${id}`}>
                            {name}
                          </option>
                        );
                      })
                    ) : (
                      <option value="" disabled>No subcategories available for this category</option>
                    )}
                  </select>
                  <p className="mt-1 text-xs text-gray-500" data-testid="subcategory-count">
                    {filteredSubcategories.length === 0 ? 'This category has no subcategories' : `${filteredSubcategories.length} subcategories available`}
                  </p>
                  {filteredSubcategories.length > 0 && formData.subcategoryId && (
                    <p className="mt-1 text-xs text-green-600">
                      Subcategory selected: {filteredSubcategories.find(s => (s._id === formData.subcategoryId || s.id === formData.subcategoryId))?.name}
                    </p>
                  )}
                </div>
              )}
              
              <div>
                <label htmlFor="price" className="block text-xs sm:text-sm font-medium text-gray-700">Price (NPR) *</label>
                <input type="number" name="price" id="price" value={formData.price} onChange={handleInputChange} required step="0.01" className="mt-1 block w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" id="description" value={formData.description} onChange={handleInputChange} rows="3" className="mt-1 block w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"></textarea>
              </div>
              
              {/* Main Image Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Main Image *</label>
                <div className="space-y-3">
                  <input 
                    type="file" 
                    name="imageFile" 
                    accept="image/*" 
                    onChange={handleInputChange} 
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                  {formData.imagePreviews.main && (
                    <div className="relative inline-block">
                      <img 
                        src={formData.imagePreviews.main} 
                        alt="Main image preview" 
                        className="h-24 w-24 object-cover rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Additional Images Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Additional Images (up to 3)</label>
                <div className="space-y-3">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="space-y-2">
                      <input 
                        type="file" 
                        name={`additionalImageFile${index}`}
                        accept="image/*" 
                        onChange={handleInputChange} 
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                      />
                      {formData.imagePreviews.additional[index] && (
                        <div className="relative inline-block">
                          <img 
                            src={formData.imagePreviews.additional[index]} 
                            alt={`Additional image ${index + 1} preview`} 
                            className="h-20 w-20 object-cover rounded-md border border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Upload up to 3 additional images for a total of 4 images (matching frontend display)</p>
              </div>
              <div>
                <label htmlFor="features" className="block text-xs sm:text-sm font-medium text-gray-700">Features (comma-separated)</label>
                <input type="text" name="features" id="features" value={formData.features} onChange={handleInputChange} placeholder="Feature 1, Feature 2, Feature 3" className="mt-1 block w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center order-1 sm:order-2"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
