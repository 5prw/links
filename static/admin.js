import { createApp, ref, onMounted } from 'vue'

const { createApp: Vue } = { createApp }

const AdminApp = {
  setup() {
    const user = ref(null)
    const token = ref(localStorage.getItem('token'))
    const allUsers = ref([])
    const allLinks = ref([])
    const activeTab = ref('users')
    const loading = ref(false)
    const error = ref('')

    const checkAuth = () => {
      if (!token.value) {
        window.location.href = '/login'
        return false
      }
      
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          user.value = JSON.parse(userData)
          if (!user.value.isAdmin) {
            error.value = 'Admin access required'
            setTimeout(() => {
              window.location.href = '/'
            }, 2000)
            return false
          }
        }
      } catch (e) {
        console.error('Error parsing user data:', e)
        logout()
        return false
      }
      
      return true
    }

    const fetchUsers = async () => {
      if (!token.value) return
      
      try {
        loading.value = true
        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          allUsers.value = await response.json()
        } else {
          error.value = 'Failed to fetch users'
        }
      } catch (err) {
        error.value = 'Network error while fetching users'
      } finally {
        loading.value = false
      }
    }

    const fetchLinks = async () => {
      if (!token.value) return
      
      try {
        loading.value = true
        const response = await fetch('/api/admin/links', {
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          allLinks.value = await response.json()
        } else {
          error.value = 'Failed to fetch links'
        }
      } catch (err) {
        error.value = 'Network error while fetching links'
      } finally {
        loading.value = false
      }
    }

    const toggleUserAdmin = async (userId, isAdmin) => {
      if (!token.value) return
      
      try {
        const response = await fetch(`/api/admin/users/${userId}/admin`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ is_admin: isAdmin })
        })
        
        if (response.ok) {
          await fetchUsers()
        } else {
          error.value = 'Failed to toggle admin status'
        }
      } catch (err) {
        error.value = 'Network error while updating user'
      }
    }

    const deleteUser = async (userId) => {
      if (!confirm('Are you sure you want to delete this user? This will also delete all their links.')) {
        return
      }
      
      if (!token.value) return
      
      try {
        const response = await fetch(`/api/admin/users/${userId}/delete`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token.value}`
          }
        })
        
        if (response.ok) {
          await fetchUsers()
        } else {
          error.value = 'Failed to delete user'
        }
      } catch (err) {
        error.value = 'Network error while deleting user'
      }
    }

    const deleteLink = async (linkId) => {
      if (!confirm('Are you sure you want to delete this link?')) {
        return
      }
      
      if (!token.value) return
      
      try {
        const response = await fetch(`/api/admin/links/${linkId}/delete`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token.value}`
          }
        })
        
        if (response.ok) {
          await fetchLinks()
        } else {
          error.value = 'Failed to delete link'
        }
      } catch (err) {
        error.value = 'Network error while deleting link'
      }
    }

    const toggleLinkLock = async (linkId, isLocked) => {
      if (!token.value) return
      
      try {
        const response = await fetch(`/api/admin/links/${linkId}/lock`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ is_locked: isLocked })
        })
        
        if (response.ok) {
          await fetchLinks()
        } else {
          error.value = 'Failed to toggle lock status'
        }
      } catch (err) {
        error.value = 'Network error while updating link'
      }
    }

    const forcePrivateLink = async (linkId) => {
      if (!confirm('Force this link to private and lock it?')) {
        return
      }
      
      if (!token.value) return
      
      try {
        const response = await fetch(`/api/admin/links/${linkId}/force-private`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token.value}`
          }
        })
        
        if (response.ok) {
          await fetchLinks()
        } else {
          error.value = 'Failed to force private'
        }
      } catch (err) {
        error.value = 'Network error while updating link'
      }
    }

    const logout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    const switchTab = (tab) => {
      activeTab.value = tab
      error.value = ''
      
      if (tab === 'users') {
        fetchUsers()
      } else if (tab === 'links') {
        fetchLinks()
      }
    }

    onMounted(() => {
      if (checkAuth()) {
        fetchUsers()
      }
    })

    return {
      user,
      allUsers,
      allLinks,
      activeTab,
      loading,
      error,
      switchTab,
      toggleUserAdmin,
      deleteUser,
      deleteLink,
      toggleLinkLock,
      forcePrivateLink,
      logout
    }
  },

  template: `
    <div class="container">
      <header class="header">
        <div class="header-content">
          <h1>🔗 Admin Panel</h1>
          <div class="user-info">
            <span v-if="user">{{ user.username }} (Admin)</span>
            <button @click="logout" class="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <nav class="admin-nav">
        <button 
          @click="switchTab('users')" 
          :class="['nav-btn', { active: activeTab === 'users' }]"
        >
          Users
        </button>
        <button 
          @click="switchTab('links')" 
          :class="['nav-btn', { active: activeTab === 'links' }]"
        >
          Links
        </button>
      </nav>

      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="loading" class="loading">Loading...</div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="admin-section">
        <h2>User Management</h2>
        <div v-if="allUsers.length === 0" class="empty-message">No users found</div>
        <div v-else class="users-list">
          <div v-for="u in allUsers" :key="u.id" class="user-item">
            <div class="user-info">
              <strong>{{ u.username }}</strong>
              <span class="user-meta">ID: {{ u.id }} | Created: {{ u.createdAt }}</span>
              <span v-if="u.isAdmin" class="admin-badge">ADMIN</span>
            </div>
            <div class="user-actions">
              <button 
                v-if="u.id !== user?.id"
                @click="toggleUserAdmin(u.id, !u.isAdmin)" 
                :class="['admin-toggle-btn', { active: u.isAdmin }]"
              >
                {{ u.isAdmin ? 'Remove Admin' : 'Make Admin' }}
              </button>
              <button 
                v-if="u.id !== user?.id"
                @click="deleteUser(u.id)" 
                class="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Links Tab -->
      <div v-if="activeTab === 'links'" class="admin-section">
        <h2>Link Management</h2>
        <div v-if="allLinks.length === 0" class="empty-message">No links found</div>
        <div v-else class="links-list">
          <div v-for="link in allLinks" :key="link.id" class="link-item">
            <div class="link-info">
              <a :href="link.url" target="_blank" class="link-url">{{ link.url }}</a>
              <div class="link-meta">
                <span>By: {{ link.username }}</span>
                <span>{{ link.created_at }}</span>
                <span v-if="link.is_private" class="privacy-badge">PRIVATE</span>
                <span v-if="link.is_locked" class="locked-badge">LOCKED</span>
              </div>
              <div v-if="link.description" class="link-description">{{ link.description }}</div>
            </div>
            <div class="link-actions">
              <button 
                @click="toggleLinkLock(link.id, !link.is_locked)" 
                :class="['lock-btn', { active: link.is_locked }]"
              >
                {{ link.is_locked ? 'Unlock' : 'Lock' }}
              </button>
              <button 
                v-if="!link.is_private || !link.is_locked"
                @click="forcePrivateLink(link.id)" 
                class="private-btn"
              >
                Force Private
              </button>
              <button 
                @click="deleteLink(link.id)" 
                class="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

createApp(AdminApp).mount('#app')