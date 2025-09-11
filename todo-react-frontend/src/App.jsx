// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ChangePassword from './components/ChangePassword';
import ProtectedRoute from './components/ProtectedRoute';
import apiService from './services/apiService';

// Import CSS
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              apiService.isAuthenticated() ? 
              <Navigate to="/dashboard" replace /> : 
              <Login />
            } 
          />
          <Route 
            path="/register" 
            element={
              apiService.isAuthenticated() ? 
              <Navigate to="/dashboard" replace /> : 
              <Register />
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/change-password" 
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={
              <Navigate 
                to={apiService.isAuthenticated() ? "/dashboard" : "/login"} 
                replace 
              />
            } 
          />
          
          {/* 404 fallback */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;