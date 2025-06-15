import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      console.log('=== ProtectedRoute Authentication Check ===');
      
      const token = localStorage.getItem('manish_steel_auth_token');
      const userData = localStorage.getItem('manish_steel_user_data');
      const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
      const isAuthenticatedFlag = localStorage.getItem('isAuthenticated') === 'true';
      
      console.log('ProtectedRoute storage check:', { 
        hasToken: !!token, 
        hasUserData: !!userData,
        tokenLength: token ? token.length : 0,
        isAdminLoggedIn, 
        isAuthenticatedFlag
      });

      // Check if actually authenticated through the service
      const authenticated = authService.isAuthenticated();
      console.log('AuthService authentication result:', authenticated);
      
      if (!authenticated) {
        console.warn('ProtectedRoute: Not authenticated. Clearing stale data and redirecting.');
        // Clear any stale auth flags
        authService.logout();
      } else {
        console.log('ProtectedRoute: Authentication successful, allowing access');
      }
      
      setIsAuthenticated(authenticated);
      setIsChecking(false);
    };

    checkAuthentication();
  }, []);

  if (isChecking) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    console.warn('Access denied: Not authenticated. Redirecting to login page.');
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
