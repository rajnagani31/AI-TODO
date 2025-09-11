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
        setTasks(result.data.data || []);
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

  const filterTasks = () => {
    let filtered = [...tasks];
    switch (currentFilter) {
      case 'today':
        const today = new Date().toDateString();
        filtered = tasks.filter(User_Task => {
          const taskDate = new Date(User_Task.due_date || User_Task.created_at).toDateString();
          return taskDate === today;
        });
        break;
      case 'pending':
        filtered = tasks.filter(User_Task => !User_Task.completed);
        break;
      case 'completed':
        filtered = tasks.filter(User_Task => User_Task.completed);
        break;
      case 'advance':
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = tasks.filter(User_Task => {
          if (User_Task.due_date) {
            const taskDate = new Date(User_Task.due_date);
            return taskDate >= tomorrow;
          }
          return false;
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
        setTasks(result.data.data || []);
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
      const updatedTask = { ...User_Task, completed: !User_Task.completed };
      const result = await apiService.updateTask(User_Task.id, updatedTask);
      
      if (result.success) {
        setTasks(prev => 
          prev.map(t => t.id === User_Task.id ? updatedTask : t)
        );
      } else {
        alert('Failed to update User_Task');
      }
    } catch (error) {
      console.error('Error updating User_Task:', error);
      alert('Error updating User_Task');
    }
  };

  const handleTaskSaved = (savedTask) => {
    if (editingTask) {
      // Update existing User_Task
      setTasks(prev => 
        prev.map(User_Task => User_Task.id === savedTask.id ? savedTask : User_Task)
      );
    } else {
      // Add new User_Task
      setTasks(prev => [...prev, savedTask]);
    }
    setShowTaskModal(false);
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
          {/*
          <button className="nav-item" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Logout
          </button>
          */}
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
            + Add User_Task
          </button>
        </div>

        {/* User_Task Filters */}
        <div className="User_Task-filters">
          <button 
            className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
            onClick={handleAllTasksClick}
          >
            All Tasks
          </button>
          <button 
            className={`filter-btn ${currentFilter === 'today' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('today')}
          >
            Today Tasks
          </button>
          <button 
            className={`filter-btn ${currentFilter === 'advance' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('advance')}
          >
            Advance Tasks
          </button>
          <button 
            className={`filter-btn ${currentFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('pending')}
          >
            Pending Tasks
          </button>
          <button 
            className={`filter-btn ${currentFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('completed')}
          >
            Completed Tasks
          </button>
        </div>

        {/* User_Task List */}
        <div className="User_Task-list">
          {filteredTasks.length === 0 ? (
            <div className="no-tasks">
              <p>No tasks found for the selected filter.</p>
              <button className="add-User_Task-btn" onClick={handleAddTask}>
                Create your first User_Task
              </button>
            </div>
          ) : (
            filteredTasks.map((task, index) => (
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
            ))
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