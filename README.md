# Links Manager

A modern and responsive personal link management system built with Go and Vue.js 3.

## 🚀 Features

### Core Functionality
- **Link Management**: Easily add, edit, and delete links
- **Privacy System**: Public and private links with granular control
- **Authentication**: Complete system with Google OAuth and traditional authentication
- **Search & Filters**: Text search, privacy filters, and category filtering
- **Favorites System**: Mark links as favorites for quick access
- **Categorization**: Organize your links with customizable categories
- **Access Counter**: Track how many times each link has been accessed
- **Custom Sorting**: Sort by date, alphabetical, access count, or category

### Interface & Experience
- **Responsive Layout**: Interface optimized for desktop, tablet, and mobile
- **Dark Mode**: Toggle between light and dark modes with persistence
- **Internationalization**: Complete support for Portuguese and English
- **Modern Design**: Grid layout with sidebar for better space utilization
- **Auto-fill**: Automatic extraction of link metadata

### Technology Stack
- **Backend**: Go with embedded SQLite
- **Frontend**: Vue.js 3 with responsive CSS Grid
- **Authentication**: JWT + Google OAuth
- **Database**: SQLite with automatic migrations

## 🚀 Installation & Usage

### 1. Run the Server
```bash
go run main.go
# or specify port:
go run main.go -port 3000
```

### 2. Access the Application
Navigate to `http://localhost:8080`

### 3. Create Account
- Register with username/password
- Or use Google login (optional configuration)

### 4. Admin Setup (Optional)
```bash
# Create admin user for moderation
go run create_admin.go -username admin -password yourpassword
# Access admin panel at /admin after logging in
```

## ⚙️ Configuration

### Google OAuth (Optional)
```bash
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"
export GOOGLE_REDIRECT_URL="http://localhost:8080/api/auth/google/callback"
```

### Setting up Google OAuth
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a project and enable the Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `http://localhost:8080/api/auth/google/callback`
5. Set the environment variables above

## 📖 How to Use

### Link Management
1. **Add Link**: Enter URL, use auto-fill for metadata, add category
2. **Search**: Use the search bar to filter by URL, description, or tags
3. **Filter**: Filter by privacy (public/private/favorites) or category
4. **Sort**: Sort by date, alphabetical, most accessed, or category
5. **Favorites**: Click "Favorite" to mark important links

### Interface
- **Desktop (1024px+)**: Grid layout with sidebar and main area
- **Mobile (<1024px)**: Single column layout optimized for touch
- **Dark Mode**: Toggle between light/dark mode in header

### Administration (Admin Users)
- **User Management**: Promote/demote admin users, delete accounts
- **Link Moderation**: Delete any link, lock privacy settings, force private
- **Access Control**: Prevent link owners from changing privacy when locked

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - Create account
- `POST /api/login` - Username/password login
- `GET /api/auth/google` - Google OAuth2 login
- `GET /api/auth/google/callback` - OAuth2 callback

### Link Management
- `GET /api/links` - Get user's links (grouped by date)
- `POST /api/links` - Add new link
- `DELETE /api/links/:id` - Delete link
- `PUT /api/links/:id/favorite` - Toggle favorite
- `PUT /api/links/:id/privacy` - Toggle privacy (if not locked)
- `PUT /api/links/:id/access` - Increment access counter

### Administration (Admin Only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/links` - Get all links
- `PUT /api/admin/users/:id/admin` - Toggle admin status
- `DELETE /api/admin/users/:id/delete` - Delete user
- `DELETE /api/admin/links/:id/delete` - Delete any link
- `PUT /api/admin/links/:id/lock` - Lock/unlock link privacy
- `PUT /api/admin/links/:id/force-private` - Force link private and lock

### Other
- `GET /api/metadata?url=<URL>` - Extract URL metadata
- `GET /api/public-links` - Get public links

## 💾 Database

SQLite stored in `data/links.db` with tables:
- `users` - User accounts (local + OAuth) with admin status
- `links` - Links with metadata, privacy, favorites, categories, access counter, and lock status

## 🛠️ Development

### Project Structure
```
links/
├── main.go              # Main server and routing
├── create_admin.go      # Admin user creation utility
├── internal/
│   ├── auth/            # JWT and OAuth authentication
│   ├── db/              # Database operations
│   ├── handlers/        # HTTP API handlers (auth, links, admin)
│   ├── middleware/      # Middlewares (CORS, auth, rate limiting)
│   └── models/          # Data models
├── static/
│   ├── app.js           # Main Vue.js application
│   ├── login.js         # Login page
│   ├── public.js        # Public links page
│   ├── admin.js         # Admin panel
│   ├── main.css         # Consolidated CSS with dark mode
│   ├── assets/
│   │   └── js/          # Organized JavaScript modules
│   └── *.html          # HTML templates
└── data/                # SQLite database and files
```

### Dependencies
Minimal dependencies for security and performance:
- `golang.org/x/crypto` - Password hashing
- `golang.org/x/oauth2` - Google OAuth2
- `golang.org/x/net/html` - Safe HTML parsing
- `modernc.org/sqlite` - Pure Go SQLite driver

### Build & Deploy
```bash
# Development
go run main.go

# Production build
go build -o links main.go

# Run build
./links -port 8080
```

## 🔒 Security Features

- **Input Validation**: URL validation and sanitization
- **Request Limits**: Timeout, size limits, redirect protection
- **Authentication**: All endpoints protected except auth
- **Safe Parsing**: HTML parsing without code execution
- **Secure Passwords**: bcrypt hashing
- **CORS**: Proper configuration for cross-origin requests
- **Rate Limiting**: Tiered rate limiting (general, auth, metadata)
- **SSRF Protection**: Blocks private IP ranges and localhost
- **Admin Controls**: Role-based access with granular permissions

## 🎨 Interface

Functionality-focused design:
- Clean interface without unnecessary icons
- Focus on content and usability
- Responsive mobile/desktop design
- Automatic language detection
- Automatic metadata suggestions
- Monospace Iosevka font for better readability
- Minimal color palette (only blue for links)

## 📝 License

Open source project - feel free to use and modify.