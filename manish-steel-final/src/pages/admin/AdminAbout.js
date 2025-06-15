import React, { useState, useEffect } from 'react';
import { aboutAPI, uploadAPI } from '../../services/api';
import authService from '../../services/authService';
import { ClipboardDocumentCheckIcon, XMarkIcon, PlusIcon, PhotoIcon } from '@heroicons/react/24/outline';
import ImageUploader from '../../components/admin/ImageUploader';
import SingleImageUploader from '../../components/admin/SingleImageUploader';

const AdminAboutPage = () => {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('hero');
  
  // Form states for each section
  const [heroSection, setHeroSection] = useState({ heroTitle: '', heroDescription: '' });
  const [storySection, setStorySection] = useState({
    storyTitle: '',
    storyImage: '',
    storyContent: ['']
  });
  const [visionMission, setVisionMission] = useState({ vision: '', mission: '' });
  const [coreValues, setCoreValues] = useState([]);
  const [workshopSection, setWorkshopSection] = useState({
    workshopTitle: '',
    workshopDescription: '',
    workshopImages: []
  });
  
  // Fetch about data on component mount
  useEffect(() => {
    fetchAboutData();
  }, []);
  
  // Fetch about data from API
  const fetchAboutData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      console.log('Fetching about page content...');
      
      const response = await aboutAPI.getContent();
      console.log('About API response:', response);
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        console.log('About data received:', data);
        setAboutData(data);
        
        // Initialize form states with fetched data
        if (data) {
          setHeroSection({
            heroTitle: data.heroTitle || '',
            heroDescription: data.heroDescription || ''
          });
          
          setStorySection({
            storyTitle: data.storyTitle || '',
            storyImage: data.storyImage || '',
            storyContent: Array.isArray(data.storyContent) && data.storyContent.length > 0 
              ? data.storyContent 
              : ['']
          });
          
          setVisionMission({
            vision: data.vision || '',
            mission: data.mission || ''
          });
          
          setCoreValues(Array.isArray(data.coreValues) ? data.coreValues : []);
          
          setWorkshopSection({
            workshopTitle: data.workshopTitle || '',
            workshopDescription: data.workshopDescription || '',
            workshopImages: Array.isArray(data.workshopImages) ? data.workshopImages : []
          });
        } else {
          console.log('No about data received, using defaults');
          // Initialize with empty defaults if no data
          setHeroSection({ heroTitle: 'About Our Company', heroDescription: '' });
          setStorySection({ storyTitle: 'Our Story', storyImage: '', storyContent: [''] });
          setVisionMission({ vision: '', mission: '' });
          setCoreValues([]);
          setWorkshopSection({ workshopTitle: 'Our Workshop & Team', workshopDescription: '', workshopImages: [] });
        }
      } else {
        console.error('API response format error:', response);
        setError('Invalid response from server. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
      setError('Failed to load about page content. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Save hero section
  const saveHeroSection = async () => {
    // Validate input
    if (!heroSection.heroTitle.trim()) {
      setError('Hero title cannot be empty');
      return;
    }
    
    await saveAboutSection({
      heroTitle: heroSection.heroTitle,
      heroDescription: heroSection.heroDescription
    }, 'Hero section');
  };
  
  // Save story section
  const saveStorySection = async () => {
    // Filter out empty paragraphs
    const filteredContent = storySection.storyContent.filter(p => p.trim() !== '');
    
    if (filteredContent.length === 0) {
      setError('Story content cannot be empty');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      await saveAboutSection({
        storyTitle: storySection.storyTitle,
        storyImage: storySection.storyImage,
        storyContent: filteredContent
      }, 'Story section');
    } catch (error) {
      console.error('Error saving story section:', error);
      setError(`Failed to save story section: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };
  
  // Save vision and mission
  const saveVisionMission = async () => {
    // Validate input
    if (!visionMission.vision.trim() || !visionMission.mission.trim()) {
      setError('Both Vision and Mission fields are required');
      return;
    }
    
    await saveAboutSection({
      vision: visionMission.vision,
      mission: visionMission.mission
    }, 'Vision and Mission');
  };
  
  // Add new core value
  const addCoreValue = () => {
    const newValue = {
      title: '',
      description: '',
      icon: 'CheckBadgeIcon' // Default icon
    };
    setCoreValues([...coreValues, newValue]);
  };
  
  // Delete core value
  const deleteCoreValue = async (index) => {
    // Filter out the core value at the specified index
    const updatedCoreValues = coreValues.filter((_, i) => i !== index);
    
    await saveAboutSection({
      coreValues: updatedCoreValues
    }, 'Core value');
    
    // Update local state for immediate UI feedback
    setCoreValues(updatedCoreValues);
  };
  
  // Update or add a core value
  const updateCoreValue = async (index) => {
    const valueToUpdate = coreValues[index];
    
    // Validate input
    if (!valueToUpdate.title.trim() || !valueToUpdate.description.trim() || !valueToUpdate.icon) {
      setError('All core value fields are required');
      return;
    }
    
    // Create a copy of the core values array
    const updatedCoreValues = [...coreValues];
    
    await saveAboutSection({
      coreValues: updatedCoreValues
    }, 'Core value');
  };
  
  // Save workshop section
  const saveWorkshopSection = async () => {
    // Validate input
    if (!workshopSection.workshopTitle.trim()) {
      setError('Workshop title cannot be empty');
      return;
    }
    
    // Filter out empty image URLs
    const filteredImages = workshopSection.workshopImages.filter(url => url.trim() !== '');
    
    await saveAboutSection({
      workshopTitle: workshopSection.workshopTitle,
      workshopDescription: workshopSection.workshopDescription,
      workshopImages: filteredImages
    }, 'Workshop section');
  };
  
  // Add workshop image
  const addWorkshopImage = () => {
    setWorkshopSection({
      ...workshopSection,
      workshopImages: [...workshopSection.workshopImages, '']
    });
  };
  
  // Handle workshop images upload
  const handleWorkshopImagesSelect = (files) => {
    if (files.length > 0) {
      setSaving(true);
      setError(null);
      
      // Create a form data object for the upload
      const formData = new FormData();
      
      // Add all selected files to formData
      files.forEach(file => {
        formData.append('images', file);
      });
      
      // Show progress message
      showSuccess(`Uploading ${files.length} image${files.length > 1 ? 's' : ''}...`);
      
      // Upload the images to Cloudinary through our API
      uploadAPI.uploadImages(formData)
        .then(response => {
          if (response.data && response.data.success && response.data.urls && response.data.urls.length > 0) {
            // Get current images
            const currentImages = workshopSection.workshopImages || [];
            
            // Append new image URLs (avoiding duplicates)
            const newImages = response.data.urls;
            const updatedImages = [...currentImages];
            
            newImages.forEach(url => {
              if (!updatedImages.includes(url)) {
                updatedImages.push(url);
              }
            });
            
            // Update state with new images
            setWorkshopSection({
              ...workshopSection,
              workshopImages: updatedImages
            });
            
            showSuccess(`${newImages.length} workshop image${newImages.length > 1 ? 's' : ''} uploaded successfully`);
          } else {
            setError('Failed to upload images: Invalid response format');
          }
        })
        .catch(err => {
          setError(`Failed to upload images: ${err.message || 'Unknown error'}`);
          console.error('Images upload error:', err);
        })
        .finally(() => {
          setSaving(false);
        });
    }
  };
  
  // Delete workshop image
  const removeWorkshopImage = (index) => {
    // Get the URL to remove
    const imageToRemove = workshopSection.workshopImages[index];
    
    // Filter out the image at the specified index
    const updatedImages = workshopSection.workshopImages.filter(url => url !== imageToRemove);
    
    setWorkshopSection({
      ...workshopSection,
      workshopImages: updatedImages
    });
    
    showSuccess('Image removed');
  };
  
  // Update workshop image
  const updateWorkshopImage = (index, url) => {
    const updatedImages = [...workshopSection.workshopImages];
    updatedImages[index] = url;
    setWorkshopSection({
      ...workshopSection,
      workshopImages: updatedImages
    });
  };
  
  // Handle story content changes
  const handleStoryContentChange = (index, value) => {
    const updatedContent = [...storySection.storyContent];
    updatedContent[index] = value;
    
    setStorySection({
      ...storySection,
      storyContent: updatedContent
    });
  };
  
  // Handle story image upload
  const handleStoryImageSelect = (files) => {
    if (files.length > 0) {
      setSaving(true);
      setError(null);
      
      // Create a form data object for the upload
      const formData = new FormData();
      formData.append('images', files[0]);
      
      // Show progress message
      showSuccess('Uploading image...');
      
      // Upload the image to Cloudinary through our API
      uploadAPI.uploadImages(formData)
        .then(response => {
          if (response.data && response.data.success && response.data.urls && response.data.urls.length > 0) {
            const imageUrl = response.data.urls[0];
            setStorySection({
              ...storySection,
              storyImage: imageUrl
            });
            showSuccess('Story image uploaded successfully');
          } else {
            setError('Failed to upload image: Invalid response format');
          }
        })
        .catch(err => {
          setError(`Failed to upload image: ${err.message || 'Unknown error'}`);
          console.error('Image upload error:', err);
        })
        .finally(() => {
          setSaving(false);
        });
    }
  };
  
  // Handle removing existing story image
  const handleRemoveStoryImage = () => {
    setStorySection({
      ...storySection,
      storyImage: ''
    });
  };
  
  // Add new paragraph to story
  const addStoryParagraph = () => {
    setStorySection({
      ...storySection,
      storyContent: [...storySection.storyContent, '']
    });
  };
  
  // Remove paragraph from story
  const removeStoryParagraph = (index) => {
    const updatedContent = [...storySection.storyContent];
    updatedContent.splice(index, 1);
    
    setStorySection({
      ...storySection,
      storyContent: updatedContent.length ? updatedContent : [''] // Always keep at least one paragraph
    });
  };
  
  // Show success message with auto-hide
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setError(null);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  // Helper function to handle API errors
  const handleApiError = (error, action) => {
    console.error(`Error ${action}:`, error);
    
    if (error.response) {
      // Server responded with an error status
      setError(`Failed to ${action}: ${error.response.data?.message || error.response.data?.msg || 'Server error'}`);
    } else if (error.request) {
      // Request was made but no response received
      setError(`Failed to ${action}: No response from server`);
    } else {
      // Something else caused the error
      setError(`Failed to ${action}: ${error.message || 'Unknown error'}`);
    }
  };

  // Helper function to save about section changes
  const saveAboutSection = async (sectionData, sectionName) => {
    try {
      setSaving(true);
      setError(null);
      
      // Create an updated data object with only the fields we want to change
      const updatedData = {
        ...aboutData,
        ...sectionData,
        lastUpdated: new Date()
      };
      
      console.log(`Updating ${sectionName} section:`, sectionData);
      
      const response = await aboutAPI.updateContent(updatedData);
      
      if (response.data && response.data.success) {
        showSuccess(`${sectionName} updated successfully`);
        fetchAboutData(); // Refresh data
      } else {
        setError(`Failed to update ${sectionName}: ${response.data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      if (error.response) {
        setError(`Error: ${error.response.data?.message || error.response.statusText || 'Server error'}`);
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError(`Error: ${error.message || 'Unknown error'}`);
      }
      console.error(`Error updating ${sectionName}:`, error);
    } finally {
      setSaving(false);
    }
  };
  
  // Tab navigation
  const tabs = [
    { id: 'hero', label: 'Hero Section' },
    { id: 'story', label: 'Our Story' },
    { id: 'vision-mission', label: 'Vision & Mission' },
    { id: 'values', label: 'Core Values' },
    { id: 'workshop', label: 'Workshop & Team' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">About Page Management</h1>
      
      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex overflow-x-auto space-x-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Hero Section */}
          {activeTab === 'hero' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Hero Section</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={heroSection.heroTitle}
                  onChange={(e) => setHeroSection({...heroSection, heroTitle: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={heroSection.heroDescription}
                  onChange={(e) => setHeroSection({...heroSection, heroDescription: e.target.value})}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              
              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={saveHeroSection}
                  disabled={saving}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'
                  } text-white font-medium transition-colors`}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentCheckIcon className="h-5 w-5 mr-1" />
                      Save Hero Section
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          
          {/* Story Section */}
          {activeTab === 'story' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Our Story</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={storySection.storyTitle}
                  onChange={(e) => setStorySection({...storySection, storyTitle: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <PhotoIcon className="h-5 w-5 mr-1 text-gray-500" />
                  Story Image
                </label>
                <SingleImageUploader
                  onImageSelected={handleStoryImageSelect}
                  existingImage={storySection.storyImage}
                  onRemoveImage={handleRemoveStoryImage}
                  imageType="story"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This image will appear in the "Our Story" section. Use a high-quality image with dimensions of 1000x600px for best results.
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Content Paragraphs</label>
                
                {storySection.storyContent.map((paragraph, index) => (
                  <div key={index} className="flex items-start mb-2">
                    <textarea
                      value={paragraph}
                      onChange={(e) => handleStoryContentChange(index, e.target.value)}
                      rows="3"
                      className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    ></textarea>
                    
                    <button
                      onClick={() => removeStoryParagraph(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      title="Remove paragraph"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={addStoryParagraph}
                  className="flex items-center text-blue-500 hover:text-blue-700 mt-2"
                >
                  <PlusIcon className="h-4 w-4 mr-1" /> Add Paragraph
                </button>
              </div>
              
              <button
                onClick={saveStorySection}
                disabled={saving}
                className={`flex items-center px-4 py-2 rounded-md ${
                  saving ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <ClipboardDocumentCheckIcon className="h-5 w-5 mr-1" />
                    Save Story Section
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Vision & Mission */}
          {activeTab === 'vision-mission' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Vision & Mission</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vision</label>
                <textarea
                  value={visionMission.vision}
                  onChange={(e) => setVisionMission({...visionMission, vision: e.target.value})}
                  rows="3"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mission</label>
                <textarea
                  value={visionMission.mission}
                  onChange={(e) => setVisionMission({...visionMission, mission: e.target.value})}
                  rows="3"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                ></textarea>
              </div>
              
              <button
                onClick={saveVisionMission}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                {saving ? 'Saving...' : 'Save Vision & Mission'}
              </button>
            </div>
          )}
          
          {/* Core Values */}
          {activeTab === 'values' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Core Values</h2>
                <button
                  onClick={addCoreValue}
                  className="flex items-center text-white bg-green-500 px-3 py-1 rounded-md hover:bg-green-600"
                >
                  <PlusIcon className="h-4 w-4 mr-1" /> Add Value
                </button>
              </div>
              
              {coreValues.length === 0 ? (
                <p className="text-gray-500 italic">No core values defined. Click "Add Value" to create one.</p>
              ) : (
                coreValues.map((value, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={value.title}
                        onChange={(e) => {
                          const updatedValues = [...coreValues];
                          updatedValues[index].title = e.target.value;
                          setCoreValues(updatedValues);
                        }}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={value.description}
                        onChange={(e) => {
                          const updatedValues = [...coreValues];
                          updatedValues[index].description = e.target.value;
                          setCoreValues(updatedValues);
                        }}
                        rows="2"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      ></textarea>
                    </div>
                    
                    {/* In a full implementation, you would have a dropdown for icons */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon Name</label>
                      <input
                        type="text"
                        value={value.icon}
                        onChange={(e) => {
                          const updatedValues = [...coreValues];
                          updatedValues[index].icon = e.target.value;
                          setCoreValues(updatedValues);
                        }}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => deleteCoreValue(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => updateCoreValue(index)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* Workshop & Team */}
          {activeTab === 'workshop' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Workshop & Team</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={workshopSection.workshopTitle}
                  onChange={(e) => setWorkshopSection({...workshopSection, workshopTitle: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Description</label>
                <textarea
                  value={workshopSection.workshopDescription}
                  onChange={(e) => setWorkshopSection({...workshopSection, workshopDescription: e.target.value})}
                  rows="2"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Workshop Images</label>
                </div>
                
                <ImageUploader
                  onSelectImages={handleWorkshopImagesSelect}
                  onRemoveImage={removeWorkshopImage}
                  maxFiles={6}
                  accept="image/*"
                  fileList={workshopSection.workshopImages}
                  galleryMode={true}
                />
                
                <p className="text-xs text-gray-500 mt-1">
                  Upload up to 6 images of your workshop and team. Images will be displayed in a grid on the About page.
                  For best results, use images with similar dimensions (recommended: 600x400px).
                </p>
              </div>
              
              <button
                onClick={saveWorkshopSection}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                {saving ? 'Saving...' : 'Save Workshop Section'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminAboutPage;
