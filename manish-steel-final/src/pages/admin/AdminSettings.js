import React, { useState } from 'react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Shree Manish Steel Furniture Industry',
    siteDescription: 'Quality Steel Furniture for Every Space',
    logo: '/logo.png',
    primaryColor: '#0057A3',
    secondaryColor: '#F59E0B',
    currency: 'NPR',
    showPrices: true,
    enableCustomOrders: true,
    enableWishlist: true
  });
  
  const [saveStatus, setSaveStatus] = useState({ show: false, success: false, message: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Save settings to localStorage
      localStorage.setItem('siteSettings', JSON.stringify(settings));
      
      // Show success message
      setSaveStatus({
        show: true,
        success: true,
        message: 'Settings saved successfully!'
      });
      
      // Hide message after 3 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, show: false }));
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus({
        show: true,
        success: false,
        message: `Failed to save: ${error.message || 'Unknown error'}`
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">Site Settings</h2>
      
      {saveStatus.show && (
        <div className={`mb-4 p-3 rounded-md ${saveStatus.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {saveStatus.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input
              type="text"
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
            <input
              type="text"
              name="siteDescription"
              value={settings.siteDescription}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo Path</label>
            <input
              type="text"
              name="logo"
              value={settings.logo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              name="currency"
              value={settings.currency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="NPR">Nepalese Rupee (NPR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="INR">Indian Rupee (INR)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
            <div className="flex items-center">
              <input
                type="color"
                name="primaryColor"
                value={settings.primaryColor}
                onChange={handleChange}
                className="w-12 h-10 border border-gray-300 rounded-md mr-2"
              />
              <input
                type="text"
                name="primaryColor"
                value={settings.primaryColor}
                onChange={handleChange}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
            <div className="flex items-center">
              <input
                type="color"
                name="secondaryColor"
                value={settings.secondaryColor}
                onChange={handleChange}
                className="w-12 h-10 border border-gray-300 rounded-md mr-2"
              />
              <input
                type="text"
                name="secondaryColor"
                value={settings.secondaryColor}
                onChange={handleChange}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Feature Settings</h3>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showPrices"
              name="showPrices"
              checked={settings.showPrices}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="showPrices" className="ml-2 block text-sm text-gray-700">
              Show product prices
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableCustomOrders"
              name="enableCustomOrders"
              checked={settings.enableCustomOrders}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="enableCustomOrders" className="ml-2 block text-sm text-gray-700">
              Enable custom orders
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableWishlist"
              name="enableWishlist"
              checked={settings.enableWishlist}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="enableWishlist" className="ml-2 block text-sm text-gray-700">
              Enable wishlist feature
            </label>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
