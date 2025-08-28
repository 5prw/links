/**
 * Centralized API utilities with security and error handling
 */

import { Security } from './security.js';

export const API = {
  baseURL: '',
  defaultTimeout: 10000,

  /**
   * Get authentication headers
   * @returns {object} - Headers object with Authorization
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  },

  /**
   * Generic fetch wrapper with security and error handling
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise} - Fetch promise
   */
  async request(endpoint, options = {}) {
    // Rate limiting check
    const rateLimitKey = `api_${endpoint}`;
    if (Security.RateLimit.isLimited(rateLimitKey, 10, 60000)) {
      throw new Error('Too many requests. Please wait before trying again.');
    }

    const config = {
      timeout: this.defaultTimeout,
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const response = await fetch(endpoint, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP Error: ${response.status}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      
      throw error;
    }
  },

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @returns {Promise} - Response data
   */
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  /**
   * POST request with data validation
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request data
   * @returns {Promise} - Response data
   */
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT request with data validation
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request data
   * @returns {Promise} - Response data
   */
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise} - Response data
   */
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  /**
   * Links API methods
   */
  Links: {
    /**
     * Get user's links
     * @returns {Promise} - Links grouped by date
     */
    getUserLinks() {
      return API.get('/api/links');
    },

    /**
     * Get public links
     * @returns {Promise} - Public links grouped by date
     */
    getPublicLinks() {
      return API.get('/api/public-links');
    },

    /**
     * Create a new link with validation
     * @param {object} linkData - Link data
     * @returns {Promise} - Created link
     */
    async createLink(linkData) {
      // Validate URL
      const urlValidation = Security.validateURL(linkData.url);
      if (!urlValidation.isValid) {
        throw new Error(urlValidation.error);
      }

      // Validate and sanitize other fields
      const sanitizedData = {
        url: urlValidation.sanitized,
        description: Security.sanitizeText(linkData.description || '').substring(0, 500),
        is_private: Boolean(linkData.is_private),
        created_at: linkData.created_at || new Date().toISOString().slice(0, 19).replace('T', ' ')
      };

      // Validate tags if provided
      if (linkData.tags) {
        const tagsValidation = Security.validateTags(linkData.tags);
        if (!tagsValidation.isValid) {
          throw new Error(tagsValidation.error);
        }
        sanitizedData.tags = tagsValidation.sanitized;
      }

      // Validate category if provided
      if (linkData.category) {
        const categoryValidation = Security.validateCategory(linkData.category);
        if (!categoryValidation.isValid) {
          throw new Error(categoryValidation.error);
        }
        sanitizedData.category = categoryValidation.sanitized;
      }

      return API.post('/api/links', sanitizedData);
    },

    /**
     * Delete a link
     * @param {number} linkId - Link ID
     * @returns {Promise}
     */
    deleteLink(linkId) {
      if (!linkId || !Number.isInteger(linkId)) {
        throw new Error('Invalid link ID');
      }
      return API.delete(`/api/links/${linkId}`);
    },

    /**
     * Toggle favorite status
     * @param {number} linkId - Link ID
     * @param {boolean} isFavorite - New favorite status
     * @returns {Promise}
     */
    toggleFavorite(linkId, isFavorite) {
      if (!linkId || !Number.isInteger(linkId)) {
        throw new Error('Invalid link ID');
      }
      return API.put(`/api/links/${linkId}/favorite`, { 
        is_favorite: Boolean(isFavorite) 
      });
    },

    /**
     * Increment access count
     * @param {number} linkId - Link ID
     * @returns {Promise}
     */
    incrementAccess(linkId) {
      if (!linkId || !Number.isInteger(linkId)) {
        throw new Error('Invalid link ID');
      }
      return API.put(`/api/links/${linkId}/access`, {});
    },

    /**
     * Fetch metadata for a URL
     * @param {string} url - URL to fetch metadata for
     * @returns {Promise} - Metadata object
     */
    async fetchMetadata(url) {
      const urlValidation = Security.validateURL(url);
      if (!urlValidation.isValid) {
        throw new Error(urlValidation.error);
      }

      const encodedURL = encodeURIComponent(urlValidation.sanitized);
      return API.get(`/api/metadata?url=${encodedURL}`);
    }
  },

  /**
   * Auth API methods
   */
  Auth: {
    /**
     * Login user
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Promise} - Auth response
     */
    async login(username, password) {
      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      // Basic input sanitization
      const sanitizedUsername = Security.sanitizeText(username).substring(0, 50);
      if (sanitizedUsername.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      return API.post('/api/login', {
        username: sanitizedUsername,
        password: password // Don't sanitize password, just validate length
      });
    },

    /**
     * Register new user
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Promise} - Auth response
     */
    async register(username, password) {
      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      const sanitizedUsername = Security.sanitizeText(username).substring(0, 50);
      if (sanitizedUsername.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Basic password strength check
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      }

      return API.post('/api/register', {
        username: sanitizedUsername,
        password: password
      });
    }
  }
};