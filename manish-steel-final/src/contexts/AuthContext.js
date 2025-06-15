/**
 * Authentication Context
 * Manages user authentication state across the application
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/authService';
import { jwtDecode } from 'jwt-decode';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data on mount or token change
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Check if token is expired
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Token expired, logout user
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }

        // Get user data
        const res = await authAPI.getCurrentUser();
        setUser(res.data);
        setError(null);
      } catch (err) {
        console.error('Auth error:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setError('Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await authAPI.login(email, password);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setError(null);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.msg || 
        err.response?.data?.errors?.[0]?.msg || 
        'Login failed'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;
  
  // Check if user is admin
  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
