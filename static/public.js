import { createApp, reactive } from 'vue';

// Internationalization system
const i18n = reactive({
  currentLang: 'en',
  
  translations: {
    en: {
      appTitle: 'Links',
      appSubtitle: 'Public Link Collection',
      login: 'Login',
      register: 'Register',
      loginToAddLinks: 'Login to add your own links',
      language: 'Language',
      english: 'English',
      portuguese: 'Português',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      toggleTheme: 'Toggle theme',
      loading: 'Loading links...',
      noLinksYet: 'No public links yet',
      addFirstLink: 'Login to add your first link!',
      today: 'Today',
      yesterday: 'Yesterday',
      description: 'Description',
      tags: 'Tags',
      postedBy: 'Posted by',
      backToMyLinks: 'Back to My Links',
      yourLinks: 'Your Links',
      manageYourLinks: 'Manage your links',
      wantToShare: 'Want to share a link?',
      loginToShare: 'Login to add your links and share them with everyone!'
    },
    pt: {
      appTitle: 'Links',
      appSubtitle: 'Coleção de Links Públicos',
      login: 'Entrar',
      register: 'Cadastrar',
      loginToAddLinks: 'Entre para adicionar seus próprios links',
      language: 'Idioma',
      english: 'English',
      portuguese: 'Português',
      darkMode: 'Modo Escuro',
      lightMode: 'Modo Claro',
      toggleTheme: 'Alternar tema',
      loading: 'Carregando links...',
      noLinksYet: 'Nenhum link público ainda',
      addFirstLink: 'Entre para adicionar seu primeiro link!',
      today: 'Hoje',
      yesterday: 'Ontem',
      description: 'Descrição',
      tags: 'Tags',
      postedBy: 'Postado por',
      backToMyLinks: 'Voltar aos Meus Links',
      yourLinks: 'Seus Links',
      manageYourLinks: 'Gerencie seus links',
      wantToShare: 'Quer compartilhar um link?',
      loginToShare: 'Entre para adicionar seus links e compartilhá-los com todos!'
    }
  },
  
  t(key) {
    const translation = this.translations[this.currentLang][key];
    return translation || this.translations['en'][key] || key;
  },
  
  detectLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('pt')) {
      this.currentLang = 'pt';
    } else {
      this.currentLang = 'en';
    }
    
    const savedLang = localStorage.getItem('language');
    if (savedLang && this.translations[savedLang]) {
      this.currentLang = savedLang;
    }
  },
  
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('language', lang);
    }
  }
});

i18n.detectLanguage();

const ToolsMixin = {
  methods: {
    t(key) {
      return i18n.t(key);
    },
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

const PublicLinksApp = {
  mixins: [ToolsMixin],
  data() {
    return {
      links: {},
      loading: {
        links: false
      },
      isAuthenticated: false,
      isDarkMode: false,
      // Remove currentLanguage from data since we'll use computed property
    }
  },
  created() {
    this.checkAuth();
    this.getPublicLinks();
    this.initTheme();
  },
  computed: {
    byDate() {
      return Object.keys(this.links).sort().reverse();
    },
    hasLinks() {
      return Object.keys(this.links).length > 0;
    },
    currentLanguage() {
      return i18n.currentLang;
    }
  },
  methods: {
    checkAuth() {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      this.isAuthenticated = !!(token && user);
    },
    changeLanguage(lang) {
      i18n.setLanguage(lang);
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
    getPublicLinks() {
      this.loading.links = true;
      
      fetch('/api/public-links')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load public links');
        }
        return res.json();
      })
      .then(json => {
        this.links = json || {};
      })
      .catch(err => {
        console.error('Error loading public links:', err);
      })
      .finally(() => {
        this.loading.links = false;
      });
    }
  },
  template: `
  <div class="app" :class="{ 'dark-mode': isDarkMode }">
  <div class="public-app">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <h1>{{ t('appTitle') }}</h1>
        <p>{{ t('appSubtitle') }}</p>
      </div>
      <div class="user-info">
        <select v-model="currentLanguage" @change="changeLanguage($event.target.value)" class="lang-select">
          <option value="en">{{ t('english') }}</option>
          <option value="pt">{{ t('portuguese') }}</option>
        </select>
        <button @click="toggleTheme()" class="theme-btn" :title="t('toggleTheme')">
          {{ isDarkMode ? t('lightMode') : t('darkMode') }}
        </button>
        <a v-if="!isAuthenticated" href="/login" class="login-btn">{{ t('login') }}</a>
        <a v-if="isAuthenticated" href="/" class="login-btn">{{ t('backToMyLinks') }}</a>
      </div>
    </header>
    
    <!-- Public Info Sidebar -->
    <div class="public-info">
      <!-- Add Link Call-to-Action -->
      <div v-if="!isAuthenticated" class="add-link-cta">
        <h3>{{ t('wantToShare') }}</h3>
        <p>{{ t('loginToShare') }}</p>
        <a href="/login" class="primary-btn">{{ t('login') }}</a>
      </div>
      
      <!-- User Links shortcut if authenticated -->
      <div v-if="isAuthenticated" class="user-shortcut">
        <h3>{{ t('yourLinks') }}</h3>
        <p>{{ t('manageYourLinks') }}</p>
        <a href="/" class="primary-btn">{{ t('backToMyLinks') }}</a>
      </div>
    </div>
    
    <!-- Public Content Area -->
    <div class="public-content">
      <!-- Links Display -->
    <div class="links-container">
      <div v-if="loading.links" class="loading">
        {{ t('loading') }}
      </div>
      
      <div v-else-if="!hasLinks" class="empty-state">
        <h3>{{ t('noLinksYet') }}</h3>
        <p>{{ t('addFirstLink') }}</p>
        <a v-if="!isAuthenticated" href="/login" class="login-btn" style="margin-top: 15px; display: inline-block;">{{ t('loginToAddLinks') }}</a>
        <a v-if="isAuthenticated" href="/" class="login-btn" style="margin-top: 15px; display: inline-block;">{{ t('backToMyLinks') }}</a>
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
                <div class="link-meta">
                  <span class="link-time">{{ toTime(link.created_at) }}</span>
                  <span class="posted-by">{{ t('postedBy') }} <strong>{{ link.username }}</strong></span>
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
  </div>
  `
};

createApp(PublicLinksApp).mount('#app');