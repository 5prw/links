package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"links/internal/auth"
	"links/internal/db"
	"links/internal/handlers"
	"links/internal/middleware"
)

var (
	database  *db.Database
	staticDir string
	dataDir   string
)

func handler(w http.ResponseWriter, r *http.Request) {
	authHandler := handlers.NewAuthHandler(database)
	linksHandler := handlers.NewLinksHandler(database)
	oauthHandler := handlers.NewOAuthHandler(database)
	adminHandler := handlers.NewAdminHandler(database)
	metadataHandler := handlers.NewMetadataHandler()

	// Auth endpoints (no auth required) - with rate limiting
	if r.URL.Path == "/api/register" && r.Method == "POST" {
		middleware.AuthRateLimit(http.HandlerFunc(authHandler.Register)).ServeHTTP(w, r)
		return
	}
	if r.URL.Path == "/api/login" && r.Method == "POST" {
		middleware.AuthRateLimit(http.HandlerFunc(authHandler.Login)).ServeHTTP(w, r)
		return
	}

	// OAuth endpoints
	if r.URL.Path == "/api/auth/google" && r.Method == "GET" {
		oauthHandler.GoogleLogin(w, r)
		return
	}
	if r.URL.Path == "/api/auth/google/callback" && r.Method == "GET" {
		oauthHandler.GoogleCallback(w, r)
		return
	}

	// Protected endpoints
	if r.URL.Path == "/api/links" {
		switch r.Method {
		case "POST":
			middleware.AuthMiddleware(linksHandler.CreateLink)(w, r)
		case "GET":
			middleware.AuthMiddleware(linksHandler.GetLinks)(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
		return
	}

	// Handle DELETE /api/links/:id
	if strings.HasPrefix(r.URL.Path, "/api/links/") && r.Method == "DELETE" {
		middleware.AuthMiddleware(linksHandler.DeleteLink)(w, r)
		return
	}

	// Handle PUT /api/links/:id/favorite
	if strings.HasPrefix(r.URL.Path, "/api/links/") && strings.HasSuffix(r.URL.Path, "/favorite") && r.Method == "PUT" {
		middleware.AuthMiddleware(linksHandler.ToggleFavorite)(w, r)
		return
	}

	// Handle PUT /api/links/:id/access
	if strings.HasPrefix(r.URL.Path, "/api/links/") && strings.HasSuffix(r.URL.Path, "/access") && r.Method == "PUT" {
		middleware.AuthMiddleware(linksHandler.IncrementAccess)(w, r)
		return
	}

	// Handle PUT /api/links/:id/privacy
	if strings.HasPrefix(r.URL.Path, "/api/links/") && strings.HasSuffix(r.URL.Path, "/privacy") && r.Method == "PUT" {
		middleware.AuthMiddleware(linksHandler.TogglePrivacy)(w, r)
		return
	}

	// Metadata extraction endpoint - with rate limiting and auth
	if r.URL.Path == "/api/metadata" && r.Method == "GET" {
		middleware.MetadataRateLimit(
			http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				middleware.AuthMiddleware(metadataHandler.ExtractMetadata)(w, r)
			}),
		).ServeHTTP(w, r)
		return
	}

	// Public links endpoint (no auth required)
	if r.URL.Path == "/api/public-links" && r.Method == "GET" {
		linksHandler.GetPublicLinks(w, r)
		return
	}

	// Admin endpoints - require admin authentication
	if strings.HasPrefix(r.URL.Path, "/api/admin/") {
		switch {
		case r.URL.Path == "/api/admin/links" && r.Method == "GET":
			middleware.AuthMiddleware(adminHandler.GetAllLinks)(w, r)
		case r.URL.Path == "/api/admin/users" && r.Method == "GET":
			middleware.AuthMiddleware(adminHandler.GetAllUsers)(w, r)
		case strings.HasPrefix(r.URL.Path, "/api/admin/links/") && strings.HasSuffix(r.URL.Path, "/delete") && r.Method == "DELETE":
			middleware.AuthMiddleware(adminHandler.DeleteLink)(w, r)
		case strings.HasPrefix(r.URL.Path, "/api/admin/links/") && strings.HasSuffix(r.URL.Path, "/lock") && r.Method == "PUT":
			middleware.AuthMiddleware(adminHandler.ToggleLinkLock)(w, r)
		case strings.HasPrefix(r.URL.Path, "/api/admin/links/") && strings.HasSuffix(r.URL.Path, "/force-private") && r.Method == "PUT":
			middleware.AuthMiddleware(adminHandler.ForcePrivateLink)(w, r)
		case strings.HasPrefix(r.URL.Path, "/api/admin/users/") && strings.HasSuffix(r.URL.Path, "/admin") && r.Method == "PUT":
			middleware.AuthMiddleware(adminHandler.ToggleUserAdmin)(w, r)
		case strings.HasPrefix(r.URL.Path, "/api/admin/users/") && strings.HasSuffix(r.URL.Path, "/delete") && r.Method == "DELETE":
			middleware.AuthMiddleware(adminHandler.DeleteUser)(w, r)
		default:
			http.Error(w, "Not found", http.StatusNotFound)
		}
		return
	}

	// Serve login page
	if r.URL.Path == "/login" {
		// Set no-cache headers for login page
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
		http.ServeFile(w, r, filepath.Join(staticDir, "login.html"))
		return
	}

	// Serve admin page
	if r.URL.Path == "/admin" {
		// Set no-cache headers for admin page
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
		http.ServeFile(w, r, filepath.Join(staticDir, "admin.html"))
		return
	}

	// Serve static files
	if r.URL.Path == "/" {
		// Set no-cache headers for main page
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
		http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
		return
	}

	// For other static files, use file server with conditional caching
	path := r.URL.Path
	// Disable cache for JS, CSS, and HTML files to see updates immediately
	if strings.HasSuffix(path, ".js") || strings.HasSuffix(path, ".css") || strings.HasSuffix(path, ".html") {
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
	}
	fileServer := http.FileServer(http.Dir(staticDir))
	fileServer.ServeHTTP(w, r)
}

func initDB() error {
	// Ensure data directory exists
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return err
	}
	
	var err error
	database, err = db.New(filepath.Join(dataDir, "links.db"))
	if err != nil {
		return err
	}
	return nil
}

func initPaths() error {
	// First try working directory (for go run)
	workDir, err := os.Getwd()
	if err == nil {
		staticDir = filepath.Join(workDir, "static")
		dataDir = filepath.Join(workDir, "data")
		
		// Check if static directory exists in working directory
		if _, err := os.Stat(staticDir); err == nil {
			return nil
		}
	}
	
	// Fallback to executable path (for built binary)
	exe, err := os.Executable()
	if err != nil {
		return err
	}
	
	// Get directory containing the executable
	exeDir := filepath.Dir(exe)
	
	// Set paths relative to executable
	staticDir = filepath.Join(exeDir, "static")
	dataDir = filepath.Join(exeDir, "data")
	
	// Check if static directory exists
	if _, err := os.Stat(staticDir); os.IsNotExist(err) {
		return fmt.Errorf("static directory not found at: %s", staticDir)
	}
	
	return nil
}

func main() {
	var port = flag.String("port", "8080", "Port to listen")
	flag.Parse()

	// Initialize paths relative to executable
	if err := initPaths(); err != nil {
		panic("Failed to initialize paths: " + err.Error())
	}

	// Initialize OAuth
	auth.InitOAuth()

	if err := initDB(); err != nil {
		panic("Failed to connect to database: " + err.Error())
	}
	defer database.Close()

	http.Handle("/", middleware.CorsMiddleware(middleware.GeneralRateLimit(http.HandlerFunc(handler))))

	fmt.Printf("Server started at port %v\n", *port)
	fmt.Printf("Static files: %s\n", staticDir)
	fmt.Printf("Database: %s\n", filepath.Join(dataDir, "links.db"))
	http.ListenAndServe(":"+*port, nil)
}
