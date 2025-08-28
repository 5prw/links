package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"links/internal/auth"
	"links/internal/db"
)

func main() {
	var username = flag.String("username", "admin", "Admin username")
	var password = flag.String("password", "admin123", "Admin password")
	flag.Parse()

	if *password == "admin123" {
		fmt.Println("WARNING: Using default password. Please change it after first login.")
	}

	// Get current working directory (for go run compatibility)
	workDir, err := os.Getwd()
	if err != nil {
		log.Fatal("Failed to get working directory:", err)
	}
	
	dataDir := filepath.Join(workDir, "data")
	
	// Ensure data directory exists
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		log.Fatal("Failed to create data directory:", err)
	}
	
	// Initialize database
	database, err := db.New(filepath.Join(dataDir, "links.db"))
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.Close()

	// Hash password
	hashedPassword, err := auth.HashPassword(*password)
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	// Create admin user
	createdAt := time.Now().Format("2006-01-02 15:04:05")
	userID, err := database.CreateUser(*username, hashedPassword, createdAt)
	if err != nil {
		log.Fatal("Failed to create user:", err)
	}

	// Make user admin
	err = database.AdminToggleUserAdmin(int(userID), true)
	if err != nil {
		log.Fatal("Failed to make user admin:", err)
	}

	fmt.Printf("Admin user created successfully!\n")
	fmt.Printf("Username: %s\n", *username)
	fmt.Printf("Password: %s\n", *password)
	fmt.Printf("User ID: %d\n", userID)
	fmt.Println("\nYou can now log in at /login and access the admin panel at /admin")
}