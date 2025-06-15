import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LayoutWrapper from './components/LayoutWrapper';
import ScrollToTop from './components/ScrollToTop';
import ApiHealthCheck from './components/ApiHealthCheck';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import SearchPage from './pages/SearchPage';
import CustomOrderPage from './pages/CustomOrderPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminGallery from './pages/admin/AdminGallery';
import AdminContact from './pages/admin/AdminContact';
import AdminInquiries from './pages/admin/AdminInquiries';
import AdminAbout from './pages/admin/AdminAbout';
import AdminCustomOrders from './pages/admin/AdminCustomOrders';
import MobileDiagnostics from './components/MobileDiagnostics';
import diagnosticsEnabler from './utils/diagnosticsEnabler';

import ErrorBoundary from './components/ErrorBoundary';

// Main App component
function App() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Check if diagnostics mode is enabled
  useEffect(() => {
    const isDiagnosticsMode = diagnosticsEnabler.isDiagnosticsEnabled();
    setShowDiagnostics(isDiagnosticsMode);
    
    if (isDiagnosticsMode) {
      diagnosticsEnabler.showDiagnosticsNotice();
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <ApiHealthCheck onStatusChange={setApiStatus} />
      <LayoutWrapper>
        <Routes>
          {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/custom-order" element={<CustomOrderPage />} />
            <Route path="/login" element={<LoginPage />} />

            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={
                <ErrorBoundary>
                  <AdminLayout />
                </ErrorBoundary>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="about" element={<AdminAbout />} />
                <Route path="contact" element={<AdminContact />} />
                <Route path="inquiries" element={<AdminInquiries />} />
                <Route path="custom-orders" element={<AdminCustomOrders />} />
              </Route>
            </Route>
            
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
      </LayoutWrapper>
      {/* Mobile diagnostics panel - only shown when ?debug=true is in the URL */}
      <MobileDiagnostics show={showDiagnostics} />
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {showDiagnostics && <MobileDiagnostics />}
    </Router>
  );
}

export default App;
