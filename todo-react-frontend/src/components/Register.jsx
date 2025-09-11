// src/components/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (!formData.username.trim()) newErrors.username = 'Username is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
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
      const result = await apiService.register(formData);

      if (result.success) {
        setMessage('Registration successful! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        if (typeof result.error === 'object') {
          setErrors(result.error);
        } else {
          setMessage(result.error || 'Registration failed');
        }
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="register-container">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && (
              <div className="invalid-feedback">{errors.username}</div>
            )}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <small
              className="text-muted"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide password' : 'Show password'}
            </small>
            {errors.password && (
              <div className="invalid-feedback">{errors.password}</div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirm_password"
              className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`}
              placeholder="Confirm your password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
            <small
              className="text-muted"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? 'Hide password' : 'Show password'}
            </small>
            {errors.confirm_password && (
              <div className="invalid-feedback">{errors.confirm_password}</div>
            )}
          </div>

          {/* Error/Success Message */}
          {message && (
            <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
              {message}
            </div>
          )}

          {/* Submit */}
          <div className="d-grid gap-2">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          {/* Login link */}
          <div className="text-center mt-3">
            <p>Or</p>
            <Link to="/login">
              <button type="button" className="btn btn-secondary">
                Login
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
