import React, { useState, useEffect } from 'react';
import { categoryAPI, subcategoryAPI } from '../../services/api';
import { 
  PencilSquareIcon, 
  TrashIcon, 
  PlusCircleIcon, 
  XMarkIcon, 
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
  });
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: '',
    parentId: null
  });
  const [error, setError] = useState('');

  // Load categories and format them into a hierarchical structure
  const loadCategories = async () => {
    try {
      setLoading(true);
      
      // Get all categories
      const categoryResponse = await categoryAPI.getAll();
      const mainCategories = categoryResponse.data;
      
      if (!Array.isArray(mainCategories)) {
        console.error('Invalid category data received');
        throw new Error('Failed to load categories: Invalid data format');
      }
      
      // Get all subcategories
      const subcategoryResponse = await subcategoryAPI.getAll();
      const allSubcategories = subcategoryResponse.data;
      
      if (!Array.isArray(allSubcategories)) {
        console.error('Invalid subcategory data received');
        throw new Error('Failed to load subcategories: Invalid data format');
      }
      
      // Add subcategories to their parent categories using ObjectId-based filtering
      const categoriesWithSubs = mainCategories.map(category => ({
        ...category,
        subcategories: allSubcategories.filter(sub => sub.categoryId === category._id)
      }));

      console.log('Categories with subcategories:', categoriesWithSubs);
      setCategories(categoriesWithSubs);
      setLoading(false);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories.');
      setCategories([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Category Modal Functions
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
    });
    setError('');
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
    });
    setError('');
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setError('');
  };

  // Subcategory Modal Functions
  const openAddSubcategoryModal = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setEditingSubcategory(null);
    setSubcategoryFormData({
      name: '',
      categoryId: categoryId,
      description: ''
    });
    setError('');
    setIsSubcategoryModalOpen(true);
  };

  const openEditSubcategoryModal = (categoryId, subcategory) => {
    setSelectedCategoryId(categoryId);
    setEditingSubcategory(subcategory);
    setSubcategoryFormData({
      name: subcategory.name,
      categoryId: categoryId,
      description: subcategory.description || ''
    });
    setError('');
    setIsSubcategoryModalOpen(true);
  };

  const closeSubcategoryModal = () => {
    setIsSubcategoryModalOpen(false);
    setSelectedCategoryId(null);
    setEditingSubcategory(null);
    setError('');
  };

  // Form Input Handlers
  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubcategoryInputChange = (e) => {
    const { name, value } = e.target;
    setSubcategoryFormData(prev => ({ ...prev, [name]: value }));
  };

  // Form Submit Handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!categoryFormData.name) {
      setError('Category name is required.');
      return;
    }

    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, categoryFormData);
      } else {
        await categoryAPI.create(categoryFormData);
      }
      await loadCategories(); // Refresh the category list
      closeCategoryModal();
    } catch (err) {
      console.error('Error saving category:', err);
      setError(`Failed to save category: ${err.message}`);
    }
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!subcategoryFormData.name) {
      setError('Subcategory name is required.');
      return;
    }

    // Validate parent category
    if (!subcategoryFormData.categoryId) {
      setError('Parent category is required for subcategories.');
      return;
    }

    try {
      if (editingSubcategory) {
        // Update existing subcategory
        await subcategoryAPI.update(editingSubcategory._id, subcategoryFormData);
      } else {
        // Create new subcategory
        await subcategoryAPI.create(subcategoryFormData);
      }
      await loadCategories(); // Refresh the category list
      closeSubcategoryModal();
    } catch (err) {
      console.error('Error saving subcategory:', err);
      setError(`Failed to save subcategory: ${err.message || 'Please try again later.'}`);
    }
  };

  // Delete Handlers
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) {
      try {
        await categoryAPI.delete(categoryId);
        await loadCategories(); // Refresh the list
      } catch (err) {
        console.error('Error deleting category:', err);
        setError(`Failed to delete category: ${err.message || 'Please try again later.'}`);
      }
    }
  };

  const handleDeleteSubcategory = async (subcategoryId) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        // Use the subcategoryAPI to delete a subcategory
        await subcategoryAPI.delete(subcategoryId);
        await loadCategories(); // Refresh the list
      } catch (err) {
        console.error('Error deleting subcategory:', err);
        setError(`Failed to delete subcategory: ${err.message || 'Please try again later.'}`);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold text-primary">Manage Categories</h1>
        <button 
          onClick={openAddCategoryModal}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center w-full sm:w-auto"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[30vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {categories.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No categories found. Add a new category to get started.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {categories.map((category) => (
                <li key={category._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => toggleCategoryExpansion(category._id)}
                        className="text-gray-500 hover:text-primary"
                      >
                        {expandedCategories[category._id] ? (
                          <ChevronUpIcon className="h-5 w-5" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5" />
                        )}
                      </button>
                      <span className="font-medium text-lg">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openAddSubcategoryModal(category._id)}
                        className="text-primary hover:text-primary/80"
                        title="Add Subcategory"
                      >
                        <PlusCircleIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => openEditCategoryModal(category)}
                        className="text-primary hover:text-primary/80"
                        title="Edit Category"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Category"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Subcategories */}
                  {expandedCategories[category._id] && (
                    <div className="mt-3 ml-6 border-l-2 border-gray-200 pl-4">
                      {category.subcategories && category.subcategories.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No subcategories</p>
                      ) : (
                        <ul className="space-y-2">
                          {category.subcategories.map((subcategory) => (
                            <li key={subcategory._id} className="flex items-center justify-between py-1">
                              <span className="text-sm">{subcategory.name}</span>
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => openEditSubcategoryModal(category._id, subcategory)}
                                  className="text-primary hover:text-primary/80"
                                  title="Edit Subcategory"
                                >
                                  <PencilSquareIcon className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteSubcategory(subcategory._id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete Subcategory"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={closeCategoryModal} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-4">
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter category name"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {isSubcategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
              </h2>
              <button onClick={closeSubcategoryModal} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubcategorySubmit} className="p-4">
              <div className="mb-4">
                <label htmlFor="subcategoryName" className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory Name
                </label>
                <input
                  type="text"
                  id="subcategoryName"
                  name="name"
                  value={subcategoryFormData.name}
                  onChange={handleSubcategoryInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter subcategory name"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeSubcategoryModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  {editingSubcategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
