package main

import (
	"flag"
	"fmt"
	"net/http"
	"strings"

	"links/internal/auth"
	"links/internal/db"
	"links/internal/handlers"
	"links/internal/middleware"
)

var database *db.Database

func handler(w http.ResponseWriter, r *http.Request) {
	authHandler := handlers.NewAuthHandler(database)
	linksHandler := handlers.NewLinksHandler(database)
	oauthHandler := handlers.NewOAuthHandler(database)
	metadataHandler := handlers.NewMetadataHandler()

	// Auth endpoints (no auth required)
	if r.URL.Path == "/api/register" && r.Method == "POST" {
		authHandler.Register(w, r)
		return
	}
	if r.URL.Path == "/api/login" && r.Method == "POST" {
		authHandler.Login(w, r)
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

	// Metadata extraction endpoint
	if r.URL.Path == "/api/metadata" && r.Method == "GET" {
		middleware.AuthMiddleware(metadataHandler.ExtractMetadata)(w, r)
		return
	}

	// Serve static files
	if r.URL.Path == "/" {
		http.ServeFile(w, r, "./static/index.html")
		return
	}

	// For other static files, use file server
	fileServer := http.FileServer(http.Dir("./static/"))
	fileServer.ServeHTTP(w, r)
}

func initDB() error {
	var err error
	database, err = db.New("data/links.db")
	if err != nil {
		return err
	}
	return nil
}

func main() {
	var port = flag.String("port", "8080", "Port to listen")
	flag.Parse()

	// Initialize OAuth
	auth.InitOAuth()

	if err := initDB(); err != nil {
		panic("Failed to connect to database: " + err.Error())
	}
	defer database.Close()

	http.Handle("/", middleware.CorsMiddleware(http.HandlerFunc(handler)))

	fmt.Printf("Server started at port %v\n", *port)
	http.ListenAndServe(":"+*port, nil)
}
