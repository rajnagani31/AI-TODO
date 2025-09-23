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
        // Return structured error including status so callers can handle 429 etc.
        const errMsg = (data && (data.message || data.ERROR)) || `HTTP error! status: ${response.status}`;
        return { success: false, error: errMsg, status: response.status, data };
      }

      // Normalize: if backend wraps payload as { ..., data: <payload> }, unwrap one level
      const payload = (data && Object.prototype.hasOwnProperty.call(data, 'data')) ? data.data : data;

      return { success: true, data: payload, raw: data, status: response.status };
    } catch (error) {
      console.error('API Request failed (network):', error);
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

    if (result.success && result.data?.token) {
      localStorage.setItem('access_token', result.data.token.access);
      localStorage.setItem('refresh_token', result.data.token.refresh);
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
    // backend route is /delete/<id>/
    return this.makeRequest(`/delete/${taskId}/`, {
      method: 'DELETE',
    });
  }

  async completeTask(taskId) {
    // backend route is /complete/<id>/ (PUT)
    return this.makeRequest(`/complete/${taskId}/`, {
      method: 'PUT',
    });
  }

  async getTodayTasks() {
    return this.makeRequest('/today-task/');
  }

  async getAdvanceTasks() {
    return this.makeRequest('/Advance-task/');
  }

  async getPendingTasks() {
    return this.makeRequest('/pending-task/');
  }

  async getCompletedTasks() {
    return this.makeRequest('/completed-task/');
  }
}

export default new ApiService();
