// src/components/TaskModal.jsx
import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import './modal.css';

const TaskModal = ({ User_Task, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Medium',
    status: 'Today',       // ✅ added default status
    completed: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (User_Task) {
      setFormData({
        title: User_Task.User_Task || '',
        description: User_Task.descri || '',
        due_date: User_Task.date_time ? User_Task.date_time.split('T')[0] : '',
        priority: User_Task.priority || 'Medium',
        status: User_Task.status || 'Today',
        completed: User_Task.is_complete || false
      });
    }
  }, [User_Task]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;

      // 🔥 Map frontend fields to Django model fields
      const taskData = {
        User_Task: formData.title,
        descri: formData.description,
        priority: formData.priority,
        status: formData.status,
        is_complete: formData.completed
        // ⚠️ date_time is auto_now_add in Django, no need to send
      };

      if (User_Task) {
        // Update existing task
        result = await apiService.updateTask(User_Task.id, taskData);
      } else {
        // Create new task
        result = await apiService.createTask(taskData);
      }

      if (result.success) {
        onSave(result.data.data || { ...taskData, id: Date.now() });
      } else {
        setError(result.error || 'Failed to save task');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{User_Task ? 'Edit Task' : 'Add New Task'}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title Field */}
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="Enter task title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description Field */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="4"
                placeholder="Enter task description (optional)"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Status Field ✅ */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Today">Today</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="Advance">Advance</option>
              </select>
            </div>

            {/* Due Date Field */}
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                name="due_date"
                className="form-control"
                value={formData.due_date}
                onChange={handleChange}
              />
            </div>

            {/* Priority Field */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                name="priority"
                className="form-control"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Completed Checkbox (only for edit) */}
            {User_Task && (
              <div className="form-group">
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="completed"
                    className="form-check-input"
                    checked={formData.completed}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">
                    Mark as completed
                  </label>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (User_Task ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
