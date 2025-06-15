import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryAPI } from '../../services/galleryAPI';
import api from '../../services/api';
import ImageService from '../../services/imageService';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaImage, 
  FaUpload, 
  FaSave, 
  FaTimes, 
  FaEye, 
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaCog,
  FaThLarge as FaGrid3X3,
  FaList,
  FaFilter,
  FaSort,
  FaCamera,
  FaTags,
  FaFolder,
  FaFolderPlus,
  FaLink,
  FaSearch,
  FaExclamationTriangle,
  FaCheck,
  FaSyncAlt
} from 'react-icons/fa';

const AdminGallery = () => {
  // Main gallery data structure aligned with the main website gallery
  const [sections, setSections] = useState([]);
  const [config, setConfig] = useState({
    title: 'Our Premium Gallery',
    subtitle: 'Discover our master craftsmanship through stunning visuals',
    layout: 'grid',
    showFilters: true,
    showStats: true,
    heroImage: null
  });
  
  // UI states matching the main website gallery implementation
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('sections'); // 'sections', 'images', 'config', 'preview'
  const [activeSectionId, setActiveSectionId] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'section', 'image', 'config', 'preview'
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const fileInputRef = useRef(null);
  
  // New preview state for live preview of the main website gallery
  const [previewActive, setPreviewActive] = useState(false);
  
  // Form states
  const [sectionForm, setSectionForm] = useState({
    name: '',
    description: '',
    category: 'residential',
    featured: false,
    order: 0,
    images: []
  });

  // Image form for creating/editing images
  const [imageForm, setImageForm] = useState({
    title: '',
    description: '',
    tags: '',
    featured: false,
    file: null
  });
  
  // Website gallery config form
  const [websiteConfigForm, setWebsiteConfigForm] = useState({
    title: '',
    subtitle: '',
    layout: 'grid',
    showFilters: true,
    showStats: true,
    heroImage: null,
    featuredSectionsOnHomepage: false,
    testimonialSlider: true
  });

  // Search and filter options
  const [filterOptions, setFilterOptions] = useState({
    categoryFilter: 'all',
    featuredOnly: false,
    sortBy: 'newest'
  });

  // Section and image selection states
  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    loadGalleryData();
  }, []);

  // Load gallery data from API - aligned with main website gallery structure
  const loadGalleryData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load gallery config and sections (same structure as main website)
      const [configResponse, galleryResponse] = await Promise.all([
        galleryAPI.getGalleryConfig().catch(() => ({ data: null })),
        galleryAPI.getGallery().catch(() => ({ data: { sections: [] } }))
      ]);

      // Process config
      const configData = configResponse?.data || config;
      
      // Process sections
      const gallerySections = galleryResponse.data?.sections || [];
      
      // Ensure we have valid data structure for each section
      const formattedSections = gallerySections.map(section => ({
        id: section._id || section.id,
        name: section.name || 'Unnamed Section',
        description: section.description || '',
        category: section.category || 'residential',
        featured: section.featured || false,
        order: section.order || 0,
        images: Array.isArray(section.images) ? section.images.map(formatGalleryImage) : []
      }));
      
      // Sort sections by order field
      formattedSections.sort((a, b) => a.order - b.order);
      
      // Update state with new data
      setSections(formattedSections);
      setConfig(configData);
      
      // Set website config form with current values
      setWebsiteConfigForm({
        title: configData.title || 'Our Premium Gallery',
        subtitle: configData.subtitle || 'Discover our master craftsmanship through stunning visuals',
        layout: configData.layout || 'grid',
        showFilters: configData.showFilters !== undefined ? configData.showFilters : true,
        showStats: configData.showStats !== undefined ? configData.showStats : true,
        heroImage: configData.heroImage || null,
        featuredSectionsOnHomepage: configData.featuredSectionsOnHomepage || false,
        testimonialSlider: configData.testimonialSlider !== undefined ? configData.testimonialSlider : true
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading gallery data:', error);
      setError('Failed to load gallery data: ' + error.message);
      setIsLoading(false);
      toast.error('Failed to load gallery data. Please try again.');
    }
  };

  // Format gallery image data consistently - matches main website implementation
  const formatGalleryImage = (image) => {
    if (!image) return null;
    
    // Get optimized image URL
    const optimizedImageUrl = ImageService.getOptimizedImageUrl(image.url || image.src || image, {
      width: 800,
      height: 600
    });
    
    return {
      id: image._id || image.id || `img-${Math.random().toString(36).substring(2, 9)}`,
      src: optimizedImageUrl,
      originalUrl: image.url || image.src || image,
      title: image.title || '',
      description: image.description || '',
      alt: image.title || 'Gallery image',
      tags: image.tags || [],
      featured: image.featured || false
    };
  };

  // Category Management
  const openCategoryModal = (category = null) => {
    setEditingItem(category);
    setCategoryForm(category || {
      name: '',
      description: '',
      parentId: '',
      image: null,
      featured: false,
      isCustomProject: false,
      order: galleryData.categories.length
    });
    setModalType('category');
    setIsModalOpen(true);
    setPreviewImage(category?.image || null);
  };

  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setCategoryForm(prev => ({...prev, image: file}));
    
    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const saveCategoryChanges = async () => {
    try {
      setIsLoading(true);
      let formData = new FormData();
      
      // Append all form fields
      Object.keys(categoryForm).forEach(key => {
        if (key !== 'image' || (key === 'image' && categoryForm[key] instanceof File)) {
          formData.append(key, categoryForm[key]);
        }
      });
      
      let response;
      if (editingItem) {
        response = await api.put(`/categories/${editingItem.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setGalleryData(prev => ({
          ...prev,
          categories: prev.categories.map(c => c.id === editingItem.id ? 
            { ...response.data, id: response.data._id || response.data.id } : c)
        }));
        
        toast.success('Category updated successfully!');
      } else {
        response = await api.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const newCategory = { 
          ...response.data, 
          id: response.data._id || response.data.id
        };
        
        setGalleryData(prev => ({
          ...prev,
          categories: [...prev.categories, newCategory],
          products: {
            ...prev.products,
            [newCategory.id]: []
          }
        }));
        
        toast.success('Category created successfully!');
      }
      
      closeModal();
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving category:', error);
      setIsLoading(false);
      toast.error('Failed to save category: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteCategory = async (categoryId) => {
    const category = galleryData.categories.find(c => c.id === categoryId);
    if (!category) return;
    
    // Don't allow deleting Custom Projects category
    if (category.isCustomProject || category.name === 'Custom Projects') {
      toast.warning('The Custom Projects category cannot be deleted. It is required by the system.');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the category "${category.name}"? All associated products will be moved to Uncategorized.`)) {
      try {
        setIsLoading(true);
        await api.delete(`/categories/${categoryId}`);
        
        // Update state to remove the category
        setGalleryData(prev => ({
          ...prev,
          categories: prev.categories.filter(c => c.id !== categoryId),
          products: Object.fromEntries(
            Object.entries(prev.products).filter(([key]) => key !== categoryId)
          )
        }));
        
        // If the active category is the one we're deleting, change to "all"
        if (activeCategory === categoryId) {
          setActiveCategory('all');
        }
        
        toast.success('Category deleted successfully');
        setIsLoading(false);
      } catch (error) {
        console.error('Error deleting category:', error);
        setIsLoading(false);
        toast.error('Failed to delete category: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // Product Management
  const openProductModal = (categoryId, product = null) => {
    setActiveCategory(categoryId);
    setEditingItem(product);
    
    // Initialize form with either existing product data or defaults
    setProductForm(product ? {
      name: product.title || product.name || '',
      description: product.description || '',
      categoryId: product.categoryId || categoryId,
      mainImage: null, // Will be uploaded
      additionalImages: [],
      featured: product.featured || false,
      tags: product.tags || [],
      isCustomProject: product.isCustomProject || (categoryId === 'custom-projects'),
      customDetails: product.customDetails || {
        clientName: '',
        projectDate: '',
        location: ''
      }
    } : {
      name: '',
      description: '',
      categoryId: categoryId,
      mainImage: null,
      additionalImages: [],
      featured: false,
      tags: [],
      isCustomProject: categoryId === 'custom-projects',
      customDetails: {
        clientName: '',
        projectDate: '',
        location: ''
      }
    });
    
    setModalType('product');
    setIsModalOpen(true);
    setPreviewImage(product?.src || null);
  };
  
  // Handle file input for product images
  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setProductForm(prev => ({...prev, mainImage: file}));
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle additional images
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setProductForm(prev => ({
      ...prev,
      additionalImages: [...prev.additionalImages, ...files]
    }));
  };
  
  // Remove an additional image before upload
  const removeAdditionalImage = (index) => {
    setProductForm(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index)
    }));
  };
  
  // Save product changes
  const saveProductChanges = async () => {
    try {
      setIsLoading(true);
      setUploadProgress(0);
      
      // Create form data for file upload
      const formData = new FormData();
      
      // Append text fields
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('categoryId', productForm.categoryId);
      formData.append('featured', productForm.featured);
      formData.append('isCustomProject', productForm.isCustomProject);
      
      // Append tags as JSON
      formData.append('tags', JSON.stringify(productForm.tags));
      
      // Append custom details as JSON
      formData.append('customDetails', JSON.stringify(productForm.customDetails));
      
      // Append main image if available
      if (productForm.mainImage) {
        formData.append('mainImage', productForm.mainImage);
      }
      
      // Append additional images
      if (productForm.additionalImages.length > 0) {
        productForm.additionalImages.forEach((file, index) => {
          formData.append(`additionalImages`, file);
        });
      }
      
      let response;
      if (editingItem) {
        // Update existing product
        response = await api.put(`/products/${editingItem.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        
        const updatedProduct = formatProduct(response.data);
        
        // Update products in state
        setGalleryData(prev => {
          // Update in category-specific collection
          const categoryProducts = prev.products[productForm.categoryId] || [];
          const updatedCategoryProducts = editingItem.categoryId === productForm.categoryId ? 
            categoryProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p) :
            [...categoryProducts, updatedProduct].filter(p => p.id !== editingItem.id);
            
          // Update in all products
          const updatedAllProducts = prev.allProducts.map(p => 
            p.id === updatedProduct.id ? updatedProduct : p
          );
          
          // Remove from old category if changed
          let products = {...prev.products};
          if (editingItem.categoryId !== productForm.categoryId && products[editingItem.categoryId]) {
            products[editingItem.categoryId] = products[editingItem.categoryId].filter(
              p => p.id !== editingItem.id
            );
          }
          
          return {
            ...prev,
            allProducts: updatedAllProducts,
            products: {
              ...products,
              [productForm.categoryId]: updatedCategoryProducts,
              all: updatedAllProducts,
              featured: updatedAllProducts.filter(p => p.featured)
            }
          };
        });
        
        toast.success('Product updated successfully!');
      } else {
        // Create new product
        response = await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        
        const newProduct = formatProduct(response.data);
        
        // Update products in state
        setGalleryData(prev => {
          // Add to all products
          const updatedAllProducts = [...prev.allProducts, newProduct];
          
          // Add to category-specific collection
          const categoryProducts = prev.products[productForm.categoryId] || [];
          const updatedCategoryProducts = [...categoryProducts, newProduct];
          
          return {
            ...prev,
            allProducts: updatedAllProducts,
            products: {
              ...prev.products,
              [productForm.categoryId]: updatedCategoryProducts,
              all: updatedAllProducts,
              featured: newProduct.featured ? 
                [...(prev.products.featured || []), newProduct] : 
                (prev.products.featured || [])
            }
          };
        });
        
        toast.success('Product created successfully!');
      }
      
      closeModal();
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving product:', error);
      setIsLoading(false);
      setUploadProgress(0);
      toast.error('Failed to save product: ' + (error.response?.data?.message || error.message));
    }
  };
  
  // Delete a product
  const deleteProduct = async (productId) => {
    const product = galleryData.allProducts.find(p => p.id === productId);
    if (!product) return;
    
    if (window.confirm(`Are you sure you want to delete "${product.title}"? This action cannot be undone.`)) {
      try {
        setIsLoading(true);
        await api.delete(`/products/${productId}`);
        
        // Update state to remove the product
        setGalleryData(prev => {
          // Remove from all products
          const updatedAllProducts = prev.allProducts.filter(p => p.id !== productId);
          
          // Update products by category
          const products = {...prev.products};
          Object.keys(products).forEach(categoryId => {
            products[categoryId] = products[categoryId].filter(p => p.id !== productId);
          });
          
          return {
            ...prev,
            allProducts: updatedAllProducts,
            products
          };
        });
        
        toast.success('Product deleted successfully');
        setIsLoading(false);
      } catch (error) {
        console.error('Error deleting product:', error);
        setIsLoading(false);
        toast.error('Failed to delete product: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // Section Management Functions
  const openSectionModal = (section = null) => {
    if (section) {
      // Editing existing section
      setSectionForm({
        name: section.name,
        description: section.description,
        category: section.category || 'residential',
        featured: section.featured,
        order: section.order || 0
      });
      setEditingItem(section);
    } else {
      // Creating new section
      setSectionForm({
        name: '',
        description: '',
        category: 'residential',
        featured: false,
        order: sections.length
      });
      setEditingItem(null);
    }
    
    setModalType('section');
    setIsModalOpen(true);
  };
  
  const saveSection = async () => {
    try {
      setIsLoading(true);
      
      if (editingItem) {
        // Update existing section
        await galleryAPI.updateSection(editingItem.id, sectionForm);
        toast.success('Section updated successfully!');
      } else {
        // Create new section
        await galleryAPI.createSection(sectionForm);
        toast.success('Section created successfully!');
      }
      
      // Reload gallery data
      await loadGalleryData();
      
      // Close modal
      setIsModalOpen(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving section:', error);
      setError('Failed to save section: ' + error.message);
      setIsLoading(false);
      toast.error('Failed to save section.');
    }
  };
  
  const deleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await galleryAPI.deleteSection(sectionId);
      toast.success('Section deleted successfully!');
      
      // Reload gallery data
      await loadGalleryData();
      setIsLoading(false);
    } catch (error) {
      console.error('Error deleting section:', error);
      setError('Failed to delete section: ' + error.message);
      setIsLoading(false);
      toast.error('Failed to delete section.');
    }
  };
  
  // Image Management
  const openImageModal = (sectionId, image = null) => {
    setSelectedSection(sections.find(section => section.id === sectionId));
    
    if (image) {
      // Editing existing image
      setImageForm({
        title: image.title,
        description: image.description,
        tags: image.tags?.join(', ') || '',
        featured: image.featured,
        file: null
      });
      setEditingItem(image);
    } else {
      // Adding new image
      setImageForm({
        title: '',
        description: '',
        tags: '',
        featured: false,
        file: null
      });
      setEditingItem(null);
    }
    
    setModalType('image');
    setIsModalOpen(true);
  };
  
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageForm(prev => ({ ...prev, file }));
    
    // Preview image
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  const saveImage = async () => {
    if (!selectedSection) {
      setError('No section selected for adding image.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (editingItem) {
        // Update existing image
        const imageData = {
          title: imageForm.title,
          description: imageForm.description,
          tags: imageForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          featured: imageForm.featured
        };
        
        // If there's a new file, upload it
        if (imageForm.file) {
          const formData = new FormData();
          formData.append('image', imageForm.file);
          
          const uploadResponse = await galleryAPI.uploadImage(formData);
          imageData.url = uploadResponse.url || uploadResponse.imageUrl;
        }
        
        await galleryAPI.updateImageInSection(selectedSection.id, editingItem.id, imageData);
        toast.success('Image updated successfully!');
      } else {
        // Create new image
        if (!imageForm.file) {
          setError('Please select an image to upload.');
          setIsLoading(false);
          return;
        }
        
        const formData = new FormData();
        formData.append('image', imageForm.file);
        
        // Upload image first
        const uploadResponse = await galleryAPI.uploadImage(formData);
        
        // Add image to section
        const imageData = {
          title: imageForm.title,
          description: imageForm.description,
          tags: imageForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          featured: imageForm.featured,
          url: uploadResponse.url || uploadResponse.imageUrl
        };
        
        await galleryAPI.addImageToSection(selectedSection.id, imageData);
        toast.success('Image added successfully!');
      }
      
      // Reload gallery data
      await loadGalleryData();
      
      // Close modal
      setIsModalOpen(false);
      setIsLoading(false);
      setPreviewImage(null);
    } catch (error) {
      console.error('Error saving image:', error);
      setError('Failed to save image: ' + error.message);
      setIsLoading(false);
      toast.error('Failed to save image.');
    }
  };
  
  const deleteImage = async (sectionId, imageId) => {
    if (!window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await galleryAPI.deleteImageFromSection(sectionId, imageId);
      toast.success('Image deleted successfully!');
      
      // Reload gallery data
      await loadGalleryData();
      setIsLoading(false);
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete image: ' + error.message);
      setIsLoading(false);
      toast.error('Failed to delete image.');
    }
  };
  
  // Section reordering function
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order property on each section
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));
    
    // Update local state immediately for better UX
    setSections(updatedItems);
    
    try {
      // Update order on server
      await galleryAPI.reorderSections(updatedItems.map(section => section.id));
      toast.success('Sections reordered successfully!');
    } catch (error) {
      console.error('Error reordering sections:', error);
      toast.error('Failed to reorder sections.');
      // Reload original data if reordering fails
      await loadGalleryData();
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setSelectedSection(null);
    setModalType('');
  };

  // Config Modal
  const openConfigModal = () => {
    setModalType('config');
    setIsModalOpen(true);
  };

  // Handle website gallery configuration
  const saveWebsiteConfig = async () => {
    try {
      setIsLoading(true);
      
      // Create a copy of the form data for submitting
      const configData = { ...websiteConfigForm };
      
      // If there's a new hero image file, upload it first
      if (websiteConfigForm.heroImage && websiteConfigForm.heroImage instanceof File) {
        const formData = new FormData();
        formData.append('image', websiteConfigForm.heroImage);
        
        const uploadResponse = await galleryAPI.uploadImage(formData);
        configData.heroImage = uploadResponse.url || uploadResponse.imageUrl;
      }
      
      // Update website gallery configuration
      await galleryAPI.updateGalleryConfig(configData);
      
      // Update local state
      setConfig(configData);
      
      // Close modal if open
      if (isModalOpen) {
        setIsModalOpen(false);
      }
      
      // Show success message
      toast.success('Website gallery configuration updated successfully!');
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error updating website gallery configuration:', error);
      setError('Failed to update website gallery configuration: ' + error.message);
      setIsLoading(false);
      toast.error('Failed to update website gallery configuration.');
    }
  };
  
  // Preview website gallery with current configuration
  const previewWebsiteGallery = () => {
    setPreviewActive(!previewActive);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
            <FaImage className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-primary font-medium animate-pulse">Loading gallery data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-light to-white border-l-4 border-primary rounded-lg p-4 md:p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FaImage className="text-primary hidden sm:inline" /> Gallery Management
            </h1>
            <p className="text-gray-600 mt-1">Manage your gallery sections, images, and settings</p>
          </div>
          <button
            onClick={() => setActiveTab('preview')}
            className="bg-primary hover:bg-primary-dark text-white px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm w-full sm:w-auto justify-center"
          >
            <FaEye className="w-4 h-4" />
            Website Gallery
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap justify-center sm:justify-start overflow-x-auto scrollbar-thin">
            {[
              { id: 'sections', label: 'Sections', icon: FaGrid3X3 },
              { id: 'images', label: 'All Images', icon: FaImage },
              { id: 'config', label: 'Configuration', icon: FaCog },
              { id: 'preview', label: 'Website Gallery', icon: FaEye }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 md:py-4 px-3 md:px-6 border-b-2 font-medium text-sm transition-colors flex-1 sm:flex-none justify-center sm:justify-start ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary-light bg-opacity-20'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="inline sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold text-primary">Gallery Sections</h2>
                <button
                  onClick={() => openSectionModal()}
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm w-full sm:w-auto justify-center"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Section
                </button>
              </div>

              <div className="grid gap-6">
                {galleryData.sections.map((section) => (
                  <motion.div
                    key={section.id}
                    className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                    whileHover={{ scale: 1.005 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div className="flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-primary">{section.name}</h3>
                          {section.featured && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                              <FaStar className="w-3 h-3" />
                              Featured
                            </span>
                          )}
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize shadow-sm">
                            {section.category}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{section.description}</p>
                        <div className="text-sm text-gray-500 bg-gray-50 inline-block px-3 py-1 rounded-lg">
                          {section.images?.length || 0} images
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => openImageModal(section.id)}
                          className="bg-green-500 hover:bg-green-600 text-white p-2 sm:p-2.5 rounded-lg transition-colors shadow-sm flex-1 sm:flex-none flex items-center justify-center gap-1"
                          title="Add Image"
                        >
                          <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="sm:hidden">Add Image</span>
                        </button>
                        <button
                          onClick={() => openSectionModal(section)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 sm:p-2.5 rounded-lg transition-colors shadow-sm flex-1 sm:flex-none flex items-center justify-center gap-1"
                          title="Edit Section"
                        >
                          <FaEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="sm:hidden">Edit</span>
                        </button>
                        <button
                          onClick={() => deleteSection(section.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 sm:p-2.5 rounded-lg transition-colors shadow-sm flex-1 sm:flex-none flex items-center justify-center gap-1"
                          title="Delete Section"
                        >
                          <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="sm:hidden">Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Section Images Preview */}
                    {section.images && section.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
                        {section.images.slice(0, 6).map((image) => (
                          <div
                            key={image.id}
                            className="relative group aspect-square rounded-lg overflow-hidden bg-gray-200 shadow-sm hover:shadow-md transition-all"
                          >
                            <img
                              src={image.src || image.path}
                              alt={image.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                  onClick={() => openImageModal(section.id, image)}
                                  className="bg-white text-primary p-2 rounded-full shadow-sm"
                                  title="Edit"
                                >
                                  <FaEdit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => deleteImage(image.id)}
                                  className="bg-red-500 text-white p-2 rounded-full shadow-sm"
                                  title="Delete"
                                >
                                  <FaTrash className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            {image.featured && (
                              <div className="absolute top-1 right-1 bg-yellow-400 text-yellow-900 p-1 rounded-full shadow-sm">
                                <FaStar className="w-2 h-2" />
                              </div>
                            )}
                          </div>
                        ))}
                        {section.images.length > 6 && (
                          <div className="aspect-square rounded-lg bg-primary-light flex items-center justify-center text-primary font-medium text-sm shadow-sm hover:shadow-md transition-all cursor-pointer">
                            +{section.images.length - 6} more
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold text-primary">All Gallery Images</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 sm:flex-none shadow-sm">
                    <option value="">All Sections</option>
                    {galleryData.sections.map(section => (
                      <option key={section.id} value={section.id}>{section.name}</option>
                    ))}
                  </select>
                  <button className="bg-primary hover:bg-primary-dark text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                    <FaFilter className="w-3 h-3" />
                    <span className="hidden sm:inline">Filter</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {galleryData.sections.flatMap(section => 
                  section.images?.map(image => (
                    <div
                      key={image.id}
                      className="relative group aspect-square rounded-lg overflow-hidden bg-gray-200 shadow-sm hover:shadow-md transition-all"
                    >
                      <img
                        src={image.src || image.path}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {image.featured && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 p-1 rounded-full shadow-sm">
                          <FaStar className="w-3 h-3" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button
                            onClick={() => openImageModal(section.id, image)}
                            className="bg-white text-primary p-2 rounded-full shadow-lg"
                            title="Edit"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteImage(image.id)}
                            className="bg-red-500 text-white p-2 rounded-full shadow-lg"
                            title="Delete"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-2 text-xs">
                        <div className="font-medium truncate">{image.title}</div>
                        <div className="text-gray-300 truncate">{section.name}</div>
                      </div>
                    </div>
                  )) || []
                )}
              </div>
            </div>
          )}

          {/* Configuration Tab */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <FaCog className="text-primary w-5 h-5" />
                <h2 className="text-xl font-semibold text-primary">Gallery Configuration</h2>
              </div>
              
              <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gallery Title
                      </label>
                      <input
                        type="text"
                        value={configForm.title}
                        onChange={(e) => setConfigForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary shadow-sm"
                        placeholder="Enter gallery title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gallery Subtitle
                      </label>
                      <textarea
                        value={configForm.subtitle}
                        onChange={(e) => setConfigForm(prev => ({ ...prev, subtitle: e.target.value }))}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary shadow-sm"
                        placeholder="Enter a brief description for the gallery"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Layout
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'grid', label: 'Grid', icon: FaGrid3X3 },
                          { value: 'masonry', label: 'Masonry', icon: FaList },
                          { value: 'slider', label: 'Slider', icon: FaSort }
                        ].map((option) => (
                          <label 
                            key={option.value}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                              configForm.layout === option.value 
                                ? 'border-primary bg-primary-light text-primary' 
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            } cursor-pointer transition-all`}
                          >
                            <option.icon className="w-5 h-5 mb-1" />
                            <span className="text-sm">{option.label}</span>
                            <input
                              type="radio"
                              name="layout"
                              value={option.value}
                              checked={configForm.layout === option.value}
                              onChange={() => setConfigForm(prev => ({ ...prev, layout: option.value }))}
                              className="sr-only"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Display Options</h3>
                      <div className="space-y-3">
                        <label className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
                          <input
                            type="checkbox"
                            checked={configForm.showFilters}
                            onChange={(e) => setConfigForm(prev => ({ ...prev, showFilters: e.target.checked }))}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="ml-2 text-sm text-gray-700">Show category filters</span>
                        </label>
                        
                        <label className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
                          <input
                            type="checkbox"
                            checked={configForm.showStats}
                            onChange={(e) => setConfigForm(prev => ({ ...prev, showStats: e.target.checked }))}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="ml-2 text-sm text-gray-700">Show gallery statistics</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={saveConfigChanges}
                    className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <FaSave className="w-4 h-4" />
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FaEye className="text-primary w-5 h-5" />
                  <h2 className="text-xl font-semibold text-primary">Website Gallery Configuration</h2>
                </div>
                <button
                  onClick={saveWebsiteConfig}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded flex items-center gap-2"
                >
                  <FaSave className="w-4 h-4" />
                  Save & Apply to Website
                </button>
              </div>
              
              <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg border-b pb-2">Gallery Content</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gallery Title
                      </label>
                      <input
                        type="text"
                        value={websiteConfigForm.title}
                        onChange={(e) => setWebsiteConfigForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary shadow-sm"
                        placeholder="Enter gallery title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gallery Subtitle
                      </label>
                      <input
                        type="text"
                        value={websiteConfigForm.subtitle}
                        onChange={(e) => setWebsiteConfigForm(prev => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary shadow-sm"
                        placeholder="Enter gallery subtitle"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hero Image
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              // Preview image
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setPreviewImage(event.target.result);
                              };
                              reader.readAsDataURL(file);
                              
                              setWebsiteConfigForm(prev => ({ ...prev, heroImage: file }));
                            }
                          }}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current.click()}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded flex items-center gap-2"
                        >
                          <FaUpload className="w-4 h-4" />
                          Upload Hero Image
                        </button>
                        {(previewImage || websiteConfigForm.heroImage) && (
                          <div className="w-16 h-16 relative">
                            <img
                              src={previewImage || websiteConfigForm.heroImage}
                              alt="Hero Preview"
                              className="w-full h-full object-cover rounded"
                            />
                            <button
                              onClick={() => {
                                setPreviewImage(null);
                                setWebsiteConfigForm(prev => ({ ...prev, heroImage: null }));
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg border-b pb-2">Gallery Display Settings</h3>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="showFilters"
                        checked={websiteConfigForm.showFilters}
                        onChange={(e) => setWebsiteConfigForm(prev => ({ ...prev, showFilters: e.target.checked }))}
                        className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="showFilters" className="text-sm font-medium text-gray-700">
                        Show Category Filters
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="showStats"
                        checked={websiteConfigForm.showStats}
                        onChange={(e) => setWebsiteConfigForm(prev => ({ ...prev, showStats: e.target.checked }))}
                        className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="showStats" className="text-sm font-medium text-gray-700">
                        Show Gallery Statistics
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featuredSectionsOnHomepage"
                        checked={websiteConfigForm.featuredSectionsOnHomepage}
                        onChange={(e) => setWebsiteConfigForm(prev => ({ ...prev, featuredSectionsOnHomepage: e.target.checked }))}
                        className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="featuredSectionsOnHomepage" className="text-sm font-medium text-gray-700">
                        Show Featured Sections on Homepage
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="testimonialSlider"
                        checked={websiteConfigForm.testimonialSlider}
                        onChange={(e) => setWebsiteConfigForm(prev => ({ ...prev, testimonialSlider: e.target.checked }))}
                        className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="testimonialSlider" className="text-sm font-medium text-gray-700">
                        Show Testimonial Slider
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Layout
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setWebsiteConfigForm(prev => ({ ...prev, layout: 'grid' }))}
                          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                            websiteConfigForm.layout === 'grid'
                              ? 'bg-primary text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <FaGrid3X3 className="w-4 h-4" />
                          Grid View
                        </button>
                        <button
                          onClick={() => setWebsiteConfigForm(prev => ({ ...prev, layout: 'list' }))}
                          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                            websiteConfigForm.layout === 'list'
                              ? 'bg-primary text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <FaList className="w-4 h-4" />
                          List View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-lg">Live Preview</h3>
                    <button
                      onClick={() => setPreviewActive(!previewActive)}
                      className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                        previewActive ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                      }`}
                    >
                      {previewActive ? (
                        <>
                          <FaTimes className="w-4 h-4" />
                          Hide Preview
                        </>
                      ) : (
                        <>
                          <FaEye className="w-4 h-4" />
                          Show Preview
                        </>
                      )}
                    </button>
                  </div>
                  
                  {previewActive && (
                    <div className="border rounded-lg p-4 bg-gray-50 preview-container max-w-full overflow-auto" style={{ maxHeight: '600px' }}>
                    {/* This is a simplified version of the GalleryPage component */}
                    <div className="gallery-preview">
                      {/* Header */}
                      <div className="preview-header mb-6 text-center">
                        <h2 className="text-2xl font-bold">{websiteConfigForm.title}</h2>
                        <p className="text-gray-600">{websiteConfigForm.subtitle}</p>
                      </div>
                      
                      {/* Controls */}
                      {websiteConfigForm.showFilters && (
                        <div className="mb-4 flex flex-wrap gap-2 justify-center">
                          <button className="px-3 py-1 bg-primary text-white rounded-md">All</button>
                          <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md">Featured</button>
                          {sections.slice(0, 3).map(section => (
                            <button key={section.id} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md">
                              {section.name}
                            </button>
                          ))}
                          {sections.length > 3 && (
                            <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md">
                              +{sections.length - 3} more
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Stats */}
                      {websiteConfigForm.showStats && (
                        <div className="mb-6 flex flex-wrap gap-4 justify-center text-center">
                          <div className="stat-item p-3 bg-white rounded-lg shadow-sm">
                            <div className="text-xl font-bold">{getGalleryStats().totalImages}</div>
                            <div className="text-sm text-gray-600">Total Images</div>
                          </div>
                          <div className="stat-item p-3 bg-white rounded-lg shadow-sm">
                            <div className="text-xl font-bold">{getGalleryStats().totalSections}</div>
                            <div className="text-sm text-gray-600">Gallery Sections</div>
                          </div>
                          <div className="stat-item p-3 bg-white rounded-lg shadow-sm">
                            <div className="text-xl font-bold">{getGalleryStats().featuredImages}</div>
                            <div className="text-sm text-gray-600">Featured Images</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Gallery Preview */}
                      <div className="gallery-sections-preview space-y-8">
                        {sections.map(section => (
                          <div key={section.id} className="preview-section">
                            <div className="section-header mb-3">
                              <h3 className="text-xl font-semibold">{section.name}</h3>
                              {section.description && (
                                <p className="text-gray-600 text-sm">{section.description}</p>
                              )}
                            </div>
                            
                            <div className={`section-images ${websiteConfigForm.layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : 'space-y-4'}`}>
                              {section.images.slice(0, 6).map((image, idx) => (
                                websiteConfigForm.layout === 'grid' ? (
                                  <div key={image.id || idx} className="image-card bg-white rounded-lg shadow-sm overflow-hidden">
                                    <div className="aspect-w-4 aspect-h-3 relative">
                                      <img 
                                        src={image.src || image.url || image.originalUrl} 
                                        alt={image.alt || image.title || 'Gallery image'} 
                                        className="w-full h-full object-cover"
                                      />
                                      {image.featured && (
                                        <span className="absolute top-2 right-2 bg-primary text-white text-xs p-1 rounded-full">
                                          <FaStar className="inline w-3 h-3" />
                                        </span>
                                      )}
                                    </div>
                                    {(image.title || image.description) && (
                                      <div className="p-3">
                                        {image.title && <div className="font-medium">{image.title}</div>}
                                        {image.description && <div className="text-xs text-gray-600">{image.description}</div>}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div key={image.id || idx} className="list-item-card bg-white rounded-lg shadow-sm overflow-hidden flex">
                                    <div className="w-1/3">
                                      <img 
                                        src={image.src || image.url || image.originalUrl} 
                                        alt={image.alt || image.title || 'Gallery image'} 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="p-3 w-2/3">
                                      <div className="flex justify-between">
                                        <div className="font-medium">{image.title || 'Untitled'}</div>
                                        {image.featured && (
                                          <span className="bg-primary text-white text-xs p-1 rounded-full">
                                            <FaStar className="inline w-3 h-3" />
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-sm text-gray-600 mt-1">{image.description || 'No description'}</div>
                                    </div>
                                  </div>
                                )
                              ))}
                              
                              {section.images.length > 6 && (
                                <div className={`more-images ${websiteConfigForm.layout === 'grid' ? 'col-span-full text-center mt-2' : 'text-center mt-2'}`}>
                                  <span className="text-primary font-medium">+ {section.images.length - 6} more images</span>
                                </div>
                              )}
                              
                              {section.images.length === 0 && (
                                <div className="text-center p-6 bg-gray-100 rounded-lg">
                                  <FaImage className="mx-auto text-gray-400 w-8 h-8 mb-2" />
                                  <p className="text-gray-500">No images in this section</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Show testimonial slider if enabled */}
                        {websiteConfigForm.testimonialSlider && (
                          <div className="testimonial-preview p-4 bg-gray-100 rounded-lg text-center">
                            <div className="font-semibold mb-2">Testimonial Slider</div>
                            <p className="text-sm text-gray-600">Client testimonials will be displayed here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-auto my-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  {modalType === 'section' && (
                    <>
                      <FaGrid3X3 className="hidden sm:inline-block w-4 h-4" />
                      {editingItem ? 'Edit Section' : 'Add New Section'}
                    </>
                  )}
                  {modalType === 'image' && (
                    <>
                      <FaImage className="hidden sm:inline-block w-4 h-4" />
                      {editingItem ? 'Edit Image' : 'Add New Image'}
                    </>
                  )}
                  {modalType === 'config' && (
                    <>
                      <FaCog className="hidden sm:inline-block w-4 h-4" />
                      Gallery Configuration
                    </>
                  )}
                </h3>
                <button
                  onClick={closeModal}
                  className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                  aria-label="Close"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                {/* Section Form */}
                {modalType === 'section' && (
                  <div className="p-4 sm:p-6">
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Section Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={sectionForm.name}
                          onChange={(e) => setSectionForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-primary focus:border-primary shadow-sm"
                          placeholder="e.g., Household Furniture"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={sectionForm.description}
                          onChange={(e) => setSectionForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-primary focus:border-primary shadow-sm"
                          placeholder="Brief description of this section..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                          </label>
                          <select
                            value={sectionForm.category}
                            onChange={(e) => setSectionForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-primary focus:border-primary shadow-sm"
                          >
                            <option value="">Select category</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="custom">Custom</option>
                            <option value="process">Process</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 px-3 py-2.5">
                          <label className="flex items-center justify-center w-full cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sectionForm.featured}
                              onChange={(e) => setSectionForm(prev => ({ ...prev, featured: e.target.checked }))}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="ml-2 text-sm text-gray-700">Featured section</span>
                            {sectionForm.featured && <FaStar className="ml-2 w-3 h-3 text-yellow-500" />}
                          </label>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200 mt-6">
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                          <button
                            onClick={closeModal}
                            className="mb-2 sm:mb-0 order-2 sm:order-1 px-4 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveSection}
                            className="order-1 sm:order-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm w-full sm:w-auto flex justify-center items-center gap-2"
                          >
                            {editingItem ? <FaEdit className="w-4 h-4" /> : <FaPlus className="w-4 h-4" />}
                            {editingItem ? 'Update Section' : 'Create Section'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Form */}
                {modalType === 'image' && (
                  <div className="p-4 sm:p-6">
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={imageForm.title}
                            onChange={(e) => setImageForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-primary focus:border-primary shadow-sm"
                            placeholder="Enter image title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags <span className="text-xs text-gray-500">(comma-separated)</span>
                          </label>
                          <input
                            type="text"
                            value={imageForm.tags}
                            onChange={(e) => setImageForm(prev => ({ ...prev, tags: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-primary focus:border-primary shadow-sm"
                            placeholder="furniture, modern, living room"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={imageForm.description}
                          onChange={(e) => setImageForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={2}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-primary focus:border-primary shadow-sm"
                          placeholder="Image description..."
                        />
                      </div>

                      {!editingItem && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image File <span className="text-red-500">*</span>
                          </label>
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <FaUpload className="w-8 h-8 text-gray-400" />
                            <span className="text-gray-500 text-sm">Drag & drop or click to select</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setImageForm(prev => ({ ...prev, file: e.target.files[0] }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          {imageForm.file && (
                            <div className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                              <FaImage className="text-primary" /> 
                              Selected: {imageForm.file.name}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center p-3 bg-primary-light bg-opacity-30 rounded-lg">
                        <label className="flex items-center w-full cursor-pointer">
                          <input
                            type="checkbox"
                            checked={imageForm.featured}
                            onChange={(e) => setImageForm(prev => ({ ...prev, featured: e.target.checked }))}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700 flex items-center gap-1">
                            Featured image
                            {imageForm.featured && <FaStar className="text-yellow-500" />}
                          </span>
                        </label>
                      </div>

                      <div className="pt-4 border-t border-gray-200 mt-6">
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                          <button
                            onClick={closeModal}
                            className="mb-2 sm:mb-0 order-2 sm:order-1 px-4 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveImage}
                            className="order-1 sm:order-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm w-full sm:w-auto flex justify-center items-center gap-2"
                          >
                            {editingItem ? <FaSave className="w-4 h-4" /> : <FaUpload className="w-4 h-4" />}
                            {editingItem ? 'Update Image' : 'Upload Image'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Config Form */}
                {modalType === 'config' && (
                  <div className="p-4 sm:p-6">
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gallery Title
                          </label>
                          <input
                            type="text"
                            value={websiteConfigForm.title}
                            onChange={(e) => setWebsiteConfigForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-primary focus:border-primary shadow-sm"
                            placeholder="Enter gallery title"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gallery Subtitle
                          </label>
                          <input
                            type="text"
                            value={websiteConfigForm.subtitle}
                            onChange={(e) => setWebsiteConfigForm(prev => ({ ...prev, subtitle: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-primary focus:border-primary shadow-sm"
                            placeholder="Enter gallery subtitle"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800">Display Options</h4>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="configShowFilters"
                              checked={websiteConfigForm.showFilters}
                              onChange={(e) => setWebsiteConfigForm(prev => ({ ...prev, showFilters: e.target.checked }))}
                              className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="configShowFilters" className="text-sm font-medium text-gray-700">
                              Show Category Filters
                            </label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="configShowStats"
                              checked={websiteConfigForm.showStats}
                              onChange={(e) => setWebsiteConfigForm(prev => ({ ...prev, showStats: e.target.checked }))}
                              className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="configShowStats" className="text-sm font-medium text-gray-700">
                              Show Gallery Statistics
                            </label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="configTestimonialSlider"
                              checked={websiteConfigForm.testimonialSlider}
                              onChange={(e) => setWebsiteConfigForm(prev => ({ ...prev, testimonialSlider: e.target.checked }))}
                              className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="configTestimonialSlider" className="text-sm font-medium text-gray-700">
                              Show Testimonial Slider
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Default Layout
                          </label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setWebsiteConfigForm(prev => ({ ...prev, layout: 'grid' }))}
                              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                                websiteConfigForm.layout === 'grid'
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              <FaGrid3X3 className="w-4 h-4" />
                              Grid View
                            </button>
                            <button
                              type="button"
                              onClick={() => setWebsiteConfigForm(prev => ({ ...prev, layout: 'list' }))}
                              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                                websiteConfigForm.layout === 'list'
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              <FaList className="w-4 h-4" />
                              List View
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200 mt-6">
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                          <button
                            onClick={closeModal}
                            className="mb-2 sm:mb-0 order-2 sm:order-1 px-4 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveWebsiteConfig}
                            className="order-1 sm:order-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm w-full sm:w-auto flex justify-center items-center gap-2"
                          >
                            <FaSave className="w-4 h-4" />
                            Save Configuration
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminGallery;
