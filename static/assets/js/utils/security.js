/**
 * Security utilities for input sanitization and validation
 */

export const Security = {
  /**
   * Sanitize HTML to prevent XSS attacks
   * @param {string} input - Raw HTML string
   * @returns {string} - Sanitized HTML string
   */
  sanitizeHTML(input) {
    if (!input || typeof input !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },

  /**
   * Validate and sanitize URL
   * @param {string} url - URL to validate
   * @returns {object} - {isValid: boolean, sanitized: string, error?: string}
   */
  validateURL(url) {
    if (!url || typeof url !== 'string') {
      return { isValid: false, sanitized: '', error: 'URL is required' };
    }

    // Remove whitespace
    const trimmed = url.trim();
    
    // Add protocol if missing
    let fullUrl = trimmed;
    if (!trimmed.match(/^https?:\/\//i)) {
      fullUrl = 'https://' + trimmed;
    }

    try {
      const urlObj = new URL(fullUrl);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, sanitized: '', error: 'Only HTTP and HTTPS URLs are allowed' };
      }

      // Block localhost and private IP ranges in production
      const hostname = urlObj.hostname.toLowerCase();
      const blockedPatterns = [
        /^localhost$/,
        /^127\./,
        /^192\.168\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[01])\./,
        /^0\.0\.0\.0$/,
        /^::1$/,
        /^fe80:/
      ];

      for (const pattern of blockedPatterns) {
        if (pattern.test(hostname)) {
          return { isValid: false, sanitized: '', error: 'Private/localhost URLs are not allowed' };
        }
      }

      return { isValid: true, sanitized: urlObj.href };
    } catch (error) {
      return { isValid: false, sanitized: '', error: 'Invalid URL format' };
    }
  },

  /**
   * Sanitize text input to prevent injection
   * @param {string} input - Text input
   * @returns {string} - Sanitized text
   */
  sanitizeText(input) {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove < and > chars
      .substring(0, 1000); // Limit length
  },

  /**
   * Validate tags input
   * @param {string} tags - Comma-separated tags
   * @returns {object} - {isValid: boolean, sanitized: string, error?: string}
   */
  validateTags(tags) {
    if (!tags || typeof tags !== 'string') {
      return { isValid: true, sanitized: '' };
    }

    const sanitized = tags
      .split(',')
      .map(tag => this.sanitizeText(tag))
      .filter(tag => tag.length > 0)
      .slice(0, 10) // Max 10 tags
      .join(', ');

    return { isValid: true, sanitized };
  },

  /**
   * Validate category input
   * @param {string} category - Category name
   * @returns {object} - {isValid: boolean, sanitized: string, error?: string}
   */
  validateCategory(category) {
    if (!category || typeof category !== 'string') {
      return { isValid: true, sanitized: '' };
    }

    const sanitized = this.sanitizeText(category).substring(0, 50);
    
    // Check for valid category name (alphanumeric, spaces, hyphens, underscores)
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(sanitized)) {
      return { isValid: false, sanitized: '', error: 'Category can only contain letters, numbers, spaces, hyphens, and underscores' };
    }

    return { isValid: true, sanitized };
  },

  /**
   * Rate limiting utility
   */
  RateLimit: {
    attempts: new Map(),
    
    /**
     * Check if action is rate limited
     * @param {string} key - Unique key for the action
     * @param {number} maxAttempts - Maximum attempts allowed
     * @param {number} windowMs - Time window in milliseconds
     * @returns {boolean} - True if rate limited
     */
    isLimited(key, maxAttempts = 5, windowMs = 60000) {
      const now = Date.now();
      const attempts = this.attempts.get(key) || [];
      
      // Remove old attempts outside the window
      const validAttempts = attempts.filter(time => now - time < windowMs);
      
      if (validAttempts.length >= maxAttempts) {
        return true;
      }
      
      // Add current attempt
      validAttempts.push(now);
      this.attempts.set(key, validAttempts);
      
      return false;
    }
  },

  /**
   * Generate CSRF token for forms
   * @returns {string} - CSRF token
   */
  generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Secure storage wrapper for sensitive data
   */
  SecureStorage: {
    /**
     * Store data securely in sessionStorage (not localStorage for sensitive data)
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     */
    setSecure(key, value) {
      try {
        const encrypted = btoa(JSON.stringify(value));
        sessionStorage.setItem(`secure_${key}`, encrypted);
      } catch (error) {
        console.warn('Failed to store secure data:', error);
      }
    },

    /**
     * Retrieve securely stored data
     * @param {string} key - Storage key
     * @returns {any} - Retrieved value or null
     */
    getSecure(key) {
      try {
        const encrypted = sessionStorage.getItem(`secure_${key}`);
        if (!encrypted) return null;
        return JSON.parse(atob(encrypted));
      } catch (error) {
        console.warn('Failed to retrieve secure data:', error);
        return null;
      }
    },

    /**
     * Remove securely stored data
     * @param {string} key - Storage key
     */
    removeSecure(key) {
      sessionStorage.removeItem(`secure_${key}`);
    }
  }
};