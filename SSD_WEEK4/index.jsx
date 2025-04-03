// src/contexts/AuthContext.js - Authentication Context

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Configure axios with token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user profile
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);
  
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/profile`);
      setUser(response.data);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
      setLoading(false);
    }
  };
  
  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post(`${API_URL}/login`, { 
        username, 
        password 
      });
      
      const { access_token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', access_token);
      
      // Configure axios with token
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Update state
      setUser(user);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.error || 'Failed to login');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (username, email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      await axios.post(`${API_URL}/register`, {
        username,
        email,
        password
      });
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.error || 'Failed to register');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove Authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };
  
  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    register,
    logout,
    setError
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// src/layouts/MainLayout.js - Main Application Layout

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Icons
import { 
  FaHome, FaUser, FaTwitter, FaGlobe, FaEnvelope, 
  FaMapMarkerAlt, FaCode, FaFileAlt, FaShieldAlt, FaSignOutAlt 
} from 'react-icons/fa';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-gray-800 text-white ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out`}>
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen ? (
            <h1 className="text-2xl font-bold">OSINT Hub</h1>
          ) : (
            <h1 className="text-2xl font-bold">OH</h1>
          )}
          <button 
            onClick={toggleSidebar} 
            className="text-white focus:outline-none"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>
        
        <nav className="mt-8">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex items-center py-3 px-4 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
            }
          >
            <FaHome className="mr-3" />
            {isSidebarOpen && <span>Dashboard</span>}
          </NavLink>
          
          <NavLink 
            to="/profile" 
            className={({ isActive }) => 
              `flex items-center py-3 px-4 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
            }
          >
            <FaUser className="mr-3" />
            {isSidebarOpen && <span>Profile</span>}
          </NavLink>
          
          <div className="py-2 px-4 text-gray-400 uppercase text-xs font-semibold">
            {isSidebarOpen && <span>OSINT Tools</span>}
          </div>
          
          <NavLink 
            to="/social-intelligence" 
            className={({ isActive }) => 
              `flex items-center py-3 px-4 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
            }
          >
            <FaTwitter className="mr-3" />
            {isSidebarOpen && <span>Social Media</span>}
          </NavLink>
          
          <NavLink 
            to="/ip-domain" 
            className={({ isActive }) => 
              `flex items-center py-3 px-4 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
            }
          >
            <FaGlobe className="mr-3" />
            {isSidebarOpen && <span>IP & Domain</span>}
          </NavLink>
          
          <NavLink 
            to="/email-phone" 
            className={({ isActive }) => 
              `flex items-center py-3 px-4 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
            }
          >
            <FaEnvelope className="mr-3" />
            {isSidebarOpen && <span>Email & Phone</span>}
          </NavLink>
          
          <NavLink 
            to="/geolocation" 
            className={({ isActive }) => 
              `flex items-center py-3 px-4 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
            }
          >
            <FaMapMarkerAlt className="mr-3" />
            {isSidebarOpen && <span>Geolocation</span>}
          </NavLink>
          
          <NavLink 
            to="/web-scraping" 
            className={({ isActive }) => 
              `flex items-center py-3 px-4 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
            }
          >
            <FaCode className="mr-3" />
            {isSidebarOpen && <span>Web Scraping</span>}
          </NavLink>
          
          <div className="py-2 px-4 text-gray-400 uppercase text-xs font-semibold">
            {isSidebarOpen && <span>Reports</span>}
          </div>
          
          <NavLink 
            to="/reports" 
            className={({ isActive }) => 
              `flex items-center py-3 px-4 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
            }
          >
            <FaFileAlt className="mr-3" />
            {isSidebarOpen && <span>Reports</span>}
          </NavLink>
          
          {user && user.role === 'admin' && (
            <>
              <div className="py-2 px-4 text-gray-400 uppercase text-xs font-semibold">
                {isSidebarOpen && <span>Admin</span>}
              </div>
              
              <NavLink 
                to="/admin" 
                className={({ isActive }) => 
                  `flex items-center py-3 px-4 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
                }
              >
                <FaShieldAlt className="mr-3" />
                {isSidebarOpen && <span>Admin Panel</span>}
              </NavLink>
            </>
          )}
        </nav>
        
        <div className="absolute bottom-0 w-full">
          <button 
            onClick={handleLogout} 
            className="flex items-center py-3 px-4 w-full hover:bg-gray-700"
          >
            <FaSignOutAlt className="mr-3" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              OSINT Investigation Hub
            </h2>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {user && `Welcome, ${user.username}`}
              </span>
              <img
                className="h-8 w-8 rounded-full bg-gray-300"
                src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`}
                alt="User avatar"
              />
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white shadow-inner py-3 px-6">
          <div className="max-w-7xl mx-auto text-gray-500 text-sm">
            OSINT Investigation Hub &copy; {new Date().getFullYear()} - Secure OSINT Analytics Platform
          </div>
        </footer>
      </div>
    </div>
  );
};

// src/layouts/AuthLayout.js - Authentication Layout

import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800">OSINT Investigation Hub</h1>
            <p className="text-gray-600 mt-2">Open Source Intelligence Platform</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <Outlet />
          </div>
        </div>
      </div>
      
      <div className="hidden md:block md:w-1/2 bg-blue-900 flex items-center justify-center">
        <div className="max-w-md text-white p-8">
          <h2 className="text-4xl font-bold mb-6">Advanced OSINT Tools for Security Professionals</h2>
          <ul className="space-y-4">
            <li className="flex items-center">
              <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Social Media Intelligence
            </li>
            <li className="flex items-center">
              <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              IP & Domain Analysis
            </li>
            <li className="flex items-center">
              <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Email & Phone OSINT
            </li>
            <li className="flex items-center">
              <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Geolocation Mapping
            </li>
            <li className="flex items-center">
              <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Web Scraping for OSINT
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// src/pages/Login.js - Login Page

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, setError, loading } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Login to your Account</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
          
          <Link
            to="/register"
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
          >
            Create Account
          </Link>
        </div>
      </form>
    </div>
  );
};

// src/pages/Register.js - Registration Page

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, error, setError, loading } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous errors
    setError(null);
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setError('Username must be 3-20 characters and contain only letters, numbers, and underscores');
      return;
    }
    
    const success = await register(username, email, password);
    if (success) {
      navigate('/login', { state: { message: 'Registration successful. Please log in.' } });
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268