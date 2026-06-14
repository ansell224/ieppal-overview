import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '../apiClient';
import { useNavigate } from 'react-router-dom';
import { setAuthLogout } from '../authLogoutBridge';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on app load
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const logout = (reason = 'session_expired') => {
    console.warn('Logging out:', reason);

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);

    // HARD redirect (router-independent, bulletproof)
    window.location.href = `/login?reason=${encodeURIComponent(reason)}`;
  };

  // Register logout handler for API interceptor
  useEffect(() => {
    setAuthLogout(logout);
  }, []);
  
  const login = async (email, password) => {
    try {
      const result = await apiClient.login(email, password);
      
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      setUser(result.user);
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password, name, role = 'TEACHER') => {
    try {
      const result = await apiClient.register(email, password, name, role);
      return result;
    } catch (error) {
      throw error;
    }
  };

/*   const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };
 */

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};