import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Get current admin page from location
  const getCurrentPage = () => {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 2 && parts[0] === 'admin') {
      return parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    }
    return 'Dashboard';
  };

  // Close sidebar on location changes (on mobile)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Mobile header with toggle button */}
      <div className="lg:hidden bg-white border-b border-gray-200 fixed top-0 inset-x-0 z-10 h-16 flex items-center px-4">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <h1 className="ml-4 text-lg font-medium">Admin - {getCurrentPage()}</h1>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-16 lg:pt-0">
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 max-w-full overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
