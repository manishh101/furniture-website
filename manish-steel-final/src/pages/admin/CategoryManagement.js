import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';
import { 
  PencilSquareIcon, 
  TrashIcon, 
  PlusCircleIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load all categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAll();
      const allCategories = response.data;
      
      // Split into parents and children
      const parents = allCategories.filter(cat => !cat.parentId);
      const children = allCategories.filter(cat => cat.parentId);
      
      setCategories(allCategories);
      setParentCategories(parents);
      setSubcategories(children);
      setLoading(false);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories: ' + (err.response?.data?.msg || err.message));
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = (isSubcategory = false) => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      parentId: isSubcategory ? (parentCategories[0]?._id || '') : ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      parentId: ''
    });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!formData.name) {
        setError('Category name is required');
        return;
      }
      
      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, formData);
        setSuccess('Category updated successfully');
      } else {
        await categoryAPI.create(formData);
        setSuccess('Category created successfully');
      }
      
      // Reload categories after successful operation
      await loadCategories();
      
      // Close modal after short delay
      setTimeout(() => {
        closeModal();
      }, 1000);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Error saving category: ' + (err.response?.data?.msg || err.message));
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryAPI.delete(categoryId);
        setSuccess('Category deleted successfully');
        
        // Reload categories
        await loadCategories();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } catch (err) {
        setError('Error deleting category: ' + (err.response?.data?.msg || err.message));
      }
    }
  };

  // Group subcategories by parent
  const groupedSubcategories = {};
  subcategories.forEach(sub => {
    if (!groupedSubcategories[sub.parentId]) {
      groupedSubcategories[sub.parentId] = [];
    }
    groupedSubcategories[sub.parentId].push(sub);
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <div className="space-x-2">
          <button
            className="bg-primary text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => openAddModal(false)}
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Add Category
          </button>
          <button
            className="bg-secondary text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => openAddModal(true)}
            disabled={parentCategories.length === 0}
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Add Subcategory
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            className="float-right" 
            onClick={() => setError('')}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
          <button 
            className="float-right" 
            onClick={() => setSuccess('')}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2">Loading categories...</p>
        </div>
      ) : parentCategories.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">No categories found.</p>
          <p className="text-gray-400 mt-2">Add your first category to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {parentCategories.map(parent => (
            <div key={parent._id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                <h3 className="font-medium">{parent.name}</h3>
                <div className="flex space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => openEditModal(parent)}
                    title="Edit"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleDeleteCategory(parent._id)}
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {parent.description && (
                <div className="px-4 py-2 text-sm text-gray-600 border-b">
                  {parent.description}
                </div>
              )}
              
              <div className="p-4">
                <div className="text-sm font-medium mb-2">Subcategories:</div>
                {groupedSubcategories[parent._id]?.length ? (
                  <ul className="space-y-2">
                    {groupedSubcategories[parent._id].map(sub => (
                      <li 
                        key={sub._id}
                        className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded"
                      >
                        <span>{sub.name}</span>
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => openEditModal(sub)}
                            title="Edit"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteCategory(sub._id)}
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No subcategories</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingCategory ? 'Edit Category' : formData.parentId ? 'Add Subcategory' : 'Add Category'}
              </h2>
              <button onClick={closeModal}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              {(!editingCategory || formData.parentId) && (
                <div className="mb-4">
                  <label htmlFor="parentId" className="block text-sm font-medium mb-1">
                    Parent Category
                  </label>
                  <select
                    id="parentId"
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">None (Top Level Category)</option>
                    {parentCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border rounded"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded"
                >
                  {editingCategory ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
