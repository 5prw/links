import { createApp } from 'vue';

// Internationalization system
const i18n = {
  // Default language
  currentLang: 'en',
  
  // Translations
  translations: {
    en: {
      // App title
      appTitle: 'Links',
      appSubtitle: 'Personal Link Manager',
      
      // Auth
      welcomeBack: 'Welcome back',
      createAccount: 'Create account',
      username: 'Username',
      password: 'Password',
      login: 'Login',
      register: 'Register',
      needAccount: 'Need an account? Register',
      haveAccount: 'Already have an account? Login',
      logout: 'Logout',
      welcome: 'Welcome',
      
      // Form validation
      usernameRequired: 'Username is required',
      passwordMinLength: 'Password must be at least 3 characters',
      urlRequired: 'URL is required',
      urlFormat: 'URL must start with http:// or https://',
      
      // Error messages
      loginFailed: 'Invalid credentials',
      registrationFailed: 'Username already exists or invalid data',
      sessionExpired: 'Session expired',
      failedToLoadLinks: 'Failed to load links',
      failedToAddLink: 'Failed to add link',
      
      // Success messages
      linkAddedSuccess: 'Link added successfully!',
      
      // Main app
      addNewLink: 'Add new link',
      addLink: 'Add Link',
      adding: 'Adding...',
      loading: 'Loading links...',
      noLinksYet: 'No links yet',
      addFirstLink: 'Add your first link above to get started!',
      
      // Form placeholders
      urlPlaceholder: 'https://example.com',
      descriptionPlaceholder: 'Description (optional)',
      tagsPlaceholder: 'Tags (comma separated)',
      
      // Link display
      linkAdded: 'Link added',
      description: 'Description',
      tags: 'Tags',
      
      // Time/Date
      today: 'Today',
      yesterday: 'Yesterday',
      
      // Language
      language: 'Language',
      english: 'English',
      portuguese: 'Português',
      
      // OAuth
      loginWithGoogle: 'Login with Google',
      orSeparator: 'OR',
      
      // Delete
      deleteLink: 'Delete',
      confirmDelete: 'Are you sure you want to delete this link?',
      linkDeleted: 'Link deleted successfully!',
      
      // Metadata
      autoFill: 'Auto-fill',
      fetchingInfo: 'Fetching info...'
    },
    
    pt: {
      // App title
      appTitle: 'Links',
      appSubtitle: 'Gerenciador Pessoal de Links',
      
      // Auth
      welcomeBack: 'Bem-vindo de volta',
      createAccount: 'Criar conta',
      username: 'Usuário',
      password: 'Senha',
      login: 'Entrar',
      register: 'Cadastrar',
      needAccount: 'Precisa de uma conta? Cadastre-se',
      haveAccount: 'Já tem uma conta? Entre',
      logout: 'Sair',
      welcome: 'Bem-vindo',
      
      // Form validation
      usernameRequired: 'Usuário é obrigatório',
      passwordMinLength: 'Senha deve ter pelo menos 3 caracteres',
      urlRequired: 'URL é obrigatória',
      urlFormat: 'URL deve começar com http:// ou https://',
      
      // Error messages
      loginFailed: 'Credenciais inválidas',
      registrationFailed: 'Usuário já existe ou dados inválidos',
      sessionExpired: 'Sessão expirada',
      failedToLoadLinks: 'Falha ao carregar links',
      failedToAddLink: 'Falha ao adicionar link',
      
      // Success messages
      linkAddedSuccess: 'Link adicionado com sucesso!',
      
      // Main app
      addNewLink: 'Adicionar novo link',
      addLink: 'Adicionar Link',
      adding: 'Adicionando...',
      loading: 'Carregando links...',
      noLinksYet: 'Nenhum link ainda',
      addFirstLink: 'Adicione seu primeiro link acima para começar!',
      
      // Form placeholders
      urlPlaceholder: 'https://exemplo.com',
      descriptionPlaceholder: 'Descrição (opcional)',
      tagsPlaceholder: 'Tags (separadas por vírgula)',
      
      // Link display
      linkAdded: 'Link adicionado',
      description: 'Descrição',
      tags: 'Tags',
      
      // Time/Date
      today: 'Hoje',
      yesterday: 'Ontem',
      
      // Language
      language: 'Idioma',
      english: 'English',
      portuguese: 'Português',
      
      // OAuth
      loginWithGoogle: 'Entrar com Google',
      orSeparator: 'OU',
      
      // Delete
      deleteLink: 'Excluir',
      confirmDelete: 'Tem certeza que deseja excluir este link?',
      linkDeleted: 'Link excluído com sucesso!',
      
      // Metadata
      autoFill: 'Preencher automaticamente',
      fetchingInfo: 'Buscando informações...'
    }
  },
  
  // Get translation
  t(key) {
    const translation = this.translations[this.currentLang][key];
    return translation || this.translations['en'][key] || key;
  },
  
  // Detect browser language
  detectLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('pt')) {
      this.currentLang = 'pt';
    } else {
      this.currentLang = 'en';
    }
    
    // Check localStorage for saved preference
    const savedLang = localStorage.getItem('language');
    if (savedLang && this.translations[savedLang]) {
      this.currentLang = savedLang;
    }
  },
  
  // Set language
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('language', lang);
    }
  },
  
  // Get available languages
  getLanguages() {
    return Object.keys(this.translations);
  }
};

// Initialize i18n
i18n.detectLanguage();

const ToolsMixin = {
  methods: {
    cloneObj(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    // Translation method
    t(key) {
      return i18n.t(key);
    },
    // Updated date formatting methods that are reactive to language changes
    toDate(d) {
      const locale = this.currentLanguage === 'pt' ? 'pt-BR' : 'en-US';
      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'full'
      }).format(new Date(d));
    },
    toTime(d) {
      const locale = this.currentLanguage === 'pt' ? 'pt-BR' : 'en-US';
      return new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }).format(new Date(d));
    }
  }
};

const LinksApp = {
  mixins: [
    ToolsMixin
  ],
  data() {
    return {
      isAuthenticated: false,
      user: null,
      token: null,
      showLogin: true,
      username: '',
      password: '',
      links: {},
      url: '',
      description: '',
      tags: '',
      loading: {
        auth: false,
        links: false,
        addLink: false,
        metadata: false
      },
      errors: {
        auth: '',
        addLink: ''
      },
      success: {
        addLink: false,
        deleteLink: false
      },
      currentLanguage: i18n.currentLang
    }
  },
  created() {
    this.checkAuth();
    this.handleOAuthCallback();
  },
  computed: {
    byDate() {
      return Object.keys(this.links).sort().reverse();
    },
    hasLinks() {
      return Object.keys(this.links).length > 0;
    },
    isFormValid() {
      return this.url.trim() && 
             (this.url.startsWith('http://') || this.url.startsWith('https://'));
    }
  },
  methods: {
    // Language methods
    changeLanguage(lang) {
      i18n.setLanguage(lang);
      this.currentLanguage = lang;
    },
    getAvailableLanguages() {
      return i18n.getLanguages();
    },
    checkAuth() {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        this.token = token;
        this.user = JSON.parse(user);
        this.isAuthenticated = true;
        this.getLinks();
      } else {
        this.isAuthenticated = false;
      }
    },
    login() {
      if (!this.validateAuthForm()) return;
      
      this.loading.auth = true;
      this.errors.auth = '';
      
      fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password
        })
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(this.t('loginFailed'));
        }
        return res.json();
      })
      .then(data => {
        if (data.token) {
          this.token = data.token;
          this.user = data.user;
          this.isAuthenticated = true;
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          this.username = '';
          this.password = '';
          this.getLinks();
        }
      })
      .catch(err => {
        console.error('Login failed:', err);
        this.errors.auth = err.message || this.t('loginFailed');
      })
      .finally(() => {
        this.loading.auth = false;
      });
    },
    register() {
      if (!this.validateAuthForm()) return;
      
      this.loading.auth = true;
      this.errors.auth = '';
      
      fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password
        })
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(this.t('registrationFailed'));
        }
        return res.json();
      })
      .then(data => {
        if (data.token) {
          this.token = data.token;
          this.user = data.user;
          this.isAuthenticated = true;
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          this.username = '';
          this.password = '';
          this.getLinks();
        }
      })
      .catch(err => {
        console.error('Registration failed:', err);
        this.errors.auth = err.message || this.t('registrationFailed');
      })
      .finally(() => {
        this.loading.auth = false;
      });
    },
    logout() {
      this.isAuthenticated = false;
      this.user = null;
      this.token = null;
      this.links = {};
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    getAuthHeaders() {
      return {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Authorization': `Bearer ${this.token}`
      };
    },
    getLinks() {
      this.loading.links = true;
      
      fetch(`/api/links`, {
        headers: this.getAuthHeaders()
      })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            this.logout();
            throw new Error(this.t('sessionExpired'));
          }
          throw new Error(this.t('failedToLoadLinks'));
        }
        return res.json();
      })
      .then(json => {
        this.links = json || {};
      })
      .catch(err => {
        console.error('Error loading links:', err);
        if (err.message !== this.t('sessionExpired')) {
          this.errors.auth = this.t('failedToLoadLinks');
        }
      })
      .finally(() => {
        this.loading.links = false;
      });
    },
    validateAuthForm() {
      if (!this.username.trim()) {
        this.errors.auth = this.t('usernameRequired');
        return false;
      }
      if (this.password.length < 3) {
        this.errors.auth = this.t('passwordMinLength');
        return false;
      }
      return true;
    },
    validateLinkForm() {
      if (!this.url.trim()) {
        this.errors.addLink = this.t('urlRequired');
        return false;
      }
      if (!this.url.startsWith('http://') && !this.url.startsWith('https://')) {
        this.errors.addLink = this.t('urlFormat');
        return false;
      }
      return true;
    },
    add() {
      if (!this.validateLinkForm()) return;
      
      this.loading.addLink = true;
      this.errors.addLink = '';
      this.success.addLink = false;
      
      fetch(`/api/links`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          url: this.url,
          description: this.description,
          tags: this.tags
        })
      })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            this.logout();
            throw new Error(this.t('sessionExpired'));
          }
          throw new Error(this.t('failedToAddLink'));
        }
        return res.json();
      })
      .then(json => {
        if (json.id) {
          this.url = '';
          this.description = '';
          this.tags = '';
          this.success.addLink = true;
          setTimeout(() => this.success.addLink = false, 3000);
          this.getLinks();
        }
      })
      .catch(err => {
        console.error('Error adding link:', err);
        if (err.message !== this.t('sessionExpired')) {
          this.errors.addLink = err.message || this.t('failedToAddLink');
        }
      })
      .finally(() => {
        this.loading.addLink = false;
      });
    },
    fetchMetadata() {
      if (!this.url || !this.isFormValid) return;
      
      this.loading.metadata = true;
      
      fetch(`/api/metadata?url=${encodeURIComponent(this.url)}`, {
        headers: this.getAuthHeaders()
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Failed to fetch metadata');
      })
      .then(metadata => {
        if (metadata.title && !this.description) {
          this.description = metadata.description || metadata.title;
        }
        if (metadata.tags && metadata.tags.length > 0 && !this.tags) {
          this.tags = metadata.tags.join(', ');
        }
      })
      .catch(err => {
        console.error('Error fetching metadata:', err);
      })
      .finally(() => {
        this.loading.metadata = false;
      });
    },
    deleteLink(linkId) {
      if (!confirm(this.t('confirmDelete'))) {
        return;
      }
      
      fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            this.logout();
            throw new Error(this.t('sessionExpired'));
          }
          throw new Error('Failed to delete link');
        }
        this.success.deleteLink = true;
        setTimeout(() => this.success.deleteLink = false, 3000);
        this.getLinks();
      })
      .catch(err => {
        console.error('Error deleting link:', err);
        if (err.message !== this.t('sessionExpired')) {
          this.errors.addLink = err.message || 'Failed to delete link';
        }
      });
    },
    clearError(type) {
      this.errors[type] = '';
    },
    // OAuth methods
    loginWithGoogle() {
      window.location.href = '/api/auth/google';
    },
    handleOAuthCallback() {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userStr = urlParams.get('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          this.token = token;
          this.user = user;
          this.isAuthenticated = true;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Clean URL
          window.history.replaceState({}, document.title, '/');
          
          this.getLinks();
        } catch (e) {
          console.error('Error parsing OAuth callback:', e);
        }
      }
    }
  },
  template: `
  <div class="app">
    <!-- Login/Register Form -->
    <div v-if="!isAuthenticated" class="auth-container">
      <div class="auth-form">
        <h1>{{ t('appTitle') }}</h1>
        <h2>{{ showLogin ? t('welcomeBack') : t('createAccount') }}</h2>
        
        <div v-if="errors.auth" class="error-message" @click="clearError('auth')">
          {{ errors.auth }}
        </div>
        
        <!-- Google OAuth Button -->
        <button @click="loginWithGoogle()" class="google-btn">
          {{ t('loginWithGoogle') }}
        </button>
        
        <div class="separator">
          <span>{{ t('orSeparator') }}</span>
        </div>
        
        <form @submit.prevent="showLogin ? login() : register()">
          <input 
            v-model="username" 
            :placeholder="t('username')" 
            type="text"
            :disabled="loading.auth"
            @input="clearError('auth')"
            required
          >
          <input 
            v-model="password" 
            :placeholder="t('password')" 
            type="password"
            :disabled="loading.auth"
            @input="clearError('auth')"
            required
          >
          
          <button type="submit" :disabled="loading.auth" class="primary-btn">
            <span v-if="loading.auth">Loading...</span>
            {{ showLogin ? t('login') : t('register') }}
          </button>
        </form>
        
        <button @click="showLogin = !showLogin; clearError('auth')" class="link-btn">
          {{ showLogin ? t('needAccount') : t('haveAccount') }}
        </button>
        
        <!-- Language Switcher -->
        <div class="language-switcher">
          <label>{{ t('language') }}:</label>
          <select v-model="currentLanguage" @change="changeLanguage($event.target.value)">
            <option value="en">{{ t('english') }}</option>
            <option value="pt">{{ t('portuguese') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Main App -->
    <div v-if="isAuthenticated" class="main-app">
      <!-- Header -->
      <header class="app-header">
        <h1>{{ t('appTitle') }}</h1>
        <div class="user-info">
          <span>{{ t('welcome') }}, {{ user.username }}!</span>
          <select v-model="currentLanguage" @change="changeLanguage($event.target.value)" class="lang-select">
            <option value="en">{{ t('english') }}</option>
            <option value="pt">{{ t('portuguese') }}</option>
          </select>
          <button @click="logout()" class="logout-btn">{{ t('logout') }}</button>
        </div>
      </header>
      
      <!-- Add Link Form -->
      <div class="add-link-form">
        <h3>{{ t('addNewLink') }}</h3>
        
        <div v-if="errors.addLink" class="error-message" @click="clearError('addLink')">
          {{ errors.addLink }}
        </div>
        
        <div v-if="success.addLink" class="success-message">
          {{ t('linkAddedSuccess') }}
        </div>
        
        <div v-if="success.deleteLink" class="success-message">
          {{ t('linkDeleted') }}
        </div>
        
        <form @submit.prevent="add">
          <div style="display: flex; gap: 5px; margin-bottom: 10px;">
            <input 
              v-model="url" 
              :placeholder="t('urlPlaceholder')" 
              type="url"
              :disabled="loading.addLink"
              @input="clearError('addLink')"
              style="flex: 1;"
              required
            >
            <button 
              type="button" 
              @click="fetchMetadata()" 
              :disabled="loading.metadata || !isFormValid"
              style="padding: 8px 12px; background: #f0f0f0; border: 1px solid #ccc; cursor: pointer; font-size: 12px;"
            >
              {{ loading.metadata ? t('fetchingInfo') : t('autoFill') }}
            </button>
          </div>
          <textarea 
            v-model="description" 
            :placeholder="t('descriptionPlaceholder')"
            :disabled="loading.addLink"
            rows="2"
          ></textarea>
          <input 
            v-model="tags" 
            :placeholder="t('tagsPlaceholder')"
            :disabled="loading.addLink"
          >
          
          <button 
            type="submit" 
            :disabled="loading.addLink || !isFormValid" 
            class="primary-btn"
          >
            <span v-if="loading.addLink">Loading...</span>
            {{ loading.addLink ? t('adding') : t('addLink') }}
          </button>
        </form>
      </div>
      
      <!-- Links Display -->
      <div class="links-container">
        <div v-if="loading.links" class="loading">
          {{ t('loading') }}
        </div>
        
        <div v-else-if="!hasLinks" class="empty-state">
          <h3>{{ t('noLinksYet') }}</h3>
          <p>{{ t('addFirstLink') }}</p>
        </div>
        
        <div v-else>
          <div v-for="date in byDate" :key="date" class="date-group">
            <h3 class="date-header">{{ toDate(date) }}</h3>
            <div class="links-list">
              <div v-for="link in links[date]" :key="link.id" class="link-item">
                <div class="link-header">
                  <a :href="link.url" target="_blank" rel="noopener" class="link-url">
                    {{ link.url }}
                  </a>
                  <div class="link-actions">
                    <span class="link-time">{{ toTime(link.createdAt) }}</span>
                    <button @click="deleteLink(link.id)" class="delete-btn" :title="t('deleteLink')">
                      Delete
                    </button>
                  </div>
                </div>
                
                <div v-if="link.description" class="link-description">
                  {{ link.description }}
                </div>
                
                <div v-if="link.tags" class="link-tags">
                  <span v-for="tag in link.tags.split(',')" :key="tag" class="tag">
                    #{{ tag.trim() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
};

createApp(LinksApp).mount('#app');
