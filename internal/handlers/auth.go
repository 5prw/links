package handlers

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strings"
	"time"

	"links/internal/auth"
	"links/internal/models"
)

type AuthHandler struct {
	db DatabaseInterface
}

type DatabaseInterface interface {
	CreateUser(username, hashedPassword, createdAt string) (int64, error)
	GetUserByUsername(username string) (*models.User, string, error)
}

func NewAuthHandler(db DatabaseInterface) *AuthHandler {
	return &AuthHandler{db: db}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req models.AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request format", http.StatusBadRequest)
		return
	}

	// Validate and sanitize inputs
	if !h.validateAuthRequest(&req) {
		http.Error(w, "Invalid username or password format", http.StatusBadRequest)
		return
	}

	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	createdAt := time.Now().Format("2006-01-02 15:04:05")
	userID, err := h.db.CreateUser(req.Username, hashedPassword, createdAt)
	if err != nil {
		http.Error(w, "Username already exists", http.StatusConflict)
		return
	}

	token, _ := auth.GenerateJWT(int(userID), req.Username, false) // New users are not admin by default

	user := models.User{
		ID:        int(userID),
		Username:  req.Username,
		IsAdmin:   false,
		CreatedAt: createdAt,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.AuthResponse{Token: token, User: user})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request format", http.StatusBadRequest)
		return
	}

	// Validate inputs (less strict for login than register)
	req.Username = strings.TrimSpace(req.Username)
	if req.Username == "" || req.Password == "" {
		http.Error(w, "Username and password required", http.StatusBadRequest)
		return
	}

	user, hashedPassword, err := h.db.GetUserByUsername(req.Username)
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	if err := auth.CheckPassword(hashedPassword, req.Password); err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	token, _ := auth.GenerateJWT(user.ID, user.Username, user.IsAdmin)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.AuthResponse{Token: token, User: *user})
}

// validateAuthRequest validates and sanitizes authentication requests
func (h *AuthHandler) validateAuthRequest(req *models.AuthRequest) bool {
	// Username validation
	req.Username = strings.TrimSpace(req.Username)
	if len(req.Username) < 3 || len(req.Username) > 50 {
		return false
	}

	// Username should only contain alphanumeric characters, underscores, and hyphens
	usernameRegex := regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
	if !usernameRegex.MatchString(req.Username) {
		return false
	}

	// Password validation
	if len(req.Password) < 6 || len(req.Password) > 128 {
		return false
	}

	// Password strength check - at least one letter, one number
	hasLetter := regexp.MustCompile(`[a-zA-Z]`).MatchString(req.Password)
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(req.Password)
	if !hasLetter || !hasNumber {
		return false
	}

	return true
}
