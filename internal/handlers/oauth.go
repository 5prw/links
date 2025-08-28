package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"net/url"
	"time"

	"links/internal/auth"
	"links/internal/models"
)

type OAuthHandler struct {
	db OAuthDBInterface
}

type OAuthDBInterface interface {
	CreateOAuthUser(email, name, googleID, createdAt string) (int64, error)
	GetUserByGoogleID(googleID string) (*models.User, error)
	GetUserByEmail(email string) (*models.User, error)
}

func NewOAuthHandler(db OAuthDBInterface) *OAuthHandler {
	return &OAuthHandler{db: db}
}

func (h *OAuthHandler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	url := auth.GetGoogleLoginURL()
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (h *OAuthHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")

	if code == "" {
		http.Error(w, "Code not found", http.StatusBadRequest)
		return
	}

	googleUser, err := auth.HandleGoogleCallback(code, state)
	if err != nil {
		log.Printf("Error handling Google callback: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("Google user received: ID=%s, Email=%s, Name=%s", googleUser.ID, googleUser.Email, googleUser.Name)

	// Try to find user by Google ID first
	user, err := h.db.GetUserByGoogleID(googleUser.ID)
	if err != nil {
		// If not found by Google ID, try by email
		user, err = h.db.GetUserByEmail(googleUser.Email)
		if err != nil {
			// Create new user
			createdAt := time.Now().Format("2006-01-02 15:04:05")
			userID, err := h.db.CreateOAuthUser(googleUser.Email, googleUser.Email, googleUser.ID, createdAt)
			if err != nil {
				log.Printf("Error creating OAuth user: %v", err)
				http.Error(w, "Failed to create user", http.StatusInternalServerError)
				return
			}

			user = &models.User{
				ID:        int(userID),
				Username:  googleUser.Email,
				IsAdmin:   false,
				CreatedAt: createdAt,
			}
		}
	}

	// Generate JWT token
	token, err := auth.GenerateJWT(user.ID, user.Username, user.IsAdmin)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	// Redirect to frontend with token and user data
	userJSON, _ := json.Marshal(user)
	redirectURL := "/?token=" + url.QueryEscape(token) + "&user=" + url.QueryEscape(string(userJSON))
	http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
}