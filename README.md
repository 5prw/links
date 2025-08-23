# Links - Personal Link Manager

A simple, fast personal link manager built with Go and Vue.js. Save, organize, and manage your bookmarks with automatic metadata extraction.

## Features

### Core Functionality
- **Personal Bookmarks**: Save URLs with descriptions and tags
- **User Authentication**: JWT-based auth with username/password or Google OAuth2
- **Link Management**: Add, view, delete links with date grouping
- **Auto-metadata**: Automatic title, description, and tag inference from URLs

### Technical Features
- **Lightweight**: Single binary ~4MB (75% smaller than original)
- **Fast**: Built with Go standard library + minimal dependencies
- **Secure**: Safe HTML parsing, request limits, authentication required
- **Responsive**: Clean, minimal interface works on all devices
- **Multilingual**: English and Portuguese support with browser detection

## Quick Start

### 1. Build and Run
```bash
go build -o links
./links --port 8080
```

### 2. Open Browser
Navigate to `http://localhost:8080`

### 3. Register Account
Create account or use Google OAuth2 (see configuration below)

## Configuration

### Environment Variables (Optional)
```bash
# Google OAuth2 (optional)
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret" 
export GOOGLE_REDIRECT_URL="http://localhost:8080/api/auth/google/callback"
```

### Google OAuth2 Setup
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create project and enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `http://localhost:8080/api/auth/google/callback`
5. Set environment variables above

## API Endpoints

### Authentication
- `POST /api/register` - Create new account
- `POST /api/login` - Login with username/password
- `GET /api/auth/google` - Google OAuth2 login
- `GET /api/auth/google/callback` - OAuth2 callback

### Links Management
- `GET /api/links` - Get user's links (grouped by date)
- `POST /api/links` - Add new link
- `DELETE /api/links/:id` - Delete link

### Metadata Extraction
- `GET /api/metadata?url=<URL>` - Extract title, description, tags from URL

## Database

Uses SQLite database stored in `data/links.db` with tables:
- `users` - User accounts (local + OAuth)
- `links` - User bookmarks with metadata

## Dependencies

Minimal dependencies for security and performance:
- `golang.org/x/crypto` - Password hashing
- `golang.org/x/oauth2` - Google OAuth2
- `golang.org/x/net/html` - Safe HTML parsing
- `modernc.org/sqlite` - Pure Go SQLite driver

## Development

### Project Structure
```
├── internal/
│   ├── auth/         # JWT and OAuth logic
│   ├── db/           # Database operations
│   ├── handlers/     # HTTP handlers
│   ├── middleware/   # CORS, auth middleware
│   └── models/       # Data structures
├── static/           # Frontend (Vue.js)
├── data/             # SQLite database
└── main.go           # Application entry point
```

### Build Options
```bash
# Development
go run main.go --port 8080

# Production build
go build -ldflags "-s -w" -o links

# Compressed binary (requires upx)
make release
```

## Security Features

- **Input Validation**: URL validation and sanitization
- **Request Limits**: Timeout, size limits, redirect protection
- **Authentication**: All endpoints protected except auth
- **Safe Parsing**: HTML parsing without code execution
- **Password Security**: bcrypt hashing
- **CORS**: Properly configured cross-origin requests

## Interface

Minimal, clean interface with:
- No icons, animations, or visual clutter
- Focus on functionality and content
- Responsive design for mobile/desktop
- Automatic language detection
- Auto-fill metadata suggestions

## License

Open source - feel free to use and modify.