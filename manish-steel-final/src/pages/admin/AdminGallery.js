import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryAPI } from '../../services/galleryAPI';
import api from '../../services/api';
import ImageService from '../../services/imageService';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
  FaDownload,
  FaExpand,
  FaCompress,
  FaShareAlt,
  FaInfoCircle,
  FaSortAmountDown,
  FaGripVertical,
  FaCheckCircle,
  FaLayerGroup,
  FaPalette,
  FaRegularImage,
  FaThumbsUp,
  FaChartBar,
  FaColumns,
  FaMagic,
  FaRegularCheckCircle,
  FaUserCog
} from 'react-icons/fa';
import { MdDashboard, MdCategory, MdCollections, MdViewQuilt, MdPhotoLibrary } from 'react-icons/md';

const AdminGallery = () => {
  // Primary navigation and UI states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  // Gallery data states
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Structured gallery data object to avoid undefined errors
  const galleryData = useMemo(() => {
    return {
      sections: sections || [],
      categories: categories || [],
      images: images || []
    };
  }, [sections, categories, images]);

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterBy, setFilterBy] = useState('all');
  const [filterTags, setFilterTags] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  
  // Form states
  const [sectionForm, setSectionForm] = useState({
    name: '',
    description: '',
    category: '',
    featured: false,
    tags: '',
    order: 0
  });

  const [imageForm, setImageForm] = useState({
    title: '',
    description: '',
    tags: '',
    featured: false,
    category: '',
    file: null
  });

  const [websiteConfigForm, setWebsiteConfigForm] = useState({
    title: 'Our Professional Gallery',
    subtitle: 'Discover our master craftsmanship through stunning visuals',
    heroImage: null,
    showFilters: true,
    showStats: true,
    layout: 'grid',
    featuredSectionsOnHomepage: true,
    testimonialSlider: true,
    metaDescription: 'Explore our gallery showcasing premium furniture and steel products',
    itemsPerPage: 12
  });
  
  // For categories management
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    order: 0,
    imageUrl: '',
    active: true
  });

  const [editingCategory, setEditingCategory] = useState(null);

  // Analytics data state
  const [analytics, setAnalytics] = useState({
    totalVisitors: 0,
    popularSections: [],
    popularProducts: [],
    lastUpdated: null
  });

  // Load all gallery data
  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Parallel data loading for better performance
      const [
        sectionsResponse, 
        configResponse, 
        categoriesResponse, 
        productsResponse
      ] = await Promise.all([
        galleryAPI.getAllSections(),
        galleryAPI.getConfiguration(),
        api.get('/categories'),
        galleryAPI.getAllProducts()
      ]);
      
      // Process sections data
      if (sectionsResponse?.data) {
        const sectionsData = sectionsResponse.data.sections || sectionsResponse.data || [];
        setSections(sectionsData);
        
        // Extract all images from sections
        const allImages = sectionsData.reduce((acc, section) => {
          const sectionImages = (section.images || []).map(img => ({
            ...img,
            sectionId: section.id || section._id,
            sectionName: section.name
          }));
          return [...acc, ...sectionImages];
        }, []);
        
        setImages(allImages);
      }
      
      // Process configuration
      if (configResponse?.data) {
        setWebsiteConfigForm(prev => ({
          ...prev,
          ...configResponse.data
        }));
      }
      
      // Process categories
      if (categoriesResponse?.data) {
        setCategories(categoriesResponse.data || []);
      }
      
      // Process products
      if (productsResponse?.data) {
        setProducts(productsResponse.data || []);
      }
      
      // Set default selection states
      if (sectionsResponse?.data?.sections?.length > 0) {
        setSelectedSection(sectionsResponse.data.sections[0].id || sectionsResponse.data.sections[0]._id);
      }
      
      // Load mock analytics (would be replaced with real analytics in production)
      loadAnalyticsData();
      
    } catch (error) {
      console.error('Error loading gallery data:', error);
      toast.error('Failed to load gallery data');
    } finally {
      setLoading(false);
    }
  };
  
  // Define loadGalleryData to fix the reference
  const loadGalleryData = async () => {
    try {
      setLoading(true);
      
      // Load sections data
      const sectionsResponse = await galleryAPI.getAllSections();
      if (sectionsResponse?.data) {
        const sectionsData = sectionsResponse.data.sections || sectionsResponse.data || [];
        setSections(sectionsData);
        
        // Extract all images from sections
        const allImages = sectionsData.reduce((acc, section) => {
          const sectionImages = (section.images || []).map(img => ({
            ...img,
            sectionId: section.id || section._id,
            sectionName: section.name
          }));
          return [...acc, ...sectionImages];
        }, []);
        
        setImages(allImages);
      }
      
      // Update analytics data after gallery changes
      loadAnalyticsData();
      
    } catch (error) {
      console.error('Error loading gallery data:', error);
      toast.error('Failed to load gallery data');
    } finally {
      setLoading(false);
    }
  };

  // Load analytics data
  const loadAnalyticsData = async () => {
    try {
      // Try to fetch real analytics data if API endpoint exists
      const analyticsEndpoint = '/gallery/analytics';
      let analyticsData = null;
      
      try {
        const analyticsResponse = await api.get(analyticsEndpoint);
        if (analyticsResponse?.data) {
          analyticsData = analyticsResponse.data;
          console.log('Loaded real analytics data:', analyticsData);
        }
      } catch (error) {
        console.log('No real analytics data available, using mock data');
      }
      
      // If no real analytics data, generate mock data
      if (!analyticsData) {
        // Calculate basic statistics from actual gallery data
        const totalVisitors = Math.floor(Math.random() * 1000) + 500;
        
        // Create popular sections based on actual sections
        const popularSections = sections
          .slice(0, Math.min(sections.length, 3))
          .map((s, index) => ({ 
            name: s.name, 
            id: s.id || s._id,
            views: Math.floor(Math.random() * 100) + 100 - (index * 20) 
          }))
          .sort((a, b) => b.views - a.views);
        
        // Calculate featured items
        const featuredSections = sections.filter(s => s.featured).length;
        const featuredImages = images.filter(i => i.featured).length;
        
        // Calculate categories distribution
        const categoryDistribution = categories.map(cat => {
          const count = sections.filter(s => s.category === cat.name || s.category === cat._id).length;
          return {
            name: cat.name,
            count,
            percentage: sections.length > 0 ? Math.round((count / sections.length) * 100) : 0
          };
        }).sort((a, b) => b.count - a.count);
        
        // Last 5 updates (mock data)
        const recentUpdates = [
          {
            id: 'upd1',
            action: 'Section Updated',
            target: sections.length > 0 ? sections[0].name : 'Gallery Section',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            user: 'Admin'
          },
          {
            id: 'upd2',
            action: 'Image Added',
            target: 'New Product Image',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
            user: 'Admin'
          },
          {
            id: 'upd3',
            action: 'Config Changed',
            target: 'Gallery Layout',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24 hours ago
            user: 'Admin'
          }
        ];
        
        analyticsData = {
          totalVisitors,
          popularSections,
          featuredItems: featuredSections + featuredImages,
          categoryDistribution,
          recentUpdates,
          lastUpdated: new Date()
        };
      }
      
      setAnalytics(analyticsData);
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Set fallback data
      setAnalytics({
        totalVisitors: Math.floor(Math.random() * 500) + 100,
        popularSections: [],
        featuredItems: 0,
        categoryDistribution: [],
        recentUpdates: [],
        lastUpdated: new Date()
      });
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Modal handlers
  const openSectionModal = (section = null) => {
    setEditingItem(section);
    setModalType('section');
    setSectionForm(section || {
      name: '',
      description: '',
      category: '',
      featured: false,
      tags: ''
    });
    setIsModalOpen(true);
  };

  const openImageModal = (image = null) => {
    setEditingItem(image);
    setModalType('image');
    setImageForm(image || {
      title: '',
      description: '',
      tags: '',
      featured: false,
      file: null
    });
    setIsModalOpen(true);
  };

  const openConfigModal = () => {
    setModalType('config');
    setIsModalOpen(true);
  };

  const openCategoryModal = (category = null) => {
    setEditingCategory(category);
    setModalType('category');
    setCategoryForm(category || {
      name: '',
      description: '',
      order: categories.length,
      imageUrl: '',
      active: true
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setSectionForm({
      name: '',
      description: '',
      category: '',
      featured: false,
      tags: ''
    });
    setImageForm({
      title: '',
      description: '',
      tags: '',
      featured: false,
      file: null
    });
    setCategoryForm({
      name: '',
      description: '',
      order: 0,
      imageUrl: '',
      active: true
    });
  };

  // Save handlers
  const saveSection = async () => {
    try {
      setLoading(true);
      
      if (editingItem) {
        await galleryAPI.updateSection(editingItem.id, sectionForm);
        toast.success('Section updated successfully');
      } else {
        await galleryAPI.createSection(sectionForm);
        toast.success('Section created successfully');
      }
      
      await loadGalleryData();
      closeModal();
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('Failed to save section');
    } finally {
      setLoading(false);
    }
  };

  const saveImage = async () => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('title', imageForm.title);
      formData.append('description', imageForm.description);
      formData.append('tags', imageForm.tags);
      formData.append('featured', imageForm.featured);
      formData.append('sectionId', selectedSection);
      
      if (imageForm.file) {
        formData.append('image', imageForm.file);
      }
      
      if (editingItem) {
        await galleryAPI.updateImage(editingItem.id, formData);
        toast.success('Image updated successfully');
      } else {
        await galleryAPI.uploadImage(formData);
        toast.success('Image uploaded successfully');
      }
      
      await loadGalleryData();
      closeModal();
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Failed to save image');
    } finally {
      setLoading(false);
    }
  };

  const saveWebsiteConfig = async () => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      Object.keys(websiteConfigForm).forEach(key => {
        if (key === 'heroImage' && websiteConfigForm[key] instanceof File) {
          formData.append('heroImage', websiteConfigForm[key]);
        } else {
          formData.append(key, websiteConfigForm[key]);
        }
      });
      
      await galleryAPI.updateConfiguration(formData);
      toast.success('Configuration updated successfully');
      
      if (modalType === 'config') {
        closeModal();
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveConfigChanges = async () => {
    try {
      setLoading(true);
      await galleryAPI.updateConfiguration(websiteConfigForm);
      toast.success('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveCategory = async () => {
    try {
      setLoading(true);
      
      if (editingCategory) {
        // Update existing category
        await api.put(`/categories/${editingCategory.id}`, categoryForm);
        toast.success('Category updated successfully');
      } else {
        // Create new category
        await api.post('/categories', categoryForm);
        toast.success('Category created successfully');
      }
      
      // Reload categories data
      const categoriesResponse = await api.get('/categories');
      setCategories(categoriesResponse.data || []);
      
      closeModal();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  // Delete handlers
  const deleteSection = async (sectionId) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await galleryAPI.deleteSection(sectionId);
        toast.success('Section deleted successfully');
        await loadGalleryData();
      } catch (error) {
        console.error('Error deleting section:', error);
        toast.error('Failed to delete section');
      }
    }
  };

  const deleteImage = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await galleryAPI.deleteImage(imageId);
        toast.success('Image deleted successfully');
        await loadGalleryData();
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error('Failed to delete image');
      }
    }
  };

  const deleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${categoryId}`);
        toast.success('Category deleted successfully');
        
        // Reload categories data
        const categoriesResponse = await api.get('/categories');
        setCategories(categoriesResponse.data || []);
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  // Handle drag end for section reordering
  const handleSectionReorder = async (result) => {
    if (!result.destination) return; // Dropped outside the list

    // Get the current sections array and reorder it
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order property of each item
    const updatedSections = items.map((item, index) => ({
      ...item,
      order: index
    }));

    // Update local state immediately for UI responsiveness
    setSections(updatedSections);

    // Save the new order to the backend
    try {
      // Show a loading toast
      const toastId = toast.loading('Updating section order...');
      
      // Save each section with its new order
      for (const section of updatedSections) {
        const sectionId = section.id || section._id;
        const orderData = { 
          order: section.order,
          id: sectionId
        };
        
        // Call the API to update the order
        await galleryAPI.updateSectionOrder(sectionId, orderData);
      }
      
      // Update the toast to show success
      toast.update(toastId, { 
        render: 'Section order updated successfully',
        type: 'success',
        isLoading: false,
        autoClose: 2000
      });
      
    } catch (error) {
      console.error('Error updating section order:', error);
      toast.error('Failed to update section order');
      
      // Reload original data on failure
      loadGalleryData();
    }
  };

  // Helper functions
  const getGalleryStats = () => {
    const totalImages = sections.reduce((total, section) => total + (section.images?.length || 0), 0);
    const totalSections = sections.length;
    const featuredImages = sections.reduce((total, section) => 
      total + (section.images?.filter(img => img.featured)?.length || 0), 0);
    
    return { totalImages, totalSections, featuredImages };
  };

  // Get filtered sections for legacy code parts
  const filteredSectionsList = sections.filter(section => {
    const matchesSearch = section.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || section.category === filterBy;
    return matchesSearch && matchesFilter;
  });

  const getAllImages = () => {
    return sections.reduce((allImages, section) => {
      const sectionImages = (section.images || []).map(image => ({
        ...image,
        sectionName: section.name,
        sectionId: section.id
      }));
      return [...allImages, ...sectionImages];
    }, []);
  };

  // Derived/Computed values
  const filteredSections = useMemo(() => {
    return sections.filter(section => {
      const matchesSearch = section.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (section.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBy === 'all' || section.category === filterBy;
      return matchesSearch && matchesFilter;
    });
  }, [sections, searchTerm, filterBy]);
  
  const filteredImages = useMemo(() => {
    return images.filter(image => {
      const matchesSearch = (image.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (image.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = selectedSection === 'all' || image.sectionId === selectedSection;
      return matchesSearch && matchesFilter;
    });
  }, [images, searchTerm, selectedSection]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 md:p-6 shadow-md">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <MdPhotoLibrary className="hidden sm:inline" /> Gallery Management
            </h1>
            <p className="text-white/80 mt-1">Professional Gallery Administration Dashboard</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => setPreviewActive(!previewActive)}
              className="bg-white text-primary hover:bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm flex-1 sm:flex-none justify-center"
            >
              <FaEye className="w-4 h-4" />
              <span>{previewActive ? 'Hide Live Preview' : 'Show Live Preview'}</span>
            </button>
            
            <button
              onClick={() => window.open('/gallery', '_blank')}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm flex-1 sm:flex-none justify-center"
            >
              <FaShareAlt className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open Gallery</span>
              <span className="inline sm:hidden">View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area with Sidebar Layout */}
      <div className="flex flex-col md:flex-row container mx-auto px-4 py-6">
        {/* Sidebar Navigation */}
        <div className="md:w-64 lg:w-72 flex-shrink-0 mb-6 md:mb-0 md:mr-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Gallery Management</h2>
            </div>
            
            <nav className="py-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: MdDashboard },
                { id: 'sections', label: 'Sections', icon: FaLayerGroup },
                { id: 'categories', label: 'Categories', icon: MdCategory },
                { id: 'images', label: 'Image Library', icon: FaImage },
                { id: 'products', label: 'Products', icon: FaColumns },
                { id: 'design', label: 'Gallery Design', icon: FaPalette },
                { id: 'preview', label: 'Live Preview', icon: FaEye },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-light/20 text-primary border-r-4 border-primary'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary' : 'text-gray-500'}`} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'config'
                    ? 'bg-primary-light/20 text-primary border-l-4 border-primary'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaCog className={`w-5 h-5 ${activeTab === 'config' ? 'text-primary' : 'text-gray-500'}`} />
                <span className="font-medium">Configuration</span>
              </button>
            </div>
          </div>
          
          {!loading && (
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xl font-bold text-primary">{sections.length}</div>
                  <div className="text-xs text-gray-600">Sections</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xl font-bold text-primary">{images.length}</div>
                  <div className="text-xs text-gray-600">Images</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xl font-bold text-primary">{categories.length}</div>
                  <div className="text-xs text-gray-600">Categories</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xl font-bold text-primary">{products.length}</div>
                  <div className="text-xs text-gray-600">Products</div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Main content area */}
        <div className="flex-grow">
          {/* Content will be added based on activeTab */}
          
          {/* Loading indicator */}
          {loading && (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="relative h-16 w-16 mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-[3px] border-primary/20 border-t-primary absolute"></div>
              </div>
              <p className="text-gray-600">Loading gallery data...</p>
            </div>
          )}
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && !loading && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Gallery Dashboard</h2>
              <p className="text-gray-600 mb-6">Manage your gallery content and monitor performance</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-blue-800 font-medium">Total Sections</h3>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FaLayerGroup className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold mt-2">{sections.length}</p>
                  <div className="text-xs text-blue-700 mt-2 flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                    Synced with Gallery Page
                  </div>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-green-800 font-medium">Total Images</h3>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FaImage className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold mt-2">{images.length}</p>
                  <div className="text-xs text-green-700 mt-2 flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                    {images.length > 0 ? 'All images loaded' : 'No images yet'}
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-amber-800 font-medium">Featured Items</h3>
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <FaStar className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold mt-2">
                    {sections.filter(s => s.featured).length + images.filter(i => i.featured).length}
                  </p>
                  <div className="text-xs text-amber-700 mt-2 flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1"></span>
                    {sections.filter(s => s.featured).length} featured sections
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-purple-800 font-medium">Gallery Views</h3>
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FaEye className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold mt-2">{analytics.totalVisitors}</p>
                  <div className="text-xs text-purple-700 mt-2 flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-1"></span>
                    Last 30 days
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <h3 className="font-medium">Quick Actions</h3>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => {
                        setEditingItem(null);
                        setModalType('section');
                        setIsModalOpen(true);
                        setSectionForm({
                          name: '',
                          description: '',
                          category: categories.length > 0 ? categories[0]._id : '',
                          featured: false,
                          tags: '',
                          order: sections.length
                        });
                      }}
                      className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-primary-light/10 transition-colors"
                    >
                      <div className="bg-primary-light p-3 rounded-full mb-2">
                        <FaPlus className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-gray-800 font-medium">New Section</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setEditingItem(null);
                        setModalType('image');
                        setIsModalOpen(true);
                        setImageForm({
                          title: '',
                          description: '',
                          tags: '',
                          featured: false,
                          category: '',
                          file: null
                        });
                      }}
                      className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-primary-light/10 transition-colors"
                    >
                      <div className="bg-primary-light p-3 rounded-full mb-2">
                        <FaUpload className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-gray-800 font-medium">Upload Images</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setActiveTab('config');
                        openConfigModal();
                      }}
                      className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-primary-light/10 transition-colors"
                    >
                      <div className="bg-primary-light p-3 rounded-full mb-2">
                        <FaPalette className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-gray-800 font-medium">Gallery Design</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        window.open('/gallery', '_blank');
                      }}
                      className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-primary-light/10 transition-colors"
                    >
                      <div className="bg-primary-light p-3 rounded-full mb-2">
                        <FaEye className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-gray-800 font-medium">View Live Site</span>
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-medium">Latest Activity</h3>
                    <span className="text-xs text-gray-500">Last 7 days</span>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {sections.slice(0, 3).map((section, index) => (
                        <div key={section.id || index} className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FaFolder className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{section.name}</h4>
                            <p className="text-xs text-gray-600">Section created</p>
                          </div>
                          <div className="ml-auto text-xs text-gray-500">
                            {new Date().toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                      {images.slice(0, 2).map((image, index) => (
                        <div key={image.id || index} className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <FaImage className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{image.title || 'Untitled image'}</h4>
                            <p className="text-xs text-gray-600">Image uploaded</p>
                          </div>
                          <div className="ml-auto text-xs text-gray-500">
                            {new Date().toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
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

              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search sections..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-primary focus:border-primary"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category._id || category.id} value={category.name || category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>

              {/* Section ordering instructions */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm">
                <FaInfoCircle className="text-blue-500 w-5 h-5" />
                <p className="text-blue-700">
                  Drag and drop sections to change their order. Changes are automatically saved and reflected on the gallery page.
                </p>
              </div>
              
              {/* Sections Grid with Drag & Drop */}
              <DragDropContext onDragEnd={handleSectionReorder}>
                <Droppable droppableId="sections">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {filteredSections.map((section, index) => (
                        <Draggable key={section.id || section._id} draggableId={section.id || section._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-white rounded-lg shadow-sm border ${snapshot.isDragging ? 'border-primary shadow-lg' : 'border-gray-200'} overflow-hidden hover:shadow-md transition-shadow`}
                            >
                              <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-2">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100"
                                    >
                                      <FaGripVertical className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <h3 className="font-semibold text-lg">{section.name}</h3>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => {
                                        setSelectedSection(section.id || section._id);
                                        setActiveTab('images');
                                      }}
                                      className="text-gray-500 hover:text-gray-700 p-1"
                                      title="View section images"
                                    >
                                      <FaImage className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => openSectionModal(section)}
                                      className="text-blue-500 hover:text-blue-700 p-1"
                                      title="Edit section"
                                    >
                                      <FaEdit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => deleteSection(section.id || section._id)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                      title="Delete section"
                                    >
                                      <FaTrash className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                
                                {section.description && (
                                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{section.description}</p>
                                )}
                                
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <span className="bg-gray-100 text-gray-700 text-xs py-1 px-2 rounded">
                                    {section.category}
                                  </span>
                                  {section.tags && typeof section.tags === 'string' && section.tags.split(',').map((tag, i) => (
                                    <span key={i} className="bg-blue-50 text-blue-700 text-xs py-1 px-2 rounded">
                                      {tag.trim()}
                                    </span>
                                  ))}
                                </div>
                                
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                  <span>{section.images?.length || 0} images</span>
                                  {section.featured && (
                                    <span className="flex items-center gap-1 text-yellow-500">
                                      <FaStar className="w-3 h-3" />
                                      Featured
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Preview of section images */}
                              {section.images && section.images.length > 0 && (
                                <div className="border-t border-gray-200 p-2 flex gap-1 overflow-x-auto">
                                  {section.images.slice(0, 3).map((image, i) => (
                                    <div key={i} className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                                      <img 
                                        src={image.src || image.url} 
                                        alt={image.alt || image.title || "Gallery image"} 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                  {section.images.length > 3 && (
                                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                                      +{section.images.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
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
                  <button
                    onClick={() => openImageModal()}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <FaPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Image</span>
                  </button>
                </div>
              </div>

              {/* Images Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(getAllImages() || []).map((image, index) => (
                  <div key={image.id || index} className="relative group">
                    <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={image.src || image.url || image.originalUrl}
                        alt={image.alt || image.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                          <button
                            onClick={() => openImageModal(image)}
                            className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteImage(image.id)}
                            className="bg-white text-red-600 p-2 rounded-full hover:bg-gray-100"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg border-b pb-2">Display Settings</h3>
                    
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
                      <div className="gallery-preview">
                        <div className="preview-header mb-6 text-center">
                          <h2 className="text-2xl font-bold">{websiteConfigForm.title}</h2>
                          <p className="text-gray-600">{websiteConfigForm.subtitle}</p>
                        </div>
                        
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
                      <FaFolder className="hidden sm:inline-block w-4 h-4" />
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
                  {modalType === 'category' && (
                    <>
                      <FaTags className="hidden sm:inline-block w-4 h-4" />
                      {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </>
                  )}
                </h3>
                <button
                  onClick={closeModal}
                  className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                {/* Section Form */}
                {modalType === 'section' && (
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
                )}

                {/* Image Form */}
                {modalType === 'image' && (
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
