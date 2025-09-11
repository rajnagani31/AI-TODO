// src/components/ChangePassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './auth.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else {
      // Password validation pattern (same as your Django backend)
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#^~+=\(\)\-]{8,25}$/;
      if (!passwordPattern.test(formData.new_password)) {
        newErrors.new_password = 'Password must be 8 to 25 characters long and must contain at least one uppercase letter, one lowercase letter, one numeric digit, and one special character.';
      }
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your new password';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'New password and confirm password must be same';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');
    setErrors({});

    try {
      const result = await apiService.changePassword(formData);

      if (result.success) {
        setMessage('Password changed successfully! Redirecting to dashboard...');
        setFormData({ new_password: '', confirm_password: '' });
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setMessage(result.error || 'Failed to change password');
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
      console.error('Change password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="register-container">
        <h2>Change Password</h2>
        <form onSubmit={handleSubmit} noValidate>
          {/* New Password Field */}
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              name="new_password"
              className={`form-control ${errors.new_password ? 'is-invalid' : ''}`}
              placeholder="Enter your new password"
              value={formData.new_password}
              onChange={handleChange}
              required
            />
            {errors.new_password && (
              <div className="invalid-feedback">{errors.new_password}</div>
            )}
            <div className="form-text">
              Password must contain 8-25 characters with at least one uppercase, lowercase, digit, and special character.
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              name="confirm_password"
              className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`}
              placeholder="Confirm your new password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
            {errors.confirm_password && (
              <div className="invalid-feedback">{errors.confirm_password}</div>
            )}
          </div>

          {/* Error/Success Messages */}
          {message && (
            <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
              {message}
            </div>
          )}

          {/* Buttons */}
          <div className="d-grid gap-2">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>

          <div className="text-center mt-3">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;