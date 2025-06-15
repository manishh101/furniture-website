// Category data management utilities

// Default categories for the steel furniture store
export const defaultCategories = [
  {
    id: 'household',
    name: 'Household Furniture',
    description: 'Essential furniture for your home',
    subcategories: [
      { id: 'almirahs', name: 'Almirahs & Wardrobes' },
      { id: 'beds', name: 'Beds' },
      { id: 'chairs', name: 'Chairs' },
      { id: 'tables', name: 'Tables' },
      { id: 'racks', name: 'Storage Racks' }
    ]
  },
  {
    id: 'office',
    name: 'Office Furniture',
    description: 'Professional furniture for offices',
    subcategories: [
      { id: 'desks', name: 'Office Desks' },
      { id: 'chairs-office', name: 'Office Chairs' },
      { id: 'filing', name: 'Filing Cabinets' },
      { id: 'storage', name: 'Office Storage' }
    ]
  },
  {
    id: 'commercial',
    name: 'Commercial Furniture',
    description: 'Furniture for businesses and institutions',
    subcategories: [
      { id: 'lockers', name: 'Lockers' },
      { id: 'shelving', name: 'Commercial Shelving' },
      { id: 'counters', name: 'Counters' },
      { id: 'display', name: 'Display Units' }
    ]
  }
];

// Get all categories from localStorage or return defaults
export const getCategories = () => {
  try {
    const stored = localStorage.getItem('categories');
    if (stored) {
      const categories = JSON.parse(stored);
      return categories.length > 0 ? categories : defaultCategories;
    }
    return defaultCategories;
  } catch (error) {
    console.error('Error getting categories:', error);
    return defaultCategories;
  }
};

// Save categories to localStorage
export const saveCategories = (categories) => {
  try {
    localStorage.setItem('categories', JSON.stringify(categories));
    return true;
  } catch (error) {
    console.error('Error saving categories:', error);
    return false;
  }
};

// Get category by ID
export const getCategoryById = (categoryId) => {
  const categories = getCategories();
  return categories.find(cat => cat.id === categoryId);
};

// Get subcategory by ID
export const getSubcategoryById = (categoryId, subcategoryId) => {
  const category = getCategoryById(categoryId);
  if (category && category.subcategories) {
    return category.subcategories.find(sub => sub.id === subcategoryId);
  }
  return null;
};

// Get all subcategories as a flat array
export const getAllSubcategoriesFlat = () => {
  const categories = getCategories();
  const flatSubcategories = [];
  
  categories.forEach(category => {
    if (category.subcategories && category.subcategories.length > 0) {
      category.subcategories.forEach(subcategory => {
        flatSubcategories.push({
          ...subcategory,
          categoryId: category.id,
          categoryName: category.name
        });
      });
    }
  });
  
  return flatSubcategories;
};

// Save a new category or update existing one
export const saveCategory = (categoryData) => {
  try {
    const categories = getCategories();
    const existingIndex = categories.findIndex(cat => cat.id === categoryData.id);
    
    if (existingIndex >= 0) {
      // Update existing category
      categories[existingIndex] = { ...categories[existingIndex], ...categoryData };
    } else {
      // Add new category
      categories.push({
        ...categoryData,
        subcategories: categoryData.subcategories || []
      });
    }
    
    return saveCategories(categories);
  } catch (error) {
    console.error('Error saving category:', error);
    return false;
  }
};

// Delete a category
export const deleteCategory = (categoryId) => {
  try {
    const categories = getCategories();
    const filteredCategories = categories.filter(cat => cat.id !== categoryId);
    return saveCategories(filteredCategories);
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
};

// Add subcategory to a category
export const addSubcategory = (categoryId, subcategoryData) => {
  try {
    const categories = getCategories();
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    
    if (categoryIndex >= 0) {
      if (!categories[categoryIndex].subcategories) {
        categories[categoryIndex].subcategories = [];
      }
      categories[categoryIndex].subcategories.push(subcategoryData);
      return saveCategories(categories);
    }
    return false;
  } catch (error) {
    console.error('Error adding subcategory:', error);
    return false;
  }
};

// Update a subcategory
export const updateSubcategory = (categoryId, subcategoryId, subcategoryData) => {
  try {
    const categories = getCategories();
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    
    if (categoryIndex >= 0 && categories[categoryIndex].subcategories) {
      const subcategoryIndex = categories[categoryIndex].subcategories.findIndex(
        sub => sub.id === subcategoryId
      );
      
      if (subcategoryIndex >= 0) {
        categories[categoryIndex].subcategories[subcategoryIndex] = {
          ...categories[categoryIndex].subcategories[subcategoryIndex],
          ...subcategoryData
        };
        return saveCategories(categories);
      }
    }
    return false;
  } catch (error) {
    console.error('Error updating subcategory:', error);
    return false;
  }
};

// Delete a subcategory
export const deleteSubcategory = (categoryId, subcategoryId) => {
  try {
    const categories = getCategories();
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    
    if (categoryIndex >= 0 && categories[categoryIndex].subcategories) {
      categories[categoryIndex].subcategories = categories[categoryIndex].subcategories.filter(
        sub => sub.id !== subcategoryId
      );
      return saveCategories(categories);
    }
    return false;
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return false;
  }
};

// Initialize categories if not exists
export const initializeCategories = () => {
  const existing = localStorage.getItem('categories');
  if (!existing) {
    saveCategories(defaultCategories);
  }
};

// Export for use in components
export const categories = getCategories();
