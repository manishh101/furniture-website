import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI, subcategoryAPI, inquiryAPI } from '../../services/api';
import { 
  Squares2X2Icon, 
  ClipboardDocumentListIcon,
  PhotoIcon,
  PhoneIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
      <div className="flex items-center">
        <div className={`p-2 sm:p-3 rounded-full ${color} text-white mr-3 sm:mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
          <h3 className="text-xl sm:text-2xl font-bold">{value}</h3>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalSubcategories: 0,
    totalInquiries: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      console.log('Loading dashboard stats...');
      
      // Fetch all data in parallel for better performance
      const [productsResponse, categoriesResponse, subcategoriesResponse, inquiriesResponse] = await Promise.all([
        productAPI.getAll(1, 1000), // Get all products with high limit
        categoryAPI.getAll(),
        subcategoryAPI.getAll(),
        inquiryAPI.getAll(1, 1) // We only need the total count, not the actual inquiries
      ]);
      
      console.log('API Responses received:', {
        products: productsResponse,
        categories: categoriesResponse,
        subcategories: subcategoriesResponse,
        inquiries: inquiriesResponse
      });
      
      // Handle different response structures
      const productsData = productsResponse.data;
      const categories = categoriesResponse.data; // Categories API returns direct array
      const subcategories = subcategoriesResponse.data; // Subcategories API returns direct array
      const inquiriesData = inquiriesResponse.data;
      
      // Use totalProducts from API response for accurate database count
      const totalProducts = productsData.totalProducts || 0;
      const totalCategories = Array.isArray(categories) ? categories.length : 0;
      const totalSubcategories = Array.isArray(subcategories) ? subcategories.length : 0;
      const totalInquiries = inquiriesData.totalInquiries || 0;
      
      console.log('Dashboard data loaded:', {
        products: totalProducts,
        categories: totalCategories, 
        subcategories: totalSubcategories,
        apiResponse: {
          productsTotal: productsData.totalProducts,
          usingTotalProducts: true
        }
      });
      
      setStats({
        totalProducts: totalProducts,
        totalCategories: totalCategories,
        totalSubcategories: totalSubcategories,
        totalInquiries: totalInquiries
      });
      
      setLastUpdated(new Date());
      
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // More specific error messages
      let errorMessage = 'Failed to load dashboard stats. ';
      if (error.response?.status === 401) {
        errorMessage += 'Authentication failed. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage += 'Access denied. Admin privileges required.';
      } else if (error.response?.status >= 500) {
        errorMessage += 'Server error. Please try again later.';
      } else if (!navigator.onLine) {
        errorMessage += 'No internet connection. Please check your network.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      setError(errorMessage);
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Add a small delay to ensure API is initialized
    const initializeDashboard = async () => {
      try {
        // Wait for authService to initialize API URL
        await new Promise(resolve => setTimeout(resolve, 500));
        loadStats();
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        setError('Failed to initialize dashboard. Please refresh the page.');
        setLoading(false);
      }
    };
    
    initializeDashboard();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadStats(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>
        ) : (
          <div>
            {/* Main Content */}
            <div className="flex-grow">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-8">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary mb-2">Dashboard</h1>
                    <p className="text-gray-600 text-sm sm:text-base">Welcome to the Manish Steel Furniture admin panel.</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <button 
                      onClick={() => loadStats(true)}
                      disabled={refreshing}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                      <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                      <span className="text-sm">Refresh</span>
                    </button>
                    {lastUpdated && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
                <StatCard 
                  title="Total Products" 
                  value={stats.totalProducts} 
                  icon={<Squares2X2Icon className="h-5 w-5 sm:h-6 sm:w-6" />} 
                  color="bg-blue-500" 
                />
                <StatCard 
                  title="Categories" 
                  value={stats.totalCategories} 
                  icon={<ClipboardDocumentListIcon className="h-5 w-5 sm:h-6 sm:w-6" />} 
                  color="bg-green-500" 
                />
                <StatCard 
                  title="Subcategories" 
                  value={stats.totalSubcategories} 
                  icon={<ArrowTrendingUpIcon className="h-5 w-5 sm:h-6 sm:w-6" />} 
                  color="bg-purple-500" 
                />
                <StatCard 
                  title="Inquiries" 
                  value={stats.totalInquiries} 
                  icon={<EnvelopeIcon className="h-5 w-5 sm:h-6 sm:w-6" />} 
                  color="bg-yellow-500" 
                />
              </div>
              
              {/* Quick Links */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-primary mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
                  <Link to="/admin/products" className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 sm:p-4 rounded-lg flex flex-col items-center text-center">
                    <Squares2X2Icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mb-2" />
                    <span className="font-medium text-sm sm:text-base">Manage Products</span>
                  </Link>
                  <Link to="/admin/categories" className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 sm:p-4 rounded-lg flex flex-col items-center text-center">
                    <ClipboardDocumentListIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mb-2" />
                    <span className="font-medium text-sm sm:text-base">Manage Categories</span>
                  </Link>
                  <Link to="/admin/gallery" className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 sm:p-4 rounded-lg flex flex-col items-center text-center">
                    <PhotoIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mb-2" />
                    <span className="font-medium text-sm sm:text-base">Manage Gallery</span>
                  </Link>
                  <Link to="/admin/contact" className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 sm:p-4 rounded-lg flex flex-col items-center text-center">
                    <PhoneIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 mb-2" />
                    <span className="font-medium text-sm sm:text-base">Contact Info</span>
                  </Link>
                  <Link to="/admin/inquiries" className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 sm:p-4 rounded-lg flex flex-col items-center text-center">
                    <EnvelopeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mb-2" />
                    <span className="font-medium text-sm sm:text-base">Inquiries</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
