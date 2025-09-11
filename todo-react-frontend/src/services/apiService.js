// src/services/apiService.js
const BASE_URL = 'http://localhost:8000/todo'; // Django main URL (adjust if hosted)

class ApiService {
  constructor() {
    this.baseURL = BASE_URL;
  }

  // Get auth token
  getAuthToken() {
    const token = localStorage.getItem('access_token');
    return token ? `Bearer ${token}` : null;
  }

  // Common request method
  async makeRequest(url, options = {}) {
    const fullURL = `${this.baseURL}${url}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const authToken = this.getAuthToken();
    if (authToken) {
      defaultOptions.headers['Authorization'] = authToken;
    }

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(fullURL, requestOptions);
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data.message || data.ERROR || `HTTP error! status: ${response.status}`);
      }

      return { success: true, data, status: response.status };
    } catch (error) {
      console.error('API Request failed:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  // -------------------
  // 🔹 Auth APIs
  // -------------------
  async register(userData) {
    return this.makeRequest('/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const result = await this.makeRequest('/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (result.success && result.data.data?.token) {
      localStorage.setItem('access_token', result.data.data.token.access);
      localStorage.setItem('refresh_token', result.data.data.token.refresh);
    }

    return result;
  }

  async changePassword(passwordData) {
    return this.makeRequest('/change-password/', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }

  // -------------------
  // 🔹 Task APIs (updated to match Django)
  // -------------------
  async getTasks() {
    return this.makeRequest('/get-tasks/'); // you need to create this in Django
  }

  async createTask(taskData) {
    return this.makeRequest('/Add-task/', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId, taskData) {
    return this.makeRequest(`/update-task/${taskId}/`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId) {
    return this.makeRequest(`/delete-task/${taskId}/`, {
      method: 'DELETE',
    });
  }

  async getTodayTasks() {
    return this.makeRequest('/tasks/today/'); // optional if you add in Django
  }

  async getCompleteTasks() {
    return this.makeRequest('/tasks/complete/'); // optional if you add in Django
  }
}

export default new ApiService();
