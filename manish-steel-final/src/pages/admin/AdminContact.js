import React, { useState, useEffect } from 'react';
import { getContactInfo, saveContactInfo } from '../../utils/storage';
import { FaSave, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const AdminContact = () => {
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    email: '',
    businessHours: '',
    social: {
      whatsapp: '',
      facebook: '',
      instagram: '',
      tiktok: '',
      twitter: ''
    },
    mapUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ show: false, success: false, message: '' });

  // Load contact info on component mount
  useEffect(() => {
    try {
      console.log('Loading contact info...');
      const contactInfo = getContactInfo();
      console.log('Loaded contact info:', contactInfo);
      
      // Ensure we have proper structure
      const normalizedData = {
        address: contactInfo?.address || '',
        phone: contactInfo?.phone || '',
        email: contactInfo?.email || '',
        businessHours: contactInfo?.businessHours || '',
        social: {
          whatsapp: contactInfo?.social?.whatsapp || '',
          facebook: contactInfo?.social?.facebook || '',
          instagram: contactInfo?.social?.instagram || '',
          tiktok: contactInfo?.social?.tiktok || '',
          twitter: contactInfo?.social?.twitter || ''
        },
        mapUrl: contactInfo?.mapUrl || ''
      };
      
      setFormData(normalizedData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading contact info:', error);
      setSaveStatus({
        show: true,
        success: false,
        message: 'Failed to load contact information: ' + error.message
      });
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (social media links)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      // Handle top-level properties
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setSaveStatus({ show: false, success: false, message: '' });
      
      console.log('Saving contact info:', formData);
      
      // Validate required fields
      if (!formData.address.trim() || !formData.phone.trim() || !formData.email.trim()) {
        throw new Error('Address, phone, and email are required fields');
      }
      
      // Save to storage
      const result = saveContactInfo(formData);
      
      if (result === false) {
        throw new Error('Failed to save to local storage');
      }
      
      console.log('Contact info saved successfully');
      
      // Show success message
      setSaveStatus({
        show: true,
        success: true,
        message: 'Contact information updated successfully!'
      });
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, show: false }));
      }, 5000);
    } catch (error) {
      console.error('Error saving contact info:', error);
      setSaveStatus({
        show: true,
        success: false,
        message: `Failed to save: ${error.message || 'Unknown error'}`
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">Contact Information</h2>
        <div className="text-sm text-gray-500">
          Manage your business contact details
        </div>
      </div>
      
      {saveStatus.show && (
        <div className={`mb-4 p-4 rounded-md flex items-center gap-3 ${
          saveStatus.success 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {saveStatus.success ? (
            <FaCheckCircle className="h-5 w-5" />
          ) : (
            <FaExclamationTriangle className="h-5 w-5" />
          )}
          <span>{saveStatus.message}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Enter business address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Enter phone number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Enter email address"
            />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
            <textarea
              name="businessHours"
              value={formData.businessHours}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Enter business hours (e.g., Monday-Friday: 9AM-5PM)"
            ></textarea>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Social Media Links</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input
                  type="text"
                  name="social.whatsapp"
                  value={formData.social.whatsapp}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="WhatsApp link"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                <input
                  type="text"
                  name="social.facebook"
                  value={formData.social.facebook}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Facebook page URL"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                <input
                  type="text"
                  name="social.instagram"
                  value={formData.social.instagram}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Instagram profile URL"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
                <input
                  type="text"
                  name="social.tiktok"
                  value={formData.social.tiktok}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="TikTok profile URL"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                <input
                  type="text"
                  name="social.twitter"
                  value={formData.social.twitter}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Twitter profile URL"
                />
              </div>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed URL</label>
            <input
              type="text"
              name="mapUrl"
              value={formData.mapUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Enter Google Maps embed URL"
            />
            <p className="mt-1 text-xs text-gray-500">
              Get this from Google Maps by clicking "Share" and then "Embed a map", then copy the src URL from the iframe code.
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminContact;
