/**
 * Optimized category navigation hook with instant loading
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import cacheService from '../services/cacheService';

export const useCategoryNavigation = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load categories with caching
  const loadCategories = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const categoriesData = await cacheService.getCategories(forceRefresh);
      setCategories(categoriesData);
      
      console.log('useCategoryNavigation: Loaded', categoriesData.length, 'categories');
    } catch (err) {
      console.error('useCategoryNavigation: Error loading categories:', err);
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Navigate to products with instant preloading
  const navigateToCategory = useCallback(async (categoryId, subcategoryId = null) => {
    console.log('useCategoryNavigation: Navigating to category', { categoryId, subcategoryId });
    
    // Start preloading products immediately
    cacheService.getProducts(categoryId, subcategoryId).catch(err => 
      console.warn('Failed to preload products:', err.message)
    );
    
    // Build URL
    let url = '/products';
    const params = new URLSearchParams();
    
    if (categoryId && categoryId !== 'all') {
      params.set('category', categoryId);
      if (subcategoryId) {
        params.set('subcategory', subcategoryId);
      }
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    // Get current URL to check if we're just changing parameters on the same page
    const currentPath = window.location.pathname;
    const isOnProductsPage = currentPath === '/products';
    
    // Navigate with replace to avoid adding to history stack
    // Use replace: true only when we're already on the products page
    navigate(url, { 
      replace: isOnProductsPage
    });
    
    // Dispatch event for other components
    const event = new CustomEvent('categoryNavigation', {
      detail: {
        category: categoryId,
        subcategory: subcategoryId,
        source: 'categoryNavigation'
      }
    });
    window.dispatchEvent(event);
  }, [navigate]);

  // Get category by ID
  const getCategoryById = useCallback((categoryId) => {
    return categories.find(cat => cat.id === categoryId);
  }, [categories]);

  // Get subcategory by ID
  const getSubcategoryById = useCallback((categoryId, subcategoryId) => {
    const category = getCategoryById(categoryId);
    return category?.subcategories?.find(sub => sub.id === subcategoryId);
  }, [getCategoryById]);

  // Initialize categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    loadCategories,
    navigateToCategory,
    getCategoryById,
    getSubcategoryById
  };
};
