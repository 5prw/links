import { createApp, reactive } from 'vue';

// Internationalization system
const i18n = reactive({
  currentLang: 'en',
  
  translations: {
    en: {
      appTitle: 'Links',
      appSubtitle: 'Personal Link Manager',
      welcomeBack: 'Welcome back',
      createAccount: 'Create account',
      username: 'Username',
      password: 'Password',
      login: 'Login',
      register: 'Register',
      needAccount: 'Need an account? Register',
      haveAccount: 'Already have an account? Login',
      loginWithGoogle: 'Login with Google',
      orSeparator: 'OR',
      language: 'Language',
      english: 'English',
      portuguese: 'Português',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      toggleTheme: 'Toggle theme',
      usernameRequired: 'Username is required',
      passwordMinLength: 'Password must be at least 3 characters',
      loginFailed: 'Invalid credentials',
      registrationFailed: 'Username already exists or invalid data',
      backToPublicLinks: 'Back to Public Links'
    },
    pt: {
      appTitle: 'Links',
      appSubtitle: 'Gerenciador Pessoal de Links',
      welcomeBack: 'Bem-vindo de volta',
      createAccount: 'Criar conta',
      username: 'Usuário',
      password: 'Senha',
      login: 'Entrar',
      register: 'Cadastrar',
      needAccount: 'Precisa de uma conta? Cadastre-se',
      haveAccount: 'Já tem uma conta? Entre',
      loginWithGoogle: 'Entrar com Google',
      orSeparator: 'OU',
      language: 'Idioma',
      english: 'English',
      portuguese: 'Português',
      darkMode: 'Modo Escuro',
      lightMode: 'Modo Claro',
      toggleTheme: 'Alternar tema',
      usernameRequired: 'Usuário é obrigatório',
      passwordMinLength: 'Senha deve ter pelo menos 3 caracteres',
      loginFailed: 'Credenciais inválidas',
      registrationFailed: 'Usuário já existe ou dados inválidos',
      backToPublicLinks: 'Voltar aos Links Públicos'
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

const LoginApp = {
  data() {
    return {
      showLogin: true,
      username: '',
      password: '',
      loading: {
        auth: false
      },
      errors: {
        auth: ''
      },
      isDarkMode: false,
      // Remove currentLanguage from data since we'll use computed property
    }
  },
  created() {
    this.handleOAuthCallback();
    this.initTheme();
  },
  computed: {
    currentLanguage() {
      return i18n.currentLang;
    }
  },
  methods: {
    t(key) {
      return i18n.t(key);
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
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = '/';
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
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = '/';
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
    clearError(type) {
      this.errors[type] = '';
    },
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
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          window.location.href = '/';
        } catch (e) {
          console.error('Error parsing OAuth callback:', e);
        }
      }
    }
  },
  template: `
  <div class="app" :class="{ 'dark-mode': isDarkMode }">
    <div class="auth-container">
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
        
        <a href="/" class="link-btn" style="margin-top: 20px; display: block;">
          {{ t('backToPublicLinks') }}
        </a>
        
        <!-- Language Switcher -->
        <div class="language-switcher">
          <label>{{ t('language') }}:</label>
          <select v-model="currentLanguage" @change="changeLanguage($event.target.value)">
            <option value="en">{{ t('english') }}</option>
            <option value="pt">{{ t('portuguese') }}</option>
          </select>
        </div>

        <!-- Theme Toggle -->
        <div class="theme-switcher">
          <button @click="toggleTheme()" class="theme-btn" :title="t('toggleTheme')">
            {{ isDarkMode ? t('lightMode') : t('darkMode') }}
          </button>
        </div>
      </div>
    </div>
  </div>
  `
};

createApp(LoginApp).mount('#app');