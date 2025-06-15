import React, { useState, useEffect, useCallback, useRef } from 'react';
import { inquiryAPI } from '../../services/api';
import authService from '../../services/authService';
import { 
  EnvelopeIcon, 
  EnvelopeOpenIcon, 
  CheckCircleIcon, 
  ArchiveBoxIcon, 
  TrashIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhoneIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Helper function to categorize inquiries based on content
  const categorizeInquiry = (inquiry) => {
    console.log(`🔍 Categorizing inquiry ${inquiry._id}:`, {
      hasCategory: !!inquiry.category,
      categoryValue: inquiry.category,
      categoryType: typeof inquiry.category,
      name: inquiry.name,
      email: inquiry.email,
      message: inquiry.message?.substring(0, 50) + '...'
    });
    
    // PRIORITY 1: Always use the category field from the contact form if it exists
    if (inquiry.category && inquiry.category.trim() !== '' && inquiry.category !== 'undefined' && inquiry.category !== 'null') {
      console.log(`✅ Using form category for inquiry ${inquiry._id}: "${inquiry.category}"`);
      return inquiry.category.trim();
    }
    
    // PRIORITY 2: Fallback to keyword-based categorization for old inquiries
    console.log(`⚠️ No valid category field for inquiry ${inquiry._id}, using keyword analysis on: "${inquiry.message}"`);
    const message = (inquiry.message || '').toLowerCase();
    const name = (inquiry.name || '').toLowerCase();
    const email = (inquiry.email || '').toLowerCase();
    const allText = `${message} ${name} ${email}`.toLowerCase();
    
    let detectedCategory = 'general'; // default
    
    // More comprehensive keyword detection
    if (allText.includes('furniture') || allText.includes('product') || allText.includes('steel') || 
        allText.includes('chair') || allText.includes('table') || allText.includes('cabinet') ||
        allText.includes('bed') || allText.includes('wardrobe') || allText.includes('sofa') ||
        message.includes('what do you make') || message.includes('what products') || 
        message.includes('catalog') || message.includes('brochure')) {
      detectedCategory = 'product';
    } else if (allText.includes('service') || allText.includes('custom') || allText.includes('order') || 
               allText.includes('design') || allText.includes('manufacture') || allText.includes('make') ||
               allText.includes('fabricate') || allText.includes('customize') || allText.includes('tailor') ||
               message.includes('can you make') || message.includes('need made') || message.includes('custom made')) {
      detectedCategory = 'service';
    } else if (allText.includes('price') || allText.includes('quote') || allText.includes('delivery') || 
               allText.includes('cost') || allText.includes('rate') || allText.includes('how much') ||
               allText.includes('expense') || allText.includes('payment') || allText.includes('bill') ||
               message.includes('what is the price') || message.includes('pricing') || message.includes('charges')) {
      detectedCategory = 'support';
    } else if (allText.includes('business') || allText.includes('dealer') || allText.includes('wholesale') || 
               allText.includes('partnership') || allText.includes('distributor') || allText.includes('reseller') ||
               allText.includes('franchise') || allText.includes('bulk') || allText.includes('commercial') ||
               message.includes('business opportunity') || message.includes('become dealer') || 
               message.includes('bulk order') || message.includes('wholesale')) {
      detectedCategory = 'business';
    }
    
    console.log(`🏷️ Auto-detected category for inquiry ${inquiry._id}: "${detectedCategory}" (from text analysis)`);
    console.log(`📝 Analysis text: "${allText.substring(0, 100)}..."`);
    return detectedCategory;
  };

  // Helper function to get display label for category
  const getCategoryDisplayLabel = (category) => {
    const categoryLabels = {
      'product': 'Product Information',
      'service': 'Custom Order',
      'support': 'Price Quote / Delivery',
      'business': 'Business/Dealership',
      'general': 'General Inquiry'
    };
    return categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Helper function to copy text to clipboard
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotificationMessage(`${type} copied to clipboard`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setNotificationMessage(`${type} copied to clipboard`);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
      } catch (fallbackErr) {
        setNotificationMessage('Failed to copy to clipboard');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
      }
      document.body.removeChild(textArea);
    }
  };

  // Check if user is admin on component mount
  useEffect(() => {
    const adminStatus = authService.isAdmin();
    setIsAdmin(adminStatus);
    
    if (!adminStatus) {
      setError('You need administrator privileges to access this page. Please log in as an admin.');
      setLoading(false);
    }
  }, []);

  // Load inquiries on component mount and when filter/page/search changes
  const loadInquiries = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading inquiries, page:', currentPage, 'filter:', statusFilter, 'search:', searchQuery);
      
      // Ensure we're logged in as admin
      const isUserAdmin = authService.isAdmin();
      
      if (!isUserAdmin) {
        // Try to login as admin (offline mode)
        console.log('Not logged in as admin, attempting login...');
        try {
          const loginResult = await authService.login('9814379071', 'M@nishsteel');
          if (!loginResult.success) {
            setError('Please log in as an admin to view inquiries.');
            setLoading(false);
            return;
          }
          console.log('Admin login successful');
        } catch (loginErr) {
          console.error('Login failed:', loginErr);
          setError('Authentication required. Please log in again.');
          setLoading(false);
          return;
        }
      }
      
      // Force API URL to be correct
      const token = authService.getToken();
      console.log('Current auth token:', token ? 'Valid token exists' : 'No token');
      
      // Make fresh API request
      console.log('Making API request for inquiries...');
      const response = await inquiryAPI.getAll(currentPage, 10, statusFilter || null, searchQuery || null);
      console.log('Inquiries API response:', response);
      
      // Set inquiries data
      if (response.data && response.data.inquiries) {
        console.log(`Found ${response.data.inquiries.length} inquiries`);
        console.log('📊 Sample inquiry structure:', response.data.inquiries[0]);
        
        // Debug: Check all inquiry categories
        response.data.inquiries.forEach((inquiry, index) => {
          if (index < 5) { // Only log first 5 to avoid spam
            console.log(`Inquiry ${index + 1}:`, {
              id: inquiry._id,
              name: inquiry.name,
              category: inquiry.category,
              message: inquiry.message?.substring(0, 30) + '...'
            });
          }
        });
        
        let filteredInquiries = response.data.inquiries;
        
        // Apply client-side category filtering
        if (categoryFilter) {
          console.log(`Filtering by category: ${categoryFilter}`);
          filteredInquiries = response.data.inquiries.filter(inquiry => {
            const inquiryCategory = categorizeInquiry(inquiry);
            console.log(`Inquiry ID ${inquiry._id}: category = ${inquiryCategory}, has category field: ${inquiry.category ? 'Yes' : 'No'}`);
            return inquiryCategory === categoryFilter;
          });
          console.log(`After filtering: ${filteredInquiries.length} inquiries match category ${categoryFilter}`);
        }
        
        setInquiries(filteredInquiries);
        setTotalPages(response.data.totalPages);
        
        // If no inquiries found with filter, show message
        if (filteredInquiries.length === 0 && (statusFilter || categoryFilter)) {
          const filterType = categoryFilter ? `${getCategoryDisplayLabel(categoryFilter)} category` : `${statusFilter} status`;
          setError(`No inquiries found with ${filterType}.`);
        } else if (filteredInquiries.length === 0) {
          setError('No inquiries found. Contact form submissions will appear here.');
        } else {
          setError('');
        }
      } else {
        console.warn('Unexpected response format:', response);
        setInquiries([]);
        setError('Unable to load inquiries. Response format unexpected.');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading inquiries:', err);
      
      if (err.message && err.message.includes('Authentication required')) {
        setError('Authentication required. Please log in again.');
      } else {
        setError('Failed to load inquiries. Please try refreshing the page.');
      }
      
      setInquiries([]);
      setLoading(false);
    }
  }, [currentPage, statusFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    console.log('AdminInquiries: Component mounted, loading inquiries...');
    
    // Ensure we're logged in as admin
    const adminStatus = authService.isAdmin();
    console.log('Current admin status:', adminStatus);
    
    // Check token
    const token = authService.getToken();
    console.log('Current auth token status:', token ? 'Token exists' : 'No token');
    
    // Force admin login on mount
    if (!token || !adminStatus) {
      console.log('No valid admin session, performing auto-login...');
      authService.login('9814379071', 'M@nishsteel')
        .then(result => {
          console.log('Auto-login result:', result);
          loadInquiries();
        })
        .catch(error => {
          console.error('Auto-login failed:', error);
          setError('Authentication failed. Please try logging in again.');
        });
    } else {
      // Regular load if already logged in
      loadInquiries();
    }
  }, [loadInquiries]);

  // Reload inquiries when filters change
  useEffect(() => {
    console.log('🔄 Filter changed, reloading inquiries...', {
      categoryFilter,
      statusFilter,
      searchQuery,
      currentPage
    });
    
    if (isAdmin) {
      loadInquiries();
    }
  }, [categoryFilter, statusFilter, searchQuery, currentPage, isAdmin, loadInquiries]);

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      await inquiryAPI.updateStatus(id, newStatus);
      
      // Show notification
      setNotificationMessage(`Inquiry status updated to ${newStatus}`);
      setShowNotification(true);
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      
      // Update local state
      setInquiries(prevInquiries => 
        prevInquiries.map(inquiry => 
          inquiry._id === id ? { ...inquiry, status: newStatus } : inquiry
        )
      );
      
      // If viewing the inquiry details, update it there too
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error updating inquiry status:', err);
      setError('Failed to update status. Please try again.');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      try {
        await inquiryAPI.delete(id);
        
        // Show notification
        setNotificationMessage('Inquiry deleted successfully');
        setShowNotification(true);
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
        
        // Update local state
        setInquiries(prevInquiries => 
          prevInquiries.filter(inquiry => inquiry._id !== id)
        );
        
        // If viewing the deleted inquiry, close the detail view
        if (selectedInquiry && selectedInquiry._id === id) {
          setSelectedInquiry(null);
        }
      } catch (err) {
        console.error('Error deleting inquiry:', err);
        setError('Failed to delete inquiry. Please try again.');
      }
    }
  };

  // View inquiry details
  const viewInquiry = async (id) => {
    try {
      // Ensure token is present in header first
      const token = authService.getToken();
      if (!token) {
        console.log('No auth token available, refreshing auth state');
        const refreshResult = await authService.refreshToken();
        if (!refreshResult.success) {
          setError('Session expired. Please try refreshing the page.');
          return;
        }
      }
      
      const response = await inquiryAPI.getById(id);
      setSelectedInquiry(response.data);
      
      // If the inquiry is new, mark it as read
      if (response.data.status === 'new') {
        handleStatusChange(id, 'read');
      }
    } catch (err) {
      console.error('Error fetching inquiry details:', err);
      
      // Handle authentication errors
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('Authentication failed. Please refresh the page and try again.');
        // Don't log out - just show an error message
      } else {
        setError('Failed to load inquiry details. Please try again.');
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge - using company colors with enhanced visuals
  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-0.5 bg-primary text-white rounded-full text-2xs font-semibold shadow-sm border border-primary-dark flex items-center"><span className="h-1.5 w-1.5 bg-white rounded-full mr-1 animate-pulse"></span>New</span>;
      case 'read':
        return <span className="px-2.5 py-0.5 bg-blue-400 text-white rounded-full text-2xs font-semibold shadow-sm border border-blue-500">Read</span>;
      case 'replied':
        return <span className="px-2.5 py-0.5 bg-accent text-white rounded-full text-2xs font-semibold shadow-sm border border-accent-dark">Replied</span>;
      case 'archived':
        return <span className="px-2.5 py-0.5 bg-gray-400 text-white rounded-full text-2xs font-semibold shadow-sm border border-gray-500">Archived</span>;
      default:
        return null;
    }
  };

  // Get status icon - using company colors
  const getStatusIcon = (status) => {
    switch (status) {
      case 'new':
        return <EnvelopeIcon className="h-4 w-4 text-primary drop-shadow-sm" />;
      case 'read':
        return <EnvelopeOpenIcon className="h-4 w-4 text-primary-dark drop-shadow-sm" />;
      case 'replied':
        return <CheckCircleIcon className="h-4 w-4 text-accent drop-shadow-sm" />;
      case 'archived':
        return <ArchiveBoxIcon className="h-4 w-4 text-text drop-shadow-sm" />;
      default:
        return <EnvelopeIcon className="h-4 w-4" />;
    }
  };

  // Render notification component - using company colors
  const Notification = ({ message }) => (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-primary-light border-l-4 border-primary text-text px-4 py-2 rounded shadow-md text-xs flex items-center">
        <CheckCircleIcon className="h-4 w-4 text-primary mr-2" />
        {message}
      </div>
    </div>
  );

  // Mobile view handler
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  
  // Touch gesture handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const minSwipeDistance = 50; // Minimum swipe distance in pixels
  
  // Swipe handlers for mobile navigation between inquiries
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    
    // If the swipe distance is significant enough
    if (Math.abs(distance) > minSwipeDistance) {
      // Find current inquiry index
      const currentIndex = inquiries.findIndex(i => i._id === selectedInquiry?._id);
      
      if (currentIndex !== -1) {
        // Swipe left - go to next inquiry (if available)
        if (distance > 0 && currentIndex < inquiries.length - 1) {
          selectAndShowInquiry(inquiries[currentIndex + 1]._id);
        }
        // Swipe right - go to previous inquiry (if available)
        else if (distance < 0 && currentIndex > 0) {
          selectAndShowInquiry(inquiries[currentIndex - 1]._id);
        }
      }
    }
  };
  
  // Function to go back to list view on mobile
  const backToList = () => {
    setShowMobileDetails(false);
  };

  // Select inquiry and show detail view on mobile
  const selectAndShowInquiry = (id) => {
    viewInquiry(id);
    // Only switch to detail view on mobile devices
    if (window.innerWidth < 1024) { // lg breakpoint in Tailwind
      setShowMobileDetails(true);
    }
  };

  // Pull-to-refresh functionality for mobile
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const pullThreshold = 80; // px needed to trigger refresh
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);
  
  const handlePullStart = (e) => {
    if (window.scrollY === 0) { // Only enable pull-to-refresh at the top of the page
      touchStartY.current = e.touches[0].clientY;
    }
  };
  
  const handlePullMove = (e) => {
    if (window.scrollY === 0 && !loading) {
      touchCurrentY.current = e.touches[0].clientY;
      const pullDistance = Math.max(0, touchCurrentY.current - touchStartY.current);
      
      if (pullDistance > 5) {
        // Prevent default scroll behavior when pulling
        e.preventDefault();
        setIsPulling(true);
        // Calculate progress (0-100)
        const progress = Math.min(100, (pullDistance / pullThreshold) * 100);
        setPullProgress(progress);
      }
    }
  };
  
  const handlePullEnd = () => {
    if (isPulling) {
      if (pullProgress >= 100) {
        // Trigger refresh
        loadInquiries();
      }
      // Reset pull state
      setIsPulling(false);
      setPullProgress(0);
    }
  };

  // Debounce search to avoid excessive API calls
  const debounceTimeout = useRef(null);
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear any pending debounce timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    // Set a new timeout to execute search after 500ms of user inactivity
    debounceTimeout.current = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      loadInquiries();
    }, 500);
  };

  // Clean up debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
      {showNotification && <Notification message={notificationMessage} />}

      <div className="flex items-center justify-between mb-3 sm:mb-5">
        <h1 className={`text-lg sm:text-xl font-bold text-primary ${showMobileDetails ? 'hidden sm:block' : ''}`}>
          Contact Inquiries
        </h1>
        {/* Mobile back button when viewing details */}
        {showMobileDetails && selectedInquiry && (
          <button
            onClick={backToList}
            className="lg:hidden inline-flex items-center justify-center px-2 py-1 rounded-md bg-primary-light text-primary border border-primary-light shadow-sm"
            aria-label="Back to list"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">Back</span>
          </button>
        )}
        
        {/* Mobile navigation indicators when viewing details */}
        {showMobileDetails && selectedInquiry && (
          <div className="lg:hidden flex items-center space-x-2 text-xs text-gray-500">
            <span>{
              inquiries.findIndex(i => i._id === selectedInquiry._id) + 1
            } of {inquiries.length}</span>
            <div className="flex space-x-1">
              <button 
                onClick={() => {
                  const currentIndex = inquiries.findIndex(i => i._id === selectedInquiry._id);
                  if (currentIndex > 0) {
                    selectAndShowInquiry(inquiries[currentIndex - 1]._id);
                  }
                }}
                disabled={inquiries.findIndex(i => i._id === selectedInquiry._id) === 0}
                className="p-1 rounded-full disabled:opacity-30"
                aria-label="Previous inquiry"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button 
                onClick={() => {
                  const currentIndex = inquiries.findIndex(i => i._id === selectedInquiry._id);
                  if (currentIndex < inquiries.length - 1) {
                    selectAndShowInquiry(inquiries[currentIndex + 1]._id);
                  }
                }}
                disabled={inquiries.findIndex(i => i._id === selectedInquiry._id) === inquiries.length - 1}
                className="p-1 rounded-full disabled:opacity-30"
                aria-label="Next inquiry"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-primary-light bg-opacity-20 border-l-2 border-primary text-text px-3 py-1.5 mb-3 text-xs sm:text-sm rounded-r" role="alert">
          {error}
        </div>
      )}
      
      {/* Mobile Filter Bar - Hide when viewing details */}
      <div className={`${showMobileDetails ? 'hidden lg:block' : 'block'} mb-3`}>
        {/* Search Bar - Always visible */}
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={(e) => e.key === 'Enter' && loadInquiries()}
            className="w-full border border-primary border-opacity-20 bg-white rounded-lg px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-30 shadow-sm pl-10 pr-10"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary text-opacity-70">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </span>
          {searchQuery && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-3 border border-primary border-opacity-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Status Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-primary-dark mb-1 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-slate-200 bg-slate-50 rounded-md px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            {/* Category Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-primary-dark mb-1 block">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-slate-200 bg-slate-50 rounded-md px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">All Categories</option>
                <option value="product">Product Information</option>
                <option value="service">Custom Order</option>
                <option value="support">Price Quote / Delivery</option>
                <option value="business">Business/Dealership</option>
                <option value="general">General Inquiry</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(statusFilter || categoryFilter || searchQuery) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {statusFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary-light bg-opacity-30 text-xs text-primary-dark border border-primary-light">
                  <span className="font-medium">Status:</span> <span className="ml-1">{statusFilter}</span>
                  <button
                    onClick={() => {
                      setStatusFilter('');
                      setCurrentPage(1);
                    }}
                    className="ml-1 hover:text-primary-dark bg-primary-light bg-opacity-50 rounded-full p-0.5"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
              {categoryFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-accent-light bg-opacity-20 text-xs text-accent-dark border border-accent-light border-opacity-40">
                  <span className="font-medium">Category:</span> <span className="ml-1">{getCategoryDisplayLabel(categoryFilter)}</span>
                  <button
                    onClick={() => {
                      setCategoryFilter('');
                      setCurrentPage(1);
                    }}
                    className="ml-1 hover:text-accent bg-accent-light bg-opacity-30 rounded-full p-0.5"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary-light bg-opacity-20 text-xs text-primary-dark border border-primary-light border-opacity-30">
                  <span className="font-medium">Search:</span> <span className="ml-1">{searchQuery}</span>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="ml-1 hover:text-primary-dark bg-primary-light bg-opacity-40 rounded-full p-0.5"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile/Desktop Conditional Layout */}
      <div 
        className={`${showMobileDetails ? 'lg:grid' : 'grid'} grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4`}
        onTouchStart={handlePullStart}
        onTouchMove={handlePullMove}
        onTouchEnd={handlePullEnd}
      >
        {/* Pull-to-refresh indicator (mobile only) */}
        {isPulling && !showMobileDetails && (
          <div className="fixed top-0 left-0 right-0 flex justify-center pointer-events-none z-50">
            <div className="bg-white rounded-full shadow p-1 mt-2">
              <div className={`animate-spin rounded-full h-4 w-4 border-2 border-t-primary border-r-primary border-b-gray-200 border-l-gray-200 ${pullProgress >= 100 ? 'opacity-100' : 'opacity-70'}`}></div>
            </div>
          </div>
        )}
        {/* Inquiries List - Hidden on mobile when details are shown */}
        <div className={`lg:col-span-1 ${showMobileDetails ? 'hidden lg:block' : ''}`}>
          <div className="bg-white rounded-md shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center p-4 sm:p-6">
                <div className="animate-spin rounded-full h-5 w-5 border border-gray-300 border-t-gray-600"></div>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="p-3 sm:p-4 text-center text-gray-500 text-xs sm:text-sm">
                {statusFilter ? (
                  <>
                    <p>No {statusFilter} inquiries found</p>
                    <button
                      onClick={() => setStatusFilter('')}
                      className="text-gray-600 mt-1 text-xs"
                    >
                      Show all
                    </button>
                  </>
                ) : (
                  <p>No inquiries found</p>
                )}
              </div>
            ) : (
              <div 
                className="p-2 max-h-[calc(100vh-180px)] sm:max-h-[600px] overflow-y-auto bg-slate-50 space-y-3"
                id="inquiry-list"
              >
                {inquiries.map((inquiry) => {
                  // Get inquiry category
                  const category = categorizeInquiry(inquiry);
                  
                  // Get status-based styling
                  const getStatusColor = () => {
                    switch(inquiry.status) {
                      case 'new': return 'border-l-primary bg-gradient-to-r from-primary-light to-white';
                      case 'read': return 'border-l-blue-400 bg-gradient-to-r from-blue-50 to-white';
                      case 'replied': return 'border-l-accent bg-gradient-to-r from-accent-light to-white';
                      case 'archived': return 'border-l-gray-300 bg-gray-50';
                      default: return 'border-l-gray-200';
                    }
                  };
                  
                  // Get category-based styling
                  const getCategoryColor = () => {
                    switch(category) {
                      case 'product': return 'bg-primary-light bg-opacity-70 text-primary-dark border border-primary-light';
                      case 'service': return 'bg-primary-light bg-opacity-40 text-primary-dark border border-primary-light border-opacity-70';
                      case 'support': return 'bg-accent-light bg-opacity-30 text-accent-dark border border-accent-light';
                      case 'business': return 'bg-accent-light bg-opacity-60 text-accent-dark border border-accent-light border-opacity-70';
                      default: return 'bg-primary-light bg-opacity-20 text-primary-dark border border-primary-light border-opacity-40';
                    }
                  };
                  
                  // Format date for better readability
                  const formattedDate = formatDate(inquiry.createdAt);
                  const isToday = formattedDate.includes('Today');
                  
                  return (
                    <div 
                      key={inquiry._id} 
                      className={`rounded-lg shadow-sm border ${getStatusColor()} hover:shadow-md active:shadow-inner transition-all duration-150 ${
                        selectedInquiry?._id === inquiry._id ? 'shadow-md ring-1 ring-primary ring-opacity-30 border-l-4' : 'border-l-4'
                      } touch-manipulation`}
                      onClick={() => selectAndShowInquiry(inquiry._id)}
                    >
                      <div className="p-3 sm:p-4">
                        {/* Header section */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`rounded-full p-1 ${
                              inquiry.status === 'new' ? 'bg-primary bg-opacity-10' : 
                              inquiry.status === 'read' ? 'bg-blue-100' : 
                              inquiry.status === 'replied' ? 'bg-accent bg-opacity-10' : 
                              'bg-gray-100'
                            }`}>
                              {getStatusIcon(inquiry.status)}
                            </div>
                            <h3 className={`font-medium text-sm truncate max-w-[130px] sm:max-w-full ${inquiry.status === 'new' ? 'font-semibold text-primary-dark' : 'text-gray-700'}`}>
                              {inquiry.name}
                            </h3>
                            {/* New indicator */}
                            {inquiry.status === 'new' && (
                              <span className="h-2.5 w-2.5 bg-primary rounded-full animate-pulse shadow-sm"></span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Quick read action for new inquiries */}
                            {inquiry.status === 'new' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(inquiry._id, 'read');
                                }}
                                className="p-1.5 rounded-full bg-primary-light bg-opacity-30 hover:bg-opacity-50 text-primary hover:shadow-sm transition-all"
                                title="Mark as read"
                              >
                                <EnvelopeOpenIcon className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {getStatusBadge(inquiry.status)}
                          </div>
                        </div>
                        
                        {/* Contact & Time info */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                          <div className="flex items-center">
                            <span className="inline-block w-4 text-gray-400">
                              <EnvelopeIcon className="h-3 w-3" />
                            </span>
                            <p className="truncate text-xs text-gray-600 ml-1">{inquiry.email}</p>
                          </div>
                          <p className={`text-2xs ${isToday ? 'text-primary-dark font-medium' : 'text-gray-500'} sm:ml-auto`}>
                            {formattedDate}
                          </p>
                        </div>
                        
                        {/* Category & Message Preview */}
                        <div className="mt-2.5 flex flex-col sm:flex-row sm:items-end justify-between">
                          <span className={`text-2xs px-2 py-0.5 rounded-full inline-block max-w-max shadow-sm ${getCategoryColor()}`}>
                            {getCategoryDisplayLabel(category)}
                          </span>
                          
                          {/* Message preview with better formatting */}
                          {inquiry.message && (
                            <div className="mt-2 sm:mt-0 sm:ml-2 sm:text-right flex-grow">
                              <p className="text-2xs text-gray-500 sm:max-w-[180px] truncate font-mono bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
                                {inquiry.message.length > 50 ? `${inquiry.message.substring(0, 50)}...` : inquiry.message}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Pagination */}
            <div className="flex justify-center items-center py-2 border-t border-slate-100">
              {totalPages > 1 ? (
                <div className="flex items-center">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-md hover:bg-primary-light hover:bg-opacity-30 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-primary"
                    aria-label="Previous page"
                  >
                    <ChevronLeftIcon className="h-4 w-4 text-primary" />
                  </button>
                  
                  {/* Simple page indicator */}
                  <span className="mx-2 text-xs text-gray-500">
                    {currentPage} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
                    aria-label="Next page"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-xs text-gray-400 py-1">
                  {inquiries.length > 0 ? `${inquiries.length} inquiries` : ''}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Inquiry Details */}
        <div className={`lg:col-span-2 ${showMobileDetails ? '' : 'hidden lg:block'}`}>
          {selectedInquiry ? (
            <div 
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 h-full flex flex-col"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Mobile header - minimalist */}
              <div className="lg:hidden flex items-center justify-between mb-3">
                <button 
                  onClick={backToList}
                  className="p-1.5 rounded-full bg-primary-light border border-primary-light shadow-sm"
                  aria-label="Back to list"
                >
                  <ArrowLeftIcon className="h-4 w-4 text-primary" />
                </button>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {inquiries.findIndex(i => i._id === selectedInquiry._id) + 1}/{inquiries.length}
                  </span>
                  
                  <div className="flex">
                    <button 
                      onClick={() => {
                        const currentIndex = inquiries.findIndex(i => i._id === selectedInquiry._id);
                        if (currentIndex > 0) {
                          selectAndShowInquiry(inquiries[currentIndex - 1]._id);
                        }
                      }}
                      disabled={inquiries.findIndex(i => i._id === selectedInquiry._id) === 0}
                      className="p-1 disabled:opacity-30"
                    >
                      <ChevronLeftIcon className="h-4 w-4 text-gray-500" />
                    </button>
                    <button 
                      onClick={() => {
                        const currentIndex = inquiries.findIndex(i => i._id === selectedInquiry._id);
                        if (currentIndex < inquiries.length - 1) {
                          selectAndShowInquiry(inquiries[currentIndex + 1]._id);
                        }
                      }}
                      disabled={inquiries.findIndex(i => i._id === selectedInquiry._id) === inquiries.length - 1}
                      className="p-1 disabled:opacity-30"
                    >
                      <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Contact details - using company colors */}
              <div className="mb-3 bg-white border border-primary-light rounded-md p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2 border-b border-primary-light pb-1.5">
                  <h2 className="text-base font-semibold text-primary-dark">{selectedInquiry.name}</h2>
                  {getStatusBadge(selectedInquiry.status)}
                </div>
                
                <div className="flex flex-wrap gap-y-1.5 gap-x-4 text-xs text-text">
                  <div className="flex items-center group">
                    <a href={`mailto:${selectedInquiry.email}`} className="hover:text-primary flex items-center">
                      <EnvelopeIcon className="h-3 w-3 mr-1 text-primary-dark" />
                      {selectedInquiry.email}
                    </a>
                    <button
                      onClick={() => copyToClipboard(selectedInquiry.email, 'Email')}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-primary-light rounded"
                      title="Copy email"
                    >
                      <ClipboardDocumentIcon className="h-3 w-3 text-primary" />
                    </button>
                  </div>
                  
                  {selectedInquiry.phone && (
                    <div className="flex items-center group">
                      <a href={`tel:${selectedInquiry.phone}`} className="hover:text-primary flex items-center">
                        <PhoneIcon className="h-3 w-3 mr-1 text-primary-dark" />
                        {selectedInquiry.phone}
                      </a>
                      <button
                        onClick={() => copyToClipboard(selectedInquiry.phone, 'Phone')}
                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-primary-light rounded"
                        title="Copy phone"
                      >
                        <ClipboardDocumentIcon className="h-3 w-3 text-primary" />
                      </button>
                    </div>
                  )}
                  
                  <span className="flex items-center">
                    <span className="h-1 w-1 rounded-full bg-accent mr-1.5"></span>
                    {formatDate(selectedInquiry.createdAt).split(',')[0]}
                  </span>
                  
                  {/* Category badge */}
                  <span className="flex items-center bg-primary-light bg-opacity-30 px-2 py-0.5 rounded-full text-xs text-primary-dark border border-primary-light border-opacity-40">
                    {getCategoryDisplayLabel(categorizeInquiry(selectedInquiry))}
                  </span>
                </div>
              </div>
              
              {/* Message content - using company colors */}
              <div className="bg-primary-light bg-opacity-30 border border-primary-light p-3 rounded-md mb-3 flex-grow overflow-y-auto">
                <h3 className="text-xs font-medium text-primary-dark mb-1.5 border-b border-primary-light border-opacity-50 pb-1">Message</h3>
                <p className="text-sm text-text whitespace-pre-wrap pt-1">
                  {selectedInquiry.message || <span className="italic text-gray-400">No message content</span>}
                </p>
              </div>
              
              {/* Action buttons - using company colors */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {selectedInquiry.status !== 'read' && (
                  <button
                    onClick={() => handleStatusChange(selectedInquiry._id, 'read')}
                    className="flex items-center px-3 py-1.5 rounded bg-primary-light text-xs text-primary hover:bg-blue-100 border border-primary-light transition-colors"
                  >
                    <EnvelopeOpenIcon className="h-3.5 w-3.5 mr-1.5" />
                    <span>Read</span>
                  </button>
                )}
                
                {selectedInquiry.status !== 'replied' && (
                  <button
                    onClick={() => handleStatusChange(selectedInquiry._id, 'replied')}
                    className="flex items-center px-3 py-1.5 rounded bg-accent bg-opacity-10 text-xs text-text hover:bg-accent hover:bg-opacity-20 border border-accent border-opacity-20 transition-colors"
                  >
                    <CheckCircleIcon className="h-3.5 w-3.5 mr-1.5" />
                    <span>Replied</span>
                  </button>
                )}
                
                {selectedInquiry.status !== 'archived' && (
                  <button
                    onClick={() => handleStatusChange(selectedInquiry._id, 'archived')}
                    className="flex items-center px-3 py-1.5 rounded bg-gray-50 text-xs text-text hover:bg-gray-100 border border-gray-100 transition-colors"
                  >
                    <ArchiveBoxIcon className="h-3.5 w-3.5 mr-1.5" />
                    <span>Archive</span>
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(selectedInquiry._id)}
                  className="flex items-center px-3 py-1.5 rounded bg-gray-100 text-xs text-gray-700 hover:bg-gray-200 ml-auto border border-gray-200 transition-colors"
                >
                  <TrashIcon className="h-3.5 w-3.5 mr-1.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="bg-gray-100 rounded-full p-4 mb-3 sm:mb-4">
                <EnvelopeIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">No Inquiry Selected</h3>
              <p className="text-sm text-gray-500">Select an inquiry from the list to view details</p>
              
              {/* Show hint on mobile */}
              <p className="mt-4 text-xs text-gray-400 lg:hidden">
                Tap on an inquiry to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInquiries;