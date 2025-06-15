/**
 * Optimized products hook with instant loading and caching
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import cacheService from '../services/cacheService';

export const useOptimizedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  
  const location = useLocation();

  // Parse URL parameters
  const urlParams = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return {
      category: searchParams.get('category') || 'all',
      subcategory: searchParams.get('subcategory') || null
    };
  }, [location.search]);

  // Load products with caching
  const loadProducts = useCallback(async (category = 'all', subcategory = null, forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('useOptimizedProducts: Loading products for', { category, subcategory });
      
      const productsData = await cacheService.getProducts(category, subcategory, forceRefresh);
      setProducts(productsData);
      
      console.log('useOptimizedProducts: Loaded', productsData.length, 'products');
    } catch (err) {
      console.error('useOptimizedProducts: Error loading products:', err);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    // Make sure products is always an array, even if undefined
    let filtered = products ? [...products] : [];
    
    // Apply search filter
    if (searchTerm) {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        (product?.name && product.name.toLowerCase().includes(lowercaseSearchTerm)) ||
        (product?.description && product.description.toLowerCase().includes(lowercaseSearchTerm))
      );
    }
    
    // Apply sorting
    if (sortOption !== 'default') {
      if (sortOption === 'price-low-high') {
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.price) || 0;
          const priceB = parseFloat(b.price) || 0;
          return priceA - priceB;
        });
      } else if (sortOption === 'price-high-low') {
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.price) || 0;
          const priceB = parseFloat(b.price) || 0;
          return priceB - priceA;
        });
      } else if (sortOption === 'name-a-z') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortOption === 'name-z-a') {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
      } else if (sortOption === 'newest') {
        filtered.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
      }
    }
    
    return filtered;
  }, [products, searchTerm, sortOption]);

  // Initial load of products
  useEffect(() => {
    console.log('useOptimizedProducts: Initial load');
    loadProducts('all', null);
  }, [loadProducts]);

  // Handle URL parameter changes
  useEffect(() => {
    const { category, subcategory } = urlParams;
    
    console.log('useOptimizedProducts: URL params changed', { category, subcategory });
    
    // Only update if different from current state
    if (category !== selectedCategory || subcategory !== selectedSubcategory) {
      setSelectedCategory(category);
      setSelectedSubcategory(subcategory);
      loadProducts(category, subcategory);
    }
  }, [urlParams, selectedCategory, selectedSubcategory, loadProducts]);

  // Handle category filter events from other components
  useEffect(() => {
    const handleCategoryEvent = (event) => {
      const { category, subcategory } = event.detail;
      console.log('useOptimizedProducts: Received category event', { category, subcategory });
      
      if (category && (category !== selectedCategory || subcategory !== selectedSubcategory)) {
        setSelectedCategory(category);
        setSelectedSubcategory(subcategory);
        loadProducts(category, subcategory);
      }
    };

    // Register event listeners for both events
    window.addEventListener('categoryFilter', handleCategoryEvent);
    window.addEventListener('categoryNavigation', handleCategoryEvent);
    
    return () => {
      window.removeEventListener('categoryFilter', handleCategoryEvent);
      window.removeEventListener('categoryNavigation', handleCategoryEvent);
    };
  }, [selectedCategory, selectedSubcategory, loadProducts]);

  // Update search term
  const updateSearchTerm = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Update sort option
  const updateSortOption = useCallback((option) => {
    setSortOption(option);
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSortOption('default');
    setSelectedCategory('all');
    setSelectedSubcategory(null);
    loadProducts('all', null);
  }, [loadProducts]);

  // Refresh products
  const refreshProducts = useCallback(() => {
    loadProducts(selectedCategory, selectedSubcategory, true);
  }, [selectedCategory, selectedSubcategory, loadProducts]);

  return {
    products: filteredAndSortedProducts || [], // Ensure we always return an array
    filteredAndSortedProducts: filteredAndSortedProducts || [], // Double-ensure for backward compatibility
    rawProducts: products || [],
    loading,
    error,
    searchTerm,
    sortOption,
    selectedCategory,
    selectedSubcategory,
    setSearchTerm: updateSearchTerm, // For compatibility
    setSortOption: updateSortOption, // For compatibility 
    updateSearchTerm,
    updateSortOption,
    resetFilters,
    refreshProducts,
    loadProducts,
    // Expose the actual setState functions for direct use
    setSelectedCategory,
    setSelectedSubcategory
  };
};
