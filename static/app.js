import { createApp, reactive } from 'vue';

// Internationalization system
const i18n = reactive({
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
      makePrivate: 'Make private',
      privateLink: 'Private link - only you can see this',
      adding: 'Adding...',
      loading: 'Loading links...',
      noLinksYet: 'No links yet',
      addFirstLink: 'Add your first link above to get started!',

      // Form placeholders
      urlPlaceholder: 'https://example.com',
      descriptionPlaceholder: 'Description (optional)',
      tagsPlaceholder: 'Tags (comma separated)',
      categoryPlaceholder: 'Category (optional)',

      // Link display
      linkAdded: 'Link added',
      description: 'Description',
      tags: 'Tags',
      category: 'Category',

      // Time/Date
      today: 'Today',
      yesterday: 'Yesterday',

      // Language
      language: 'Language',
      english: 'English',
      portuguese: 'Português',

      // Navigation
      viewPublicLinks: 'View Public Links',

      // Theme
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      toggleTheme: 'Toggle theme',

      // Search
      searchLinks: 'Search links...',
      searchPlaceholder: 'Search by URL, description, or tags',
      noResults: 'No links found for your search',
      clearSearch: 'Clear search',
      filterAll: 'All',
      filterPublic: 'Public only',
      filterPrivate: 'Private only',
      filterFavorites: 'Favorites only',

      // Favorites
      addFavorite: 'Add to favorites',
      removeFavorite: 'Remove from favorites',
      favoriteUpdated: 'Favorite updated successfully!',

      // Sort
      sortBy: 'Sort by',
      sortDate: 'Date (newest)',
      sortDateOld: 'Date (oldest)',
      sortAlphabetical: 'Alphabetical',
      sortAccess: 'Most accessed',
      sortCategory: 'Category',

      // Categories
      filterByCategory: 'Filter by category',
      allCategories: 'All categories',
      uncategorized: 'Uncategorized',

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
      makePrivate: 'Tornar privado',
      privateLink: 'Link privado - apenas você pode ver',
      adding: 'Adicionando...',
      loading: 'Carregando links...',
      noLinksYet: 'Nenhum link ainda',
      addFirstLink: 'Adicione seu primeiro link acima para começar!',

      // Form placeholders
      urlPlaceholder: 'https://exemplo.com',
      descriptionPlaceholder: 'Descrição (opcional)',
      tagsPlaceholder: 'Tags (separadas por vírgula)',
      categoryPlaceholder: 'Categoria (opcional)',

      // Link display
      linkAdded: 'Link adicionado',
      description: 'Descrição',
      tags: 'Tags',
      category: 'Categoria',

      // Time/Date
      today: 'Hoje',
      yesterday: 'Ontem',

      // Language
      language: 'Idioma',
      english: 'English',
      portuguese: 'Português',

      // Navigation
      viewPublicLinks: 'Ver Links Públicos',

      // Theme
      darkMode: 'Modo Escuro',
      lightMode: 'Modo Claro',
      toggleTheme: 'Alternar tema',

      // Search
      searchLinks: 'Buscar links...',
      searchPlaceholder: 'Buscar por URL, descrição ou tags',
      noResults: 'Nenhum link encontrado para sua busca',
      clearSearch: 'Limpar busca',
      filterAll: 'Todos',
      filterPublic: 'Apenas públicos',
      filterPrivate: 'Apenas privados',
      filterFavorites: 'Apenas favoritos',

      // Favorites
      addFavorite: 'Adicionar aos favoritos',
      removeFavorite: 'Remover dos favoritos',
      favoriteUpdated: 'Favorito atualizado com sucesso!',

      // Sort
      sortBy: 'Ordenar por',
      sortDate: 'Data (mais recentes)',
      sortDateOld: 'Data (mais antigos)',
      sortAlphabetical: 'Alfabética',
      sortAccess: 'Mais acessados',
      sortCategory: 'Categoria',

      // Categories
      filterByCategory: 'Filtrar por categoria',
      allCategories: 'Todas as categorias',
      uncategorized: 'Sem categoria',

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
});

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
      links: {},
      url: '',
      description: '',
      tags: '',
      category: '',
      isPrivate: false,
      searchQuery: '',
      privacyFilter: 'all', // 'all', 'public', 'private'
      categoryFilter: 'all', // 'all' or specific category
      sortBy: 'date', // 'date', 'date-old', 'alphabetical', 'access', 'category'
      isDarkMode: false,
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
        deleteLink: false,
        favoriteToggle: false
      },
      // Remove currentLanguage from data since we'll use computed property
    }
  },
  created() {
    this.checkAuth();
    this.initTheme();
  },
  computed: {
    filteredLinks() {
      const query = this.searchQuery.toLowerCase().trim();

      // First collect all links and filter them
      let allLinks = [];
      Object.keys(this.links).forEach(date => {
        this.links[date].forEach(link => {
          // Privacy filter
          if (this.privacyFilter === 'public' && link.is_private) return;
          if (this.privacyFilter === 'private' && !link.is_private) return;
          if (this.privacyFilter === 'favorites' && !link.is_favorite) return;

          // Category filter
          if (this.categoryFilter !== 'all' && (link.category || 'uncategorized') !== this.categoryFilter) return;

          // Text search filter
          if (query) {
            const url = (link.url || '').toLowerCase();
            const description = (link.description || '').toLowerCase();
            const tags = (link.tags || '').toLowerCase();

            const matchesSearch = url.includes(query) ||
                                 description.includes(query) ||
                                 tags.includes(query);

            if (!matchesSearch) return;
          }

          allLinks.push(link);
        });
      });

      // Sort all links based on sortBy
      switch (this.sortBy) {
        case 'date':
          allLinks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case 'date-old':
          allLinks.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          break;
        case 'alphabetical':
          allLinks.sort((a, b) => {
            const aTitle = a.description || a.url;
            const bTitle = b.description || b.url;
            return aTitle.toLowerCase().localeCompare(bTitle.toLowerCase());
          });
          break;
        case 'access':
          allLinks.sort((a, b) => (b.access_count || 0) - (a.access_count || 0));
          break;
        case 'category':
          allLinks.sort((a, b) => {
            const aCategory = a.category || 'uncategorized';
            const bCategory = b.category || 'uncategorized';
            return aCategory.toLowerCase().localeCompare(bCategory.toLowerCase());
          });
          break;
      }

      // Group sorted links back by date for display
      const filtered = {};
      allLinks.forEach(link => {
        const date = link.created_at.substring(0, 10);
        if (!filtered[date]) {
          filtered[date] = [];
        }
        filtered[date].push(link);
      });

      return filtered;
    },
    byDate() {
      return Object.keys(this.filteredLinks).sort().reverse();
    },
    hasLinks() {
      return Object.keys(this.links).length > 0;
    },
    hasFilteredLinks() {
      return Object.keys(this.filteredLinks).length > 0;
    },
    isSearching() {
      return this.searchQuery.trim().length > 0 || this.privacyFilter !== 'all' || this.categoryFilter !== 'all';
    },
    availableCategories() {
      const categories = new Set();
      Object.keys(this.links).forEach(date => {
        this.links[date].forEach(link => {
          const category = link.category || 'uncategorized';
          categories.add(category);
        });
      });
      return Array.from(categories).sort();
    },
    isFormValid() {
      return this.url.trim() &&
             (this.url.startsWith('http://') || this.url.startsWith('https://'));
    },
    currentLanguage() {
      return i18n.currentLang;
    }
  },
  methods: {
    // Language methods
    changeLanguage(lang) {
      i18n.setLanguage(lang);
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
        // Redirect to login if not authenticated
        window.location.href = '/login';
      }
    },
    logout() {
      this.isAuthenticated = false;
      this.user = null;
      this.token = null;
      this.links = {};
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    },
    initTheme() {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        this.isDarkMode = true;
        document.body.classList.add('dark-mode');
      } else {
        this.isDarkMode = false;
        document.body.classList.remove('dark-mode');
      }
    },
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      if (this.isDarkMode) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
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

      // Get current client timestamp
      const now = new Date();
      const clientTimestamp = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');

      fetch(`/api/links`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          url: this.url,
          description: this.description,
          tags: this.tags,
          category: this.category,
          is_private: this.isPrivate,
          created_at: clientTimestamp
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
          this.category = '';
          this.isPrivate = false;
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
    clearSearch() {
      this.searchQuery = '';
      this.privacyFilter = 'all';
      this.categoryFilter = 'all';
      this.sortBy = 'date';
    },
    incrementAccessCount(linkId) {
      fetch(`/api/links/${linkId}/access`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      })
      .then(res => {
        if (res.ok) {
          // Update the access count locally
          Object.keys(this.links).forEach(date => {
            this.links[date].forEach(link => {
              if (link.id === linkId) {
                link.access_count = (link.access_count || 0) + 1;
              }
            });
          });
        }
      })
      .catch(err => {
        console.error('Error incrementing access count:', err);
      });
    },
    toggleFavorite(linkId, currentFavoriteStatus) {
      const newFavoriteStatus = !currentFavoriteStatus;

      fetch(`/api/links/${linkId}/favorite`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          is_favorite: newFavoriteStatus
        })
      })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            this.logout();
            throw new Error(this.t('sessionExpired'));
          }
          throw new Error('Failed to update favorite');
        }

        // Update the link locally
        Object.keys(this.links).forEach(date => {
          this.links[date].forEach(link => {
            if (link.id === linkId) {
              link.is_favorite = newFavoriteStatus;
            }
          });
        });

        this.success.favoriteToggle = true;
        setTimeout(() => this.success.favoriteToggle = false, 3000);
      })
      .catch(err => {
        console.error('Error toggling favorite:', err);
        if (err.message !== this.t('sessionExpired')) {
          this.errors.addLink = err.message || 'Failed to toggle favorite';
        }
      });
    }
  },
  template: `
  <div class="app" :class="{ 'dark-mode': isDarkMode }">
    <!-- Main App -->
    <div class="main-app">
      <!-- Header -->
      <header class="app-header">
        <h1>{{ t('appTitle') }}</h1>
        <div class="user-info">
          <span>{{ t('welcome') }}, {{ user.username }}!</span>
          <a href="/?view=public" class="public-view-btn">{{ t('viewPublicLinks') }}</a>
          <select v-model="currentLanguage" @change="changeLanguage($event.target.value)" class="lang-select">
            <option value="en">{{ t('english') }}</option>
            <option value="pt">{{ t('portuguese') }}</option>
          </select>
          <button @click="toggleTheme()" class="theme-btn" :title="t('toggleTheme')">
            {{ isDarkMode ? t('lightMode') : t('darkMode') }}
          </button>
          <button @click="logout()" class="logout-btn">{{ t('logout') }}</button>
        </div>
      </header>

      <!-- Sidebar -->
      <div class="sidebar">

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

          <div v-if="success.favoriteToggle" class="success-message">
            {{ t('favoriteUpdated') }}
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
                class="auto-fill-btn"
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
            <input
              v-model="category"
              :placeholder="t('categoryPlaceholder')"
              :disabled="loading.addLink"
            >

            <div class="privacy-checkbox">
              <input type="checkbox" v-model="isPrivate" :disabled="loading.addLink">
              <div>
                <span>{{ t('makePrivate') }}</span>
                <small v-if="isPrivate" class="privacy-note">{{ t('privateLink') }}</small>
              </div>
            </div>

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

        <!-- Search Section -->
        <div class="search-section">
          <div class="search-container">
            <input
              v-model="searchQuery"
              :placeholder="t('searchPlaceholder')"
              class="search-input"
              type="text"
            >
            <button
              v-if="isSearching"
              @click="clearSearch()"
              class="clear-search-btn"
              :title="t('clearSearch')"
            >
              ✕
            </button>
          </div>

          <div class="filter-container">
            <label>{{ t('filterAll') }}:</label>
            <select v-model="privacyFilter" class="privacy-filter">
              <option value="all">{{ t('filterAll') }}</option>
              <option value="public">{{ t('filterPublic') }}</option>
              <option value="private">{{ t('filterPrivate') }}</option>
              <option value="favorites">{{ t('filterFavorites') }}</option>
            </select>
          </div>

          <div class="filter-container">
            <label>{{ t('filterByCategory') }}:</label>
            <select v-model="categoryFilter" class="privacy-filter">
              <option value="all">{{ t('allCategories') }}</option>
              <option v-for="category in availableCategories" :key="category" :value="category">
                {{ category === 'uncategorized' ? t('uncategorized') : category }}
              </option>
            </select>
          </div>

          <div class="filter-container">
            <label>{{ t('sortBy') }}:</label>
            <select v-model="sortBy" class="privacy-filter">
              <option value="date">{{ t('sortDate') }}</option>
              <option value="date-old">{{ t('sortDateOld') }}</option>
              <option value="alphabetical">{{ t('sortAlphabetical') }}</option>
              <option value="access">{{ t('sortAccess') }}</option>
              <option value="category">{{ t('sortCategory') }}</option>
            </select>
          </div>
        </div>
      </div> <!-- sidebar -->

      <!-- Content Area -->
      <div class="content-area">
        <!-- Links Display -->
        <div class="links-container">
        <div v-if="loading.links" class="loading">
          {{ t('loading') }}
        </div>

        <div v-else-if="!hasLinks" class="empty-state">
          <h3>{{ t('noLinksYet') }}</h3>
          <p>{{ t('addFirstLink') }}</p>
        </div>

        <div v-else-if="isSearching && !hasFilteredLinks" class="empty-state">
          <h3>{{ t('noResults') }}</h3>
          <button @click="clearSearch()" class="link-btn">{{ t('clearSearch') }}</button>
        </div>

        <div v-else>
          <div v-for="date in byDate" :key="date" class="date-group">
            <h3 class="date-header">{{ toDate(date) }}</h3>
            <div class="links-list">
              <div v-for="link in filteredLinks[date]" :key="link.id" class="link-item">
                <div class="link-header">
                  <a :href="link.url" target="_blank" rel="noopener" class="link-url" @click="incrementAccessCount(link.id)">
                    {{ link.url }}
                  </a>
                  <div class="link-actions">
                    <button
                      @click="toggleFavorite(link.id, link.is_favorite)"
                      class="favorite-btn"
                      :class="{ 'is-favorite': link.is_favorite }"
                      :title="link.is_favorite ? t('removeFavorite') : t('addFavorite')"
                    >
                      {{ link.is_favorite ? 'Fav' : 'Favorite' }}
                    </button>
                    <span v-if="link.is_private" class="private-badge">Private</span>
                    <span v-if="link.access_count > 0" class="access-count">{{ link.access_count }} access{{ link.access_count !== 1 ? 'es' : '' }}</span>
                    <span class="link-time">{{ toTime(link.created_at) }}</span>
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

                <div v-if="link.category" class="link-category">
                  <span class="category-badge">{{ link.category }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div> <!-- content-area  -->
    </div> <!-- main-app  -->
  </div> <!-- app -->
  `
};

createApp(LinksApp).mount('#app');
