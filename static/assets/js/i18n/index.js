/**
 * Internationalization system
 */

import { en } from './en.js';
import { pt } from './pt.js';

const translations = { en, pt };

export const i18n = {
  currentLang: 'en',
  translations,

  /**
   * Initialize i18n system
   */
  init() {
    this.detectLanguage();
    return this;
  },

  /**
   * Detect user's preferred language
   */
  detectLanguage() {
    // Check saved language preference
    const savedLang = localStorage.getItem('language');
    if (savedLang && this.translations[savedLang]) {
      this.currentLang = savedLang;
      return;
    }

    // Detect browser language
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('pt')) {
      this.currentLang = 'pt';
    } else {
      this.currentLang = 'en';
    }

    // Save detected language
    this.setLanguage(this.currentLang);
  },

  /**
   * Set current language
   * @param {string} lang - Language code
   */
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('language', lang);
      
      // Update document language attribute
      document.documentElement.lang = lang;
      
      // Dispatch language change event
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: lang } 
      }));
    }
  },

  /**
   * Get available languages
   * @returns {Array} - Array of language codes
   */
  getLanguages() {
    return Object.keys(this.translations);
  },

  /**
   * Translate a key
   * @param {string} key - Translation key
   * @param {object} params - Parameters for interpolation
   * @returns {string} - Translated text
   */
  t(key, params = {}) {
    let translation = this.translations[this.currentLang][key];
    
    // Fallback to English if translation not found
    if (!translation) {
      translation = this.translations['en'][key];
    }
    
    // Fallback to key if no translation found
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    // Simple parameter interpolation
    if (Object.keys(params).length > 0) {
      Object.keys(params).forEach(param => {
        const regex = new RegExp(`\\{\\{${param}\\}\\}`, 'g');
        translation = translation.replace(regex, params[param]);
      });
    }

    return translation;
  },

  /**
   * Get current language code
   * @returns {string} - Current language code
   */
  getCurrentLang() {
    return this.currentLang;
  },

  /**
   * Check if language is RTL (right-to-left)
   * @param {string} lang - Language code
   * @returns {boolean} - True if RTL language
   */
  isRTL(lang = this.currentLang) {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(lang);
  },

  /**
   * Get localized date format
   * @param {Date|string} date - Date to format
   * @returns {string} - Formatted date
   */
  formatDate(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = this.currentLang === 'pt' ? 'pt-BR' : 'en-US';
    
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'full'
    }).format(dateObj);
  },

  /**
   * Get localized time format
   * @param {Date|string} date - Date to format
   * @returns {string} - Formatted time
   */
  formatTime(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = this.currentLang === 'pt' ? 'pt-BR' : 'en-US';
    
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }).format(dateObj);
  },

  /**
   * Get localized relative time (today, yesterday, etc.)
   * @param {Date|string} date - Date to format
   * @returns {string} - Relative time string
   */
  getRelativeTime(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const targetDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

    if (targetDate.getTime() === today.getTime()) {
      return this.t('today');
    } else if (targetDate.getTime() === yesterday.getTime()) {
      return this.t('yesterday');
    } else {
      return this.formatDate(dateObj);
    }
  }
};

// Initialize and export
export default i18n.init();