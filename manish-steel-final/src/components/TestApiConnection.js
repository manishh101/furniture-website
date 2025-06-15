import React, { useEffect, useState } from 'react';
import { productAPI } from '../services/productService';

const TestApiConnection = () => {
  const [status, setStatus] = useState('Testing...');

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('🧪 Testing API connection...');
        const response = await productAPI.getAllProducts({ limit: 1 });
        console.log('✅ API test response:', response);
        setStatus(`✅ API working! Got ${response.data?.products?.length || 0} products`);
      } catch (error) {
        console.error('❌ API test failed:', error);
        setStatus(`❌ API failed: ${error.message}`);
      }
    };
    
    testApi();
  }, []);

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px', borderRadius: '8px' }}>
      <h3>🧪 API Connection Test</h3>
      <p>{status}</p>
    </div>
  );
};

export default TestApiConnection;
