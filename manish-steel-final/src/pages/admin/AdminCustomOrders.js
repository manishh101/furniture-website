import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt, FaEye, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AdminCustomOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Status options for custom orders (matching backend enum values)
  const statusOptions = [
    { value: 'new', label: 'New', color: 'blue' },
    { value: 'quoted', label: 'Quoted', color: 'orange' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'in-progress', label: 'In Progress', color: 'purple' },
    { value: 'manufacturing', label: 'Manufacturing', color: 'indigo' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'delivered', label: 'Delivered', color: 'teal' },
    { value: 'cancelled', label: 'Cancelled', color: 'gray' }
  ];

  // Fetch custom orders from the API
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      let url = `/api/custom-orders?page=${currentPage}`;
      
      // Add status filter if not 'all'
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching custom orders:', err);
      setError('Failed to load custom orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    setError(null);
    setSuccessMessage('');
    
    try {
      const response = await fetch(`/api/custom-orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update order: ${response.status}`);
      }

      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      setSuccessMessage(`Order status updated to ${newStatus}`);
      
      // If we're looking at the order details, update that too
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    }
  };

  // Delete an order
  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    setError(null);
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/custom-orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete order: ${response.status}`);
      }

      // Remove from local state
      setOrders(orders.filter(order => order._id !== orderId));
      setSuccessMessage('Order deleted successfully');
      
      // Close detail view if we were looking at this order
      if (selectedOrder && selectedOrder._id === orderId) {
        setShowOrderDetail(false);
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('Failed to delete order');
    }
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Load orders when the component mounts or when page/filter changes
  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusOption = statusOptions.find(option => option.value === status) || { label: status, color: 'gray' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusOption.color}-100 text-${statusOption.color}-800`}>
        {statusOption.label}
      </span>
    );
  };

  // Order details modal
  const OrderDetailModal = ({ order, onClose, onUpdateStatus }) => {
    if (!order) return null;
    
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700">Customer Information</h3>
                <p><span className="font-medium">Name:</span> {order.name}</p>
                <p><span className="font-medium">Email:</span> {order.email}</p>
                <p><span className="font-medium">Phone:</span> {order.phone}</p>
                <p><span className="font-medium">Address:</span> {order.address}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700">Order Information</h3>
                <p><span className="font-medium">Product Type:</span> {order.productType}</p>
                <p><span className="font-medium">Budget:</span> {order.budget || 'Not specified'}</p>
                <p><span className="font-medium">Status:</span> <StatusBadge status={order.status} /></p>
                <p><span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700">Dimensions</h3>
              <div className="grid grid-cols-3 gap-2">
                <p><span className="font-medium">Width:</span> {order.dimensions?.width || 'N/A'}</p>
                <p><span className="font-medium">Height:</span> {order.dimensions?.height || 'N/A'}</p>
                <p><span className="font-medium">Depth:</span> {order.dimensions?.depth || 'N/A'}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700">Color Preference</h3>
              <p>{order.color || 'Not specified'}</p>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700">Requirements</h3>
              <div className="bg-gray-50 p-3 rounded mt-1">
                <p className="whitespace-pre-wrap">{order.requirements}</p>
              </div>
            </div>
            
            {order.quotedPrice && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700">Quoted Price</h3>
                <p className="text-lg font-bold">₹{order.quotedPrice}</p>
              </div>
            )}
            
            {order.adminNotes && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700">Admin Notes</h3>
                <div className="bg-yellow-50 p-3 rounded mt-1">
                  <p className="whitespace-pre-wrap">{order.adminNotes}</p>
                </div>
              </div>
            )}
            
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Update Order Status</h3>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => onUpdateStatus(order._id, option.value)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      order.status === option.value
                        ? `bg-${option.color}-600 text-white`
                        : `bg-${option.color}-100 text-${option.color}-800 hover:bg-${option.color}-200`
                    }`}
                    disabled={order.status === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Custom Orders</h1>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded py-1 px-3 text-sm"
          >
            <option value="all">All Orders</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} Orders
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchOrders()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 animate-fadeIn">
          <div className="flex items-center">
            <FaCheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <p className="text-green-700 font-medium">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage('')}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 animate-fadeIn">
          <div className="flex items-center">
            <FaTimesCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No custom orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.name}</div>
                    <div className="text-sm text-gray-500">{order.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.productType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => viewOrderDetails(order)} 
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        onClick={() => deleteOrder(order._id)} 
                        className="text-red-600 hover:text-red-900"
                        title="Delete Order"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderDetail && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setShowOrderDetail(false)}
          onUpdateStatus={updateOrderStatus}
        />
      )}
    </div>
  );
};

export default AdminCustomOrders;