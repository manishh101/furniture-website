import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Squares2X2Icon, 
  ClipboardDocumentListIcon,
  PhotoIcon,
  PhoneIcon,
  TagIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon,
  EnvelopeIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      name: 'Dashboard',
      icon: Squares2X2Icon
    },
    {
      path: '/admin/products',
      name: 'Products',
      icon: ClipboardDocumentListIcon
    },
    {
      path: '/admin/categories',
      name: 'Categories',
      icon: TagIcon
    },
    {
      path: '/admin/gallery',
      name: 'Gallery',
      icon: PhotoIcon
    },
    {
      path: '/admin/about',
      name: 'About Page',
      icon: ClipboardDocumentListIcon
    },
    {
      path: '/admin/inquiries',
      name: 'Inquiries',
      icon: EnvelopeIcon
    },
    {
      path: '/admin/custom-orders',
      name: 'Custom Orders',
      icon: ShoppingBagIcon
    },
    {
      path: '/admin/contact',
      name: 'Contact',
      icon: PhoneIcon
    },
    {
      path: '/admin/settings',
      name: 'Settings',
      icon: CogIcon
    }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-10"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <div className={`bg-gray-800 text-white fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 z-20 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
              onClick={() => setIsOpen(false)}
              aria-label="Close sidebar"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="space-y-2 flex-grow">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
