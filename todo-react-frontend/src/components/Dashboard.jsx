// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import TaskModal from './TaskModal';
import './dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [apiMessage, setApiMessage] = useState('');

  useEffect(() => {
    // Redirect if not authenticated
    if (!apiService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    loadTasks();
  }, [navigate]);

  useEffect(() => {
    filterTasks();
  }, [tasks, currentFilter]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const result = await apiService.getTasks();
      if (result.success) {
  const items = result.data || result.raw || [];
        setTasks(items);
        setFilteredTasks(items);
      } else {
        console.error('Failed to load tasks:', result.error);
        // If token is invalid, redirect to login
        if (result.error && result.error.includes('token')) {
          handleLogout();
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Normalize API payload into an array for UI consumption
  const normalizeToArray = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    // Some endpoints may return { data: [...] } or { results: [...] }
    if (payload.data && Array.isArray(payload.data)) return payload.data;
    if (payload.results && Array.isArray(payload.results)) return payload.results;
    // If it's an object representing a single task, wrap it
    if (typeof payload === 'object') return [payload];
    return [];
  };

  const filterTasks = () => {
    let filtered = [...tasks];
    switch (currentFilter) {
      case 'today':
        const today = new Date().toDateString();
        filtered = tasks.filter(User_Task => {
          const dt = User_Task.date_time || User_Task.due_date || User_Task.created_at;
          if (!dt) return false;
          const d = new Date(dt);
          return !isNaN(d) && d.toDateString() === today;
        });
        break;
      case 'pending':
        filtered = tasks.filter(User_Task => {
          if ('is_complete' in User_Task) return !User_Task.is_complete;
          if ('completed' in User_Task) return !User_Task.completed;
          const status = String(User_Task.status || '').toLowerCase();
          if (status) return status !== 'completed';
          return true;
        });
        break;
      case 'completed':
        // Show all tasks returned by completed-task API, regardless of status
        filtered = tasks;
        break;
      case 'advance':
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = tasks.filter(User_Task => {
          const status = String(User_Task.status || '').toLowerCase();
          if (status === 'advance') return true;
          const dt = User_Task.date_time || User_Task.due_date;
          if (!dt) return false;
          const taskDate = new Date(dt);
          return !isNaN(taskDate) && taskDate >= tomorrow;
        });
        break;
      default:
        filtered = tasks;
    }
    setFilteredTasks(filtered);
  };

  // New: Fetch all tasks from API when 'All Tasks' button is clicked
  const handleAllTasksClick = async () => {
    setCurrentFilter('all');
    setLoading(true);
    try {
      const result = await apiService.getTasks();
      if (result.success) {
        setApiMessage('');
        const items = normalizeToArray(result.data || result.raw);
        setTasks(items);
        setFilteredTasks(items);
      } else {
        if (result.status === 404) {
          setTasks([]);
          setFilteredTasks([]);
        }
        console.error('Failed to load tasks:', result.error);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // API-backed filter handlers
  const handleTodayTasksClick = async () => {
    setCurrentFilter('today');
    setLoading(true);
    try {
      const result = await apiService.getTodayTasks();
      if (result.success) {
        setApiMessage('');
        const items = normalizeToArray(result.data || result.raw);
        setTasks(items);
        setFilteredTasks(items);
      } else {
        console.error('Failed to load today tasks:', result.error);
      }
    } catch (error) {
      console.error('Error loading today tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceTasksClick = async () => {
    setCurrentFilter('advance');
    setLoading(true);
    try {
      const result = await apiService.getAdvanceTasks();
      if (result.success) {
        setApiMessage('');
        const items = normalizeToArray(result.data || result.raw);
        setTasks(items);
        setFilteredTasks(items);
      } else {
        console.error('Failed to load advance tasks:', result.error);
      }
    } catch (error) {
      console.error('Error loading advance tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePendingTasksClick = async () => {
    setCurrentFilter('pending');
    setLoading(true);
    try {
      const result = await apiService.getPendingTasks();
      if (result.success) {
        // pending endpoint may return values directly
        // If backend returns a message (e.g. {status:200, massage:{Message:...}}), show it
        if (result.raw && result.raw.massage && result.raw.massage.Message) {
          setTasks([]);
          setFilteredTasks([]);
          setApiMessage(result.raw.massage.Message);
        } else {
          setApiMessage('');
          let items = normalizeToArray(result.data || result.raw);
          // map backend values() output to the UI's expected task shape
          items = items.map(i => ({
            id: i.id,
            User_Task: i.User_Task || i.title || i.name || '',
            descri: i.descri || i.description || i.desc || '',
            date_time: i.date_time || i.due_date || null,
            priority: i.priority || 'Medium',
            status: i.status || 'Pending',
            is_complete: ('is_complete' in i) ? i.is_complete : (i.completed || false),
          }));

          setTasks(items);
          setFilteredTasks(items);
        }
      } else {
        console.error('Failed to load pending tasks:', result.error);
      }
    } catch (error) {
      console.error('Error loading pending tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletedTasksClick = async () => {
    setCurrentFilter('completed');
    setLoading(true);
    try {
      const result = await apiService.getCompletedTasks();
      if (result.success) {
        // Show API message if present
        if (result.raw && result.raw.message) {
          setApiMessage(result.raw.message);
        } else if (result.raw && result.raw.Message) {
          setApiMessage(result.raw.Message);
        } else {
          setApiMessage('');
        }
        const items = normalizeToArray(result.data || result.raw);
        setTasks(items);
        setFilteredTasks(items);
      } else {
        setApiMessage(result.error || 'Failed to load completed tasks');
        console.error('Failed to load completed tasks:', result.error);
      }
    } catch (error) {
      console.error('Error loading completed tasks:', error);
      setApiMessage('Error loading completed tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (User_Task) => {
    setEditingTask(User_Task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this User_Task?')) {
      return;
    }

    try {
      const result = await apiService.deleteTask(taskId);
      if (result.success) {
        setTasks(prev => prev.filter(User_Task => User_Task.id !== taskId));
        setFilteredTasks(prev => prev.filter(User_Task => User_Task.id !== taskId));
      } else {
        alert('Failed to delete User_Task');
      }
    } catch (error) {
      console.error('Error deleting User_Task:', error);
      alert('Error deleting User_Task');
    }
  };

  const handleCompleteTask = async (User_Task) => {
    try {
      const result = await apiService.completeTask(User_Task.id);
      if (result.success) {
        const updated = result.data || result.raw || { ...User_Task, is_complete: !User_Task.is_complete };
        setTasks(prev => prev.map(t => t.id === User_Task.id ? updated : t));
        setFilteredTasks(prev => prev.map(t => t.id === User_Task.id ? updated : t));
        // Show API message if present
        if (result.raw && result.raw.message) {
          setApiMessage(result.raw.message);
        } else if (result.raw && result.raw.Message) {
          setApiMessage(result.raw.Message);
        } else {
          setApiMessage('Task status updated successfully.');
        }
      } else {
        setApiMessage(result.error || 'Failed to update User_Task');
      }
    } catch (error) {
      console.error('Error updating User_Task:', error);
      setApiMessage('Error updating User_Task');
    }
  };

  const handleTaskSaved = async (savedTask) => {
    if (editingTask) {
      // Update existing User_Task
      setTasks(prev => prev.map(User_Task => User_Task.id === savedTask.id ? savedTask : User_Task));
      setFilteredTasks(prev => prev.map(User_Task => User_Task.id === savedTask.id ? savedTask : User_Task));
    } else {
      // Add new User_Task
      setTasks(prev => [...prev, savedTask]);
      setFilteredTasks(prev => [...prev, savedTask]);
    }
    setShowTaskModal(false);
    // Redirect to Today Task after creating
    setCurrentFilter('today');
    setLoading(true);
    try {
      const result = await apiService.getTodayTasks();
      if (result.success) {
        setApiMessage('');
        const items = normalizeToArray(result.data || result.raw);
        setTasks(items);
        setFilteredTasks(items);
      } else {
        setApiMessage(result.error || 'Failed to load today tasks');
      }
    } catch (error) {
      setApiMessage('Error loading today tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard" data-theme={theme}>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-left">
          <button 
            className={`menu-btn ${sidebarOpen ? 'open' : ''}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="menu-icon">{sidebarOpen ? '✕' : '☰'}</span>
          </button>
          <div className="logo">AI User_Task Manager</div>
        </div>
        <div className="navbar-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </button>
          {/*
          <div className="user-avatar" onClick={handleLogout} title="Logout">
            U
          </div>
          */}
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">Navigation</div>
          <div className="sidebar-subtitle">Manage your tasks</div>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span className="nav-icon">📋</span>
            Tasks
          </button>
          <button 
            className="nav-item"
            onClick={() => navigate('/change-password')}
          >
            <span className="nav-icon">🔒</span>
            Change Password
          </button>
          <button className="nav-item" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </nav>
      </aside>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? 'shifted' : ''}`}>
        <div className="content-header">
          <h1 className="page-title">Tasks</h1>
          <button className="add-User_Task-btn" onClick={handleAddTask}>
            + Add New Task
          </button>
        </div>

        {/* User_Task Filters */}
        <div className="User_Task-filters">
          <button 
            className={`filter-btn ${currentFilter === 'today' ? 'active' : ''}`}
            onClick={handleTodayTasksClick}
          >
            Today Task
          </button>
          <button 
            className={`filter-btn ${currentFilter === 'advance' ? 'active' : ''}`}
            onClick={handleAdvanceTasksClick}
          >
            Advance Task
          </button>
          <button 
            className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
            onClick={handleAllTasksClick}
          >
            All Task
          </button>
          <button 
            className={`filter-btn ${currentFilter === 'pending' ? 'active' : ''}`}
            onClick={handlePendingTasksClick}
          >
            Un-complete Task
          </button>
          <button 
            className={`filter-btn ${currentFilter === 'completed' ? 'active' : ''}`}
            onClick={handleCompletedTasksClick}
          >
            Complete Task
          </button>
        </div>

        {/* API Message */}
        {apiMessage && (
          <div className="api-message" style={{ marginBottom: '16px', color: '#4a90e2', fontWeight: 'bold' }}>
            {apiMessage}
          </div>
        )}
        {/* User_Task List */}
        <div className="User_Task-list">
          {filteredTasks.length === 0 ? (
            <div className="no-tasks">
              <p>{apiMessage ? apiMessage : 'No tasks found for the selected filter.'}</p>
            </div>
          ) : (
            filteredTasks.map((task, index) => {
              // Un-complete Task: remove Complete button
              if (currentFilter === 'pending') {
                return (
                  <div
                    key={task.id}
                    className={`User_Task-card${task.status === 'Completed' ? ' completed-card' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="User_Task-header">
                      <div>
                        <div className={`User_Task-title${task.status === 'Completed' ? ' completed' : ''}`}> 
                          {task.User_Task}
                        </div>
                        <div className="User_Task-meta">
                          <span>Due: {formatDate(task.date_time)}</span>
                          <span>Priority: {task.priority || 'Medium'}</span>
                          <span>Status: {task.status}</span>
                        </div>
                      </div>
                      <div className="User_Task-actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditTask(task)}
                          aria-label="Edit Task"
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteTask(task.id)}
                          aria-label="Delete Task"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {task.descri && (
                      <div className="User_Task-description">
                        {task.descri}
                      </div>
                    )}
                  </div>
                );
              }
              // Complete Task: remove Edit and Complete buttons
              if (currentFilter === 'completed') {
                return (
                  <div
                    key={task.id}
                    className={`User_Task-card completed-card`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="User_Task-header">
                      <div>
                        <div className="User_Task-title completed">{task.User_Task}</div>
                        <div className="User_Task-meta">
                          <span>Due: {formatDate(task.date_time)}</span>
                          <span>Priority: {task.priority || 'Medium'}</span>
                          <span>Status: {task.status}</span>
                        </div>
                      </div>
                      {/* No actions for completed list */}
                      <div className="User_Task-actions"></div>
                    </div>
                    {task.descri && (
                      <div className="User_Task-description">
                        {task.descri}
                      </div>
                    )}
                  </div>
                );
              }
              // Default: show all buttons
              return (
                <div
                  key={task.id}
                  className={`User_Task-card${task.status === 'Completed' ? ' completed-card' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="User_Task-header">
                    <div>
                      <div className={`User_Task-title${task.status === 'Completed' ? ' completed' : ''}`}> 
                        {task.User_Task}
                      </div>
                      <div className="User_Task-meta">
                        <span>Due: {formatDate(task.date_time)}</span>
                        <span>Priority: {task.priority || 'Medium'}</span>
                        <span>Status: {task.status}</span>
                      </div>
                    </div>
                    <div className="User_Task-actions">
                      <button
                        className="action-btn complete-btn"
                        onClick={() => handleCompleteTask(task)}
                        aria-label={task.status === 'Completed' ? 'Undo Task' : 'Complete Task'}
                      >
                        {task.status === 'Completed' ? 'Undo' : 'Complete'}
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditTask(task)}
                        aria-label="Edit Task"
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteTask(task.id)}
                        aria-label="Delete Task"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {task.descri && (
                    <div className="User_Task-description">
                      {task.descri}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* User_Task Modal */}
      {showTaskModal && (
        <TaskModal
          User_Task={editingTask}
          onSave={handleTaskSaved}
          onClose={() => setShowTaskModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;