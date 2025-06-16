import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { sanitizeApiUrl } from '../utils/apiUrlHelper';

const ApiDebugger = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const testApiEndpoints = async () => {
      const testResults = {};
      setLoading(true);
      
      // Get environment variables
      testResults.envVars = {
        REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'Not set',
        REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'Not set',
        NODE_ENV: process.env.NODE_ENV || 'Not set'
      };
      
      // Test multiple URL configurations
      const apiUrls = [
        process.env.REACT_APP_API_URL || 'https://manish-steel-api.onrender.com/api',
        'https://manish-steel-api.onrender.com/api',
        sanitizeApiUrl(process.env.REACT_APP_API_URL || 'https://manish-steel-api.onrender.com/api')
      ];
      
      testResults.urlTests = [];
      
      for (const url of apiUrls) {
        const baseUrl = url.replace('/api', '');
        
        try {
          // Test health endpoint
          console.log(`Testing health endpoint at: ${baseUrl}/health`);
          const sanitizedHealthUrl = sanitizeApiUrl(`${baseUrl}/health`);
          console.log(`Sanitized health URL: ${sanitizedHealthUrl}`);
          
          try {
            const healthResponse = await axios.get(sanitizedHealthUrl, { timeout: 5000 });
            testResults.urlTests.push({
              url: sanitizedHealthUrl,
              status: healthResponse.status,
              success: true
            });
          } catch (error) {
            console.error(`Health check failed for ${sanitizedHealthUrl}:`, error);
            testResults.urlTests.push({
              url: sanitizedHealthUrl,
              error: error.message,
              success: false
            });
          }
          
          // Test products endpoint
          console.log(`Testing products endpoint at: ${url}/products?limit=1`);
          const sanitizedProductsUrl = sanitizeApiUrl(`${url}/products?limit=1`);
          console.log(`Sanitized products URL: ${sanitizedProductsUrl}`);
          
          try {
            const productsResponse = await axios.get(sanitizedProductsUrl, { timeout: 5000 });
            testResults.urlTests.push({
              url: sanitizedProductsUrl,
              status: productsResponse.status,
              products: productsResponse.data.products ? productsResponse.data.products.length : 0,
              success: true
            });
          } catch (error) {
            console.error(`Products check failed for ${sanitizedProductsUrl}:`, error);
            testResults.urlTests.push({
              url: sanitizedProductsUrl,
              error: error.message,
              success: false
            });
          }
          
          // Test featured products endpoint
          console.log(`Testing featured products endpoint at: ${url}/products/featured?limit=1`);
          const sanitizedFeaturedUrl = sanitizeApiUrl(`${url}/products/featured?limit=1`);
          console.log(`Sanitized featured URL: ${sanitizedFeaturedUrl}`);
          
          try {
            const featuredResponse = await axios.get(sanitizedFeaturedUrl, { timeout: 5000 });
            testResults.urlTests.push({
              url: sanitizedFeaturedUrl,
              status: featuredResponse.status,
              products: featuredResponse.data.products ? featuredResponse.data.products.length : 0,
              success: true
            });
          } catch (error) {
            console.error(`Featured products check failed for ${sanitizedFeaturedUrl}:`, error);
            testResults.urlTests.push({
              url: sanitizedFeaturedUrl,
              error: error.message,
              success: false
            });
          }
          
        } catch (error) {
          console.error(`Error testing URL ${url}:`, error);
          testResults.urlTests.push({
            url: url,
            error: error.message,
            success: false
          });
        }
      }
      
      setResults(testResults);
      setLoading(false);
    };
    
    testApiEndpoints();
  }, []);
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">API Connection Debugger</h2>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-lg">Testing API connections...</p>
        </div>
      ) : (
        <div>
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Environment Variables</h3>
            <div className="bg-gray-100 p-4 rounded">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(results.envVars, null, 2)}
              </pre>
            </div>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-2">API Endpoint Tests</h3>
            {results.urlTests && results.urlTests.map((test, index) => (
              <div key={index} className={`p-4 mb-3 rounded ${test.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex justify-between items-center">
                  <p className="font-medium">{test.url}</p>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${test.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {test.success ? 'SUCCESS' : 'FAILED'}
                  </span>
                </div>
                {test.success ? (
                  <div className="mt-2 text-sm">
                    <p>Status: {test.status}</p>
                    {test.products !== undefined && (
                      <p>Products: {test.products}</p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-red-600">{test.error}</p>
                )}
              </div>
            ))}
          </section>
        </div>
      )}
    </div>
  );
};

export default ApiDebugger;
