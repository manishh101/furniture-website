import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  PhotoIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const sidebarLinks = [
  { name: 'Dashboard', path: '/admin', icon: <HomeIcon className="w-5 h-5" /> },
  { name: 'Products', path: '/admin/products', icon: <Squares2X2Icon className="w-5 h-5" /> },
  { name: 'Categories', path: '/admin/categories', icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
  { name: 'Gallery', path: '/admin/gallery', icon: <PhotoIcon className="w-5 h-5" /> },
  { name: 'Contact Info', path: '/admin/contact', icon: <PhoneIcon className="w-5 h-5" /> },
  { name: 'Inquiries', path: '/admin/inquiries', icon: <EnvelopeIcon className="w-5 h-5" /> },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { logout } = useAuth();
  
  return (
    <aside 
      className={`bg-white shadow-md fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <Link to="/" className="text-xl font-bold text-primary">
            Manish Steel Admin
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-2">
            {sidebarLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 ${
                    location.pathname === link.path || 
                    (link.path !== '/admin' && location.pathname.startsWith(link.path)) 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : ''
                  }`}
                >
                  <span className="mr-3">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 