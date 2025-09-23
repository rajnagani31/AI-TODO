import React, { useState } from 'react';
import ApiService from '../services/apiService';

const EditTaskForm = ({ task, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    date_time: task.date_time || '',
    // Add other fields as needed
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Retry helper for 429 responses (exponential backoff)
  const retryWithBackoff = async (fn, retries = 3, delay = 500) => {
    try {
      return await fn();
    } catch (err) {
      if (retries === 0) throw err;
      await new Promise((r) => setTimeout(r, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const doUpdate = async () => {
      const result = await ApiService.updateTask(task.id, formData);
      if (!result.success) {
        // If 429 return, throw to be retried
        if (result.status === 429) {
          const err = new Error(result.error || 'Too many requests');
          err.status = 429;
          throw err;
        }
        // Non-retriable error: return result for handling
        return result;
      }
      return result;
    };

    try {
      const result = await retryWithBackoff(doUpdate, 3, 500);

      if (!result.success) {
        setError(result.error || 'Failed to update task');
        setSaving(false);
        return;
      }

      // success
  onUpdate(result.data || result.raw || result);
      setSaving(false);
    } catch (err) {
      setError(err.message || 'Failed after retries');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Title"
        disabled={saving}
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        disabled={saving}
      />
      <input
        type="date"
        name="date_time"
        value={formData.date_time}
        onChange={handleChange}
        placeholder="Due Date"
        disabled={saving}
        style={{ marginTop: '8px', marginBottom: '8px' }}
      />
      {/* Add other fields as needed */}
      <button type="submit" disabled={saving}>{saving ? 'Updating...' : 'Update Task'}</button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  );
};

export default EditTaskForm;
