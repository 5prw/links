package handlers

import (
	"encoding/json"
	"net/http"
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
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.Username == "" || req.Password == "" {
		http.Error(w, "Username and password required", http.StatusBadRequest)
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

	token, _ := auth.GenerateJWT(int(userID), req.Username)

	user := models.User{
		ID:        int(userID),
		Username:  req.Username,
		CreatedAt: createdAt,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.AuthResponse{Token: token, User: user})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
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

	token, _ := auth.GenerateJWT(user.ID, user.Username)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.AuthResponse{Token: token, User: *user})
}