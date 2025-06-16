import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApiHealthCheck = ({ onStatusChange }) => {
  const [apiStatus, setApiStatus] = useState('checking');
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        // Get the current API URL being used
        const currentApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        setApiUrl(currentApiUrl);
        
        // Fix any malformed URLs
        let baseUrl = currentApiUrl.replace('/api', '');
        
        // Ensure properly formatted URL
        if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
          baseUrl = `https://${baseUrl}`;
        }
        
        // Fix double slashes in the URL (except after protocol)
        baseUrl = baseUrl.replace(/([^:])\/\//g, '$1/');
        
        console.log('API Health Check using URL:', `${baseUrl}/health`);
        
        // Try to connect to the health endpoint
        const response = await axios.get(`${baseUrl}/health`, { 
          timeout: 5000 
        });
        
        if (response.status === 200) {
          setApiStatus('connected');
          if (onStatusChange) onStatusChange('connected');
        } else {
          setApiStatus('error');
          if (onStatusChange) onStatusChange('error');
        }
      } catch (error) {
        console.error('API connection check failed:', error);
        setApiStatus('disconnected');
        if (onStatusChange) onStatusChange('disconnected');
      }
    };

    checkApiHealth();
  }, [onStatusChange]);

  // Don't render anything visible by default
  return (
    <div style={{ display: 'none' }} data-testid="api-health-check">
      {/* Only show this in development */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            padding: '5px',
            borderRadius: '3px',
            fontSize: '12px',
            background: apiStatus === 'connected' ? '#dff2bf' : '#ffcccb',
            color: apiStatus === 'connected' ? '#4f8a10' : '#d8000c',
            zIndex: 9999
          }}
        >
          API: {apiStatus} ({apiUrl})
        </div>
      )}
    </div>
  );
};

export default ApiHealthCheck;
