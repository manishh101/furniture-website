// This file helps export localStorage data to JSON files
// Run this in the browser console while on your website
// The exported files can then be used by the server migration script

function exportLocalStorageToJSON() {
  // Check if we're in a browser environment
  if (typeof localStorage === 'undefined') {
    console.error('This script must be run in a browser with localStorage access');
    return;
  }
  
  try {
    // Export products
    const products = localStorage.getItem('products');
    if (products) {
      const parsedProducts = JSON.parse(products);
      console.log('Products found:', parsedProducts.length);
      
      // Create a download link for products
      downloadJSON(parsedProducts, 'products-export.json');
    } else {
      console.log('No products found in localStorage');
    }
    
    // Export categories
    const categories = localStorage.getItem('categories');
    if (categories) {
      const parsedCategories = JSON.parse(categories);
      console.log('Categories found:', parsedCategories.length);
      
      // Create a download link for categories
      downloadJSON(parsedCategories, 'categories-export.json');
    } else {
      console.log('No categories found in localStorage');
    }
    
    console.log('Export complete! Place these files in the server/scripts directory for migration.');
  } catch (err) {
    console.error('Error exporting data:', err);
  }
}

function downloadJSON(data, filename) {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Trigger the download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Execute the export function
exportLocalStorageToJSON();
