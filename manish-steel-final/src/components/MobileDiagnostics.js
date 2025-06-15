/**
 * Mobile Diagnostics Helper
 * 
 * This component provides real-time API status information on mobile devices.
 * It can be added to any page to help diagnose connectivity issues.
 */

import React, { useState, useEffect } from 'react';
import mobileDebugger from '../utils/mobileDebugger';

const MobileDiagnostics = ({ show = true }) => {
  const [apiStatus, setApiStatus] = useState({
    loading: true,
    general: null,
    featured: null,
    bestSelling: null,
    alternativeBestSelling: null,
    network: null,
    timestamp: null
  });

  useEffect(() => {
    if (!show) return;
    
    const checkEndpoints = async () => {
      setApiStatus(prev => ({ ...prev, loading: true, timestamp: new Date().toISOString() }));
      
      try {
        const networkInfo = mobileDebugger.checkMobileNetwork();
        setApiStatus(prev => ({ ...prev, network: networkInfo }));
      } catch (err) {
        console.error('Failed to get network info:', err);
      }
      
      try {
        // Get the API base URL
        const apiBaseUrl = process.env.REACT_APP_API_URL || 
                          ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
                           ? 'http://localhost:5000/api' 
                           : 'https://manish-steel-api.onrender.com/api');
        
        // Check general products endpoint
        try {
          const response = await fetch(`${apiBaseUrl}/products?limit=1`);
          const data = await response.json();
          setApiStatus(prev => ({ 
            ...prev, 
            general: { 
              status: response.status,
              ok: response.ok,
              hasProducts: !!(data && data.products && data.products.length)
            } 
          }));
        } catch (err) {
          setApiStatus(prev => ({ ...prev, general: { error: err.message } }));
        }
        
        // Check featured products endpoint
        try {
          const response = await fetch(`${apiBaseUrl}/products/featured?limit=1`);
          const data = await response.json();
          setApiStatus(prev => ({ 
            ...prev, 
            featured: {
              status: response.status,
              ok: response.ok,
              hasProducts: !!(data && data.products && data.products.length)
            } 
          }));
        } catch (err) {
          setApiStatus(prev => ({ ...prev, featured: { error: err.message } }));
        }
        
        // Check best-selling products endpoint
        try {
          const response = await fetch(`${apiBaseUrl}/products/best-selling?limit=1`);
          const data = await response.json();
          setApiStatus(prev => ({ 
            ...prev, 
            bestSelling: {
              status: response.status,
              ok: response.ok,
              hasProducts: !!(data && data.products && data.products.length)
            } 
          }));
        } catch (err) {
          setApiStatus(prev => ({ ...prev, bestSelling: { error: err.message } }));
        }
        
        // Check alternative best-selling products endpoint
        try {
          const response = await fetch(`${apiBaseUrl}/products?sortBy=salesCount&order=desc&limit=1`);
          const data = await response.json();
          setApiStatus(prev => ({ 
            ...prev, 
            alternativeBestSelling: {
              status: response.status,
              ok: response.ok,
              hasProducts: !!(data && data.products && data.products.length)
            } 
          }));
        } catch (err) {
          setApiStatus(prev => ({ ...prev, alternativeBestSelling: { error: err.message } }));
        }
        
      } catch (err) {
        console.error('Error in endpoint diagnostics:', err);
      } finally {
        setApiStatus(prev => ({ ...prev, loading: false }));
      }
    };
    
    checkEndpoints();
    
    // Run diagnostics every 60 seconds if kept open
    const interval = setInterval(checkEndpoints, 60000);
    return () => clearInterval(interval);
  }, [show]);
  
  if (!show) return null;
  
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-200';
    if (status.ok) return 'bg-green-200';
    if (status.error) return 'bg-red-200';
    return 'bg-yellow-200';
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">API Diagnostics</h3>
        <span className="text-gray-500">
          {apiStatus.loading ? 'Checking...' : 'Last checked: ' + new Date(apiStatus.timestamp).toLocaleTimeString()}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className={`p-2 rounded ${getStatusColor(apiStatus.general)}`}>
          <p className="font-semibold">General Products</p>
          {apiStatus.general ? (
            apiStatus.general.error ? 
            <p className="text-red-600">{apiStatus.general.error}</p> :
            <p>Status: {apiStatus.general.status}, Products: {apiStatus.general.hasProducts ? 'Yes' : 'No'}</p>
          ) : (
            <p>Checking...</p>
          )}
        </div>
        
        <div className={`p-2 rounded ${getStatusColor(apiStatus.featured)}`}>
          <p className="font-semibold">Featured Products</p>
          {apiStatus.featured ? (
            apiStatus.featured.error ?
            <p className="text-red-600">{apiStatus.featured.error}</p> :
            <p>Status: {apiStatus.featured.status}, Products: {apiStatus.featured.hasProducts ? 'Yes' : 'No'}</p>
          ) : (
            <p>Checking...</p>
          )}
        </div>
        
        <div className={`p-2 rounded ${getStatusColor(apiStatus.bestSelling)}`}>
          <p className="font-semibold">Best Selling</p>
          {apiStatus.bestSelling ? (
            apiStatus.bestSelling.error ?
            <p className="text-red-600">{apiStatus.bestSelling.error}</p> :
            <p>Status: {apiStatus.bestSelling.status}, Products: {apiStatus.bestSelling.hasProducts ? 'Yes' : 'No'}</p>
          ) : (
            <p>Checking...</p>
          )}
        </div>
        
        <div className={`p-2 rounded ${getStatusColor(apiStatus.alternativeBestSelling)}`}>
          <p className="font-semibold">Sort by Sales</p>
          {apiStatus.alternativeBestSelling ? (
            apiStatus.alternativeBestSelling.error ?
            <p className="text-red-600">{apiStatus.alternativeBestSelling.error}</p> :
            <p>Status: {apiStatus.alternativeBestSelling.status}, Products: {apiStatus.alternativeBestSelling.hasProducts ? 'Yes' : 'No'}</p>
          ) : (
            <p>Checking...</p>
          )}
        </div>
      </div>
      
      {apiStatus.network && (
        <div className="mt-2 p-2 rounded bg-gray-100">
          <p className="font-semibold">Network: {apiStatus.network.effectiveType || 'unknown'}</p>
          {apiStatus.network.downlink && (
            <p>Bandwidth: {apiStatus.network.downlink} Mbps</p>
          )}
          {apiStatus.network.saveData && (
            <p className="text-orange-500">Data Saver: ON</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileDiagnostics;
