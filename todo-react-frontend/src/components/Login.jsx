// src/components/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (apiService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage('');
    setErrors({});

    try {
      const result = await apiService.login({
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        setMessage('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setMessage(result.error || 'Login failed');
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>
            <i className="fas fa-user-circle icon"></i> Welcome Back
          </h2>
          <p>Please sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="input-group mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          {/* Password Field */}
          <div className="input-group mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          {/* Error/Success Messages */}
          {message && (
            <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary btn-login w-100"
            disabled={loading}
          >
            <i className="fas fa-sign-in-alt"></i> 
            {loading ? ' Signing In...' : ' Sign In'}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center mt-3">
            <Link to="/change-password" className="text-muted">
              Forgot your password?
            </Link>
          </div>
        </form>

        {/* Sign Up Link */}
        <div className="signup-link">
          <p className="mb-0">
            Don't have an account? 
            <Link to="/register">
              <i className="fas fa-user-plus"></i> Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
