// Gallery API for backend integration
import api from './api';
import CloudinaryImageService from './cloudinaryImageService';

export const galleryAPI = {
  // Get all products
  getAllProducts: async () => {
    try {
      // Request a large number of products by setting a high limit parameter (1000)
      const response = await api.get('/products', { params: { limit: 1000 } });
      console.log('API Response - All Products:', response);
      
      // Ensure we have a valid response structure
      if (!response || !response.data) {
        console.error('Invalid API response format:', response);
        return { data: [] };
      }
      
      // Handle different response formats - accommodate both {products: [...]} and direct array
      if (response.data.products) {
        return { data: response.data.products };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching all products:', error);
      return { data: [] }; // Return empty array on error instead of throwing
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/products', { params: { featured: true } });
      return response;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId, categoryName = '') => {
    try {
      // Include both ID and name for better matching on the server side
      const response = await api.get('/products', { 
        params: { 
          category: categoryId,
          categoryName: categoryName,
          limit: 1000 // Request a large number of products per category
        } 
      });
      
      // Ensure we have a valid response structure
      if (!response || !response.data) {
        console.warn(`No data returned for category ${categoryId}`);
        return { data: [] };
      }
      
      // Handle different response formats - accommodate both {products: [...]} and direct array
      if (response.data.products) {
        return { data: response.data.products };
      }
      
      return response;
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error);
      return { data: [] }; // Return empty array instead of throwing
    }
  },

  // Get product details optimized for gallery display (images only)
  getProductDetail: async (productId) => {
    try {
      if (!productId) {
        console.error('Attempted to fetch product details with invalid ID:', productId);
        return { images: [], galleryData: [] };
      }
      
      console.log(`🖼️ Fetching gallery images for product ID: ${productId}`);
      
      // First try the dedicated images endpoint
      try {
        const imagesResponse = await api.get(`/products/${productId}/images`);
        if (imagesResponse && imagesResponse.data && imagesResponse.data.images) {
          console.log(`📸 Found ${imagesResponse.data.images.length} images from dedicated endpoint`);
          
          // Process the images through CloudinaryImageService
          const imageUrls = imagesResponse.data.images.map(img => img.url || img);
          const processedImages = CloudinaryImageService.validateGalleryImages(imageUrls);
          
          return {
            id: productId,
            name: imagesResponse.data.productName || 'Product Gallery',
            category: imagesResponse.data.category,
            images: processedImages,
            galleryData: processedImages.map((url, index) => ({
              id: `${productId}_${index}`,
              url: url,
              index: index,
              alt: `${imagesResponse.data.productName || 'Product'} - Image ${index + 1}`
            })),
            totalImages: processedImages.length,
            isGalleryReady: processedImages.length > 0
          };
        }
      } catch (endpointError) {
        console.log('⚠️ Dedicated images endpoint not available, falling back to product data');
      }
      
      // Fallback to the detailed product endpoint
      const response = await api.get(`/products/${productId}`);
      console.log(`📦 API response for product ${productId}:`, response);
      
      // Check if we have a valid response
      if (!response || !response.data) {
        console.warn(`⚠️ No data returned for product ${productId}`);
        return { images: [], galleryData: [] };
      }
      
      // Enhanced handling for gallery-focused image extraction
      const productData = response.data;
      const galleryImages = new Set(); // Use Set for unique images
      
      // Helper function to validate and normalize image URLs
      const validateImageUrl = (img) => {
        return CloudinaryImageService.normalizeImageUrl(img);
      };
      
      // Helper function to process image arrays with validation
      const processImageArray = (array, sourceName) => {
        if (!Array.isArray(array)) return 0;
        
        let addedCount = 0;
        array.forEach((item, index) => {
          const validUrl = validateImageUrl(item);
          if (validUrl) {
            galleryImages.add(validUrl);
            addedCount++;
            console.log(`✅ Added image ${index + 1} from ${sourceName}`);
          }
        });
        
        return addedCount;
      };
      
      // Priority-based image extraction for gallery display
      console.log(`🔍 Extracting images from product data...`);
      
      // 1. Main product image (highest priority)
      if (productData.image) {
        const mainImage = validateImageUrl(productData.image);
        if (mainImage) {
          galleryImages.add(mainImage);
          console.log(`🎯 Added main product image`);
        }
      }
      
      // 2. Dedicated gallery arrays
      const imageSources = [
        { data: productData.images, name: 'product.images' },
        { data: productData.gallery, name: 'product.gallery' },
        { data: productData.galleryImages, name: 'product.galleryImages' },
        { data: productData.additionalImages, name: 'product.additionalImages' },
        { data: productData.productImages, name: 'product.productImages' }
      ];
      
      imageSources.forEach(source => {
        const count = processImageArray(source.data, source.name);
        if (count > 0) {
          console.log(`📸 Found ${count} images from ${source.name}`);
        }
      });
      
      // 3. Check nested data structures
      if (productData.data) {
        const nestedSources = [
          { data: productData.data.images, name: 'nested.images' },
          { data: productData.data.gallery, name: 'nested.gallery' },
          { data: productData.data.additionalImages, name: 'nested.additionalImages' }
        ];
        
        nestedSources.forEach(source => {
          const count = processImageArray(source.data, source.name);
          if (count > 0) {
            console.log(`📸 Found ${count} images from ${source.name}`);
          }
        });
      }
      
      // 4. Try dedicated image endpoints
      try {
        const imageEndpoints = [
          `/products/${productId}/images`,
          `/products/${productId}/gallery`,
          `/products/${productId}/media`
        ];
        
        for (const endpoint of imageEndpoints) {
          try {
            const imgResponse = await api.get(endpoint);
            if (imgResponse?.data) {
              if (Array.isArray(imgResponse.data)) {
                const count = processImageArray(imgResponse.data, `endpoint:${endpoint}`);
                if (count > 0) console.log(`🌐 Found ${count} images from ${endpoint}`);
              } else if (imgResponse.data.images) {
                const count = processImageArray(imgResponse.data.images, `endpoint:${endpoint}.images`);
                if (count > 0) console.log(`🌐 Found ${count} images from ${endpoint}.images`);
              }
            }
          } catch (endpointError) {
            // Silently continue - endpoint might not exist
          }
        }
      } catch (error) {
        console.log('⚠️ Could not fetch from additional endpoints');
      }
      
      // Convert to array and prepare gallery data 
      // Use CloudinaryImageService to validate and process all images for consistency
      const rawImages = Array.from(galleryImages);
      const finalImages = CloudinaryImageService.validateGalleryImages(rawImages);
      
      console.log(`🎉 Gallery ready: ${finalImages.length} unique images found for product ${productId}`);
      
      // Create optimized gallery data structure
      const galleryData = finalImages.map((url, index) => ({
        id: `${productId}_${index}`,
        url: url,
        index: index,
        alt: `${productData.name || 'Product'} - Image ${index + 1}`
      }));
      
      // Return gallery-optimized data structure
      return {
        id: productData._id || productData.id || productId,
        name: productData.name || 'Product Gallery',
        category: productData.category,
        images: finalImages,
        galleryData: galleryData,
        totalImages: finalImages.length,
        isGalleryReady: finalImages.length > 0
      };
      
    } catch (error) {
      console.error(`❌ Error fetching gallery images for product ${productId}:`, error);
      return { 
        images: [], 
        galleryData: [], 
        totalImages: 0, 
        isGalleryReady: false,
        error: error.message 
      };
    }
  },

  // Get gallery configuration (sections, layout settings)
  getGalleryConfig: async () => {
    try {
      const response = await api.get('/gallery/config');
      return response.data;
    } catch (error) {
      console.error('Error fetching gallery config:', error);
      throw error;
    }
  },

  // Upload gallery image
  uploadImage: async (formData) => {
    try {
      const response = await api.post('/gallery/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading gallery image:', error);
      throw error;
    }
  },

  // Update gallery configuration
  updateGalleryConfig: async (config) => {
    try {
      const response = await api.put('/gallery/config', config);
      return response.data;
    } catch (error) {
      console.error('Error updating gallery config:', error);
      throw error;
    }
  },

  // Section Management - aligned with new gallery structure
  getGallery: async () => {
    try {
      const response = await api.get('/gallery');
      return response;
    } catch (error) {
      console.error('Error fetching gallery:', error);
      return { data: { sections: [] } };
    }
  },

  getAllSections: async () => {
    try {
      const response = await api.get('/gallery/sections');
      return response;
    } catch (error) {
      console.error('Error fetching all sections:', error);
      return { data: { sections: [] } };
    }
  },

  getConfiguration: async () => {
    try {
      const response = await api.get('/gallery/config');
      return response;
    } catch (error) {
      console.error('Error fetching gallery configuration:', error);
      throw error;
    }
  },

  updateConfiguration: async (config) => {
    try {
      const response = await api.put('/gallery/config', config, {
        headers: {
          'Content-Type': config instanceof FormData ? 'multipart/form-data' : 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating gallery configuration:', error);
      throw error;
    }
  },

  updateImage: async (imageId, imageData) => {
    try {
      const response = await api.put(`/gallery/images/${imageId}`, imageData, {
        headers: {
          'Content-Type': imageData instanceof FormData ? 'multipart/form-data' : 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating image:', error);
      throw error;
    }
  },

  deleteImage: async (imageId) => {
    try {
      const response = await api.delete(`/gallery/images/${imageId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },

  createSection: async (sectionData) => {
    try {
      const response = await api.post('/gallery/sections', sectionData);
      return response.data;
    } catch (error) {
      console.error('Error creating section:', error);
      throw error;
    }
  },

  updateSection: async (sectionId, sectionData) => {
    try {
      const response = await api.put(`/gallery/sections/${sectionId}`, sectionData);
      return response.data;
    } catch (error) {
      console.error('Error updating section:', error);
      throw error;
    }
  },

  deleteSection: async (sectionId) => {
    try {
      const response = await api.delete(`/gallery/sections/${sectionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting section:', error);
      throw error;
    }
  },

  reorderSections: async (sectionIds) => {
    try {
      const response = await api.put('/gallery/sections/reorder', { sectionIds });
      return response.data;
    } catch (error) {
      console.error('Error reordering sections:', error);
      throw error;
    }
  },

  // Update section order
  updateSectionOrder: async (sectionId, orderData) => {
    try {
      const response = await api.patch(`/gallery/sections/${sectionId}/order`, orderData);
      return response;
    } catch (error) {
      console.error(`Error updating section order for ${sectionId}:`, error);
      throw error;
    }
  },

  // Image Management within Sections
  addImageToSection: async (sectionId, imageData) => {
    try {
      const response = await api.post(`/gallery/sections/${sectionId}/images`, imageData);
      return response.data;
    } catch (error) {
      console.error('Error adding image to section:', error);
      throw error;
    }
  },

  updateImageInSection: async (sectionId, imageId, imageData) => {
    try {
      const response = await api.put(`/gallery/sections/${sectionId}/images/${imageId}`, imageData);
      return response.data;
    } catch (error) {
      console.error('Error updating image in section:', error);
      throw error;
    }
  },

  deleteImageFromSection: async (sectionId, imageId) => {
    try {
      const response = await api.delete(`/gallery/sections/${sectionId}/images/${imageId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting image from section:', error);
      throw error;
    }
  }
};

export default galleryAPI;
