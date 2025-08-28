package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"links/internal/middleware"
	"links/internal/models"
)

type LinksHandler struct {
	db LinksDBInterface
}

type LinksDBInterface interface {
	CreateLink(userID int, url string, description, tags, category *string, createdAt string, isPrivate bool) (int64, error)
	GetLinksByUserID(userID int) ([]models.Link, error)
	GetPublicLinks() ([]models.Link, error)
	ToggleFavorite(linkID, userID int, isFavorite bool) error
	TogglePrivacy(linkID, userID int, isPrivate bool) error
	DeleteLink(linkID, userID int) error
	IncrementAccessCount(linkID int) error
}

func NewLinksHandler(db LinksDBInterface) *LinksHandler {
	return &LinksHandler{db: db}
}

func (h *LinksHandler) CreateLink(w http.ResponseWriter, r *http.Request) {
	var link models.Link

	err := json.NewDecoder(r.Body).Decode(&link)
	if err != nil {
		http.Error(w, "Invalid request format", http.StatusBadRequest)
		return
	}

	// Validate and sanitize inputs
	if !h.validateAndSanitizeLink(&link) {
		http.Error(w, "Invalid link data", http.StatusBadRequest)
		return
	}

	userID, _ := strconv.Atoi(r.Header.Get("X-User-ID"))
	link.UserID = userID
	
	// Use client timestamp if provided, otherwise use server timestamp
	if link.CreatedAt == "" {
		link.CreatedAt = time.Now().Format("2006-01-02 15:04:05")
	}

	id, err := h.db.CreateLink(link.UserID, link.URL, link.Description, link.Tags, link.Category, link.CreatedAt, link.IsPrivate)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	link.ID = int(id)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(link)
}

func (h *LinksHandler) GetPublicLinks(w http.ResponseWriter, r *http.Request) {
	links, err := h.db.GetPublicLinks()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	groupedLinks := make(map[string][]models.Link)
	for _, link := range links {
		date := link.CreatedAt[:10]
		groupedLinks[date] = append(groupedLinks[date], link)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(groupedLinks)
}

func (h *LinksHandler) GetLinks(w http.ResponseWriter, r *http.Request) {
	userID, _ := strconv.Atoi(r.Header.Get("X-User-ID"))
	
	links, err := h.db.GetLinksByUserID(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	groupedLinks := make(map[string][]models.Link)
	for _, link := range links {
		date := link.CreatedAt[:10]
		groupedLinks[date] = append(groupedLinks[date], link)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(groupedLinks)
}

func (h *LinksHandler) ToggleFavorite(w http.ResponseWriter, r *http.Request) {
	userID, _ := strconv.Atoi(r.Header.Get("X-User-ID"))
	
	// Extract link ID from URL path
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 4 {
		http.Error(w, "Invalid link ID", http.StatusBadRequest)
		return
	}
	
	linkID, err := strconv.Atoi(parts[3])
	if err != nil {
		http.Error(w, "Invalid link ID", http.StatusBadRequest)
		return
	}
	
	var request struct {
		IsFavorite bool `json:"is_favorite"`
	}
	
	err = json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	err = h.db.ToggleFavorite(linkID, userID, request.IsFavorite)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Link not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

func (h *LinksHandler) TogglePrivacy(w http.ResponseWriter, r *http.Request) {
	userID, _ := strconv.Atoi(r.Header.Get("X-User-ID"))
	
	// Extract link ID from URL path
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 4 {
		http.Error(w, "Invalid link ID", http.StatusBadRequest)
		return
	}
	
	linkID, err := strconv.Atoi(parts[3])
	if err != nil {
		http.Error(w, "Invalid link ID", http.StatusBadRequest)
		return
	}
	
	var request struct {
		IsPrivate bool `json:"is_private"`
	}
	
	err = json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	err = h.db.TogglePrivacy(linkID, userID, request.IsPrivate)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Link not found", http.StatusNotFound)
		} else if strings.Contains(err.Error(), "locked by administrator") {
			http.Error(w, err.Error(), http.StatusForbidden)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

func (h *LinksHandler) DeleteLink(w http.ResponseWriter, r *http.Request) {
	userID, _ := strconv.Atoi(r.Header.Get("X-User-ID"))
	
	// Extract link ID from URL path
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 4 {
		http.Error(w, "Invalid link ID", http.StatusBadRequest)
		return
	}
	
	linkID, err := strconv.Atoi(parts[3])
	if err != nil {
		http.Error(w, "Invalid link ID", http.StatusBadRequest)
		return
	}
	
	err = h.db.DeleteLink(linkID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Link not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

func (h *LinksHandler) IncrementAccess(w http.ResponseWriter, r *http.Request) {
	// Extract link ID from URL path
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 4 {
		http.Error(w, "Invalid link ID", http.StatusBadRequest)
		return
	}
	
	linkID, err := strconv.Atoi(parts[3])
	if err != nil {
		http.Error(w, "Invalid link ID", http.StatusBadRequest)
		return
	}
	
	err = h.db.IncrementAccessCount(linkID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

// validateAndSanitizeLink validates and sanitizes link data
func (h *LinksHandler) validateAndSanitizeLink(link *models.Link) bool {
	// Validate and sanitize URL
	sanitizedURL, err := middleware.Sanitizer.SanitizeURL(link.URL)
	if err != nil || sanitizedURL == "" {
		return false
	}
	link.URL = sanitizedURL

	// Sanitize description
	if link.Description != nil {
		sanitized := middleware.Sanitizer.SanitizeText(*link.Description)
		link.Description = &sanitized
	}

	// Sanitize tags
	if link.Tags != nil {
		sanitized := middleware.Sanitizer.SanitizeTags(*link.Tags)
		link.Tags = &sanitized
	}

	// Sanitize category
	if link.Category != nil {
		sanitized := middleware.Sanitizer.SanitizeCategory(*link.Category)
		link.Category = &sanitized
	}

	return true
}