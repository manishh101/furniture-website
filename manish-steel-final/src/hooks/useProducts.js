/**
 * Custom hook for product data and operations
 */
import { useState, useEffect, useCallback } from 'react';
import { productAPI } from '../services/api';

/**
 * Hook for managing products
 * @param {Object} initialFilters - Initial filter parameters
 * @returns {Object} Product data and methods
 */
export const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0
  });

  // Fetch products with filters
  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = { ...filters, ...params };
      
      // Handle page parameter
      if (params.page) {
        queryParams.page = params.page;
      }
      
      const response = await productAPI.getAllProducts(queryParams);
      
      setProducts(response.data.products);
      setPagination({
        currentPage: Number(response.data.currentPage),
        totalPages: Number(response.data.totalPages),
        totalProducts: Number(response.data.totalProducts)
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch single product
  const fetchProductById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productAPI.getProductById(id);
      setProduct(response.data);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Load initial products when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    product,
    loading,
    error,
    filters,
    pagination,
    fetchProducts,
    fetchProductById,
    updateFilters
  };
};

export default useProducts;
