package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"links/internal/db"
	"links/internal/middleware"
)

type AdminHandler struct {
	db *db.Database
}

func NewAdminHandler(database *db.Database) *AdminHandler {
	return &AdminHandler{db: database}
}

func (h *AdminHandler) GetAllLinks(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUserFromContext(r.Context())
	if user == nil || !user.IsAdmin {
		http.Error(w, "Admin access required", http.StatusForbidden)
		return
	}

	links, err := h.db.GetAllLinks()
	if err != nil {
		http.Error(w, "Failed to get links", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(links)
}

func (h *AdminHandler) GetAllUsers(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUserFromContext(r.Context())
	if user == nil || !user.IsAdmin {
		http.Error(w, "Admin access required", http.StatusForbidden)
		return
	}

	users, err := h.db.GetAllUsers()
	if err != nil {
		http.Error(w, "Failed to get users", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func (h *AdminHandler) DeleteLink(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUserFromContext(r.Context())
	if user == nil || !user.IsAdmin {
		http.Error(w, "Admin access required", http.StatusForbidden)
		return
	}

	// Extract link ID from URL path (/api/admin/links/123/delete)
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 5 {
		http.Error(w, "Invalid link ID", http.StatusBadRequest)
		return
	}
	linkID, err := strconv.Atoi(parts[4])
	if err != nil {
		http.Error(w, "Invalid link ID", http.StatusBadRequest)
		return
	}

	err = h.db.AdminDeleteLink(linkID)
	if err == sql.ErrNoRows {
		http.Error(w, "Link not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to delete link", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

type LinkLockRequest struct {
	IsLocked bool `json:"is_locked"`
}

func (h *AdminHandler) ToggleLinkLock(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUserFromContext(r.Context())
	if user == nil || !user.IsAdmin {
		http.Error(w, "Admin access required", http.StatusForbidden)
		return
	}

	// Extract link ID from URL path (/api/admin/links/123/lock)
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 5 {
		http.Error(w, "Invalid link ID", http.StatusBadRequest)
		return
	}
	linkID, err := strconv.Atoi(parts[4])
	if err != nil {
		http.Error(w, "Invalid link ID", http.StatusBadRequest)
		return
	}

	var req LinkLockRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err = h.db.AdminToggleLinkLock(linkID, req.IsLocked)
	if err == sql.ErrNoRows {
		http.Error(w, "Link not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to toggle lock", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *AdminHandler) ForcePrivateLink(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUserFromContext(r.Context())
	if user == nil || !user.IsAdmin {
		http.Error(w, "Admin access required", http.StatusForbidden)
		return
	}

	// Extract link ID from URL path (/api/admin/links/123/force-private)
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 5 {
		http.Error(w, "Invalid link ID", http.StatusBadRequest)
		return
	}
	linkID, err := strconv.Atoi(parts[4])
	if err != nil {
		http.Error(w, "Invalid link ID", http.StatusBadRequest)
		return
	}

	err = h.db.AdminForcePrivateLink(linkID)
	if err == sql.ErrNoRows {
		http.Error(w, "Link not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to force private", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

type UserAdminRequest struct {
	IsAdmin bool `json:"is_admin"`
}

func (h *AdminHandler) ToggleUserAdmin(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUserFromContext(r.Context())
	if user == nil || !user.IsAdmin {
		http.Error(w, "Admin access required", http.StatusForbidden)
		return
	}

	// Extract user ID from URL path (/api/admin/users/123/admin)
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 5 {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}
	userID, err := strconv.Atoi(parts[4])
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Prevent admin from demoting themselves
	if userID == user.ID {
		http.Error(w, "Cannot modify own admin status", http.StatusBadRequest)
		return
	}

	var req UserAdminRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err = h.db.AdminToggleUserAdmin(userID, req.IsAdmin)
	if err == sql.ErrNoRows {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to toggle admin", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *AdminHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUserFromContext(r.Context())
	if user == nil || !user.IsAdmin {
		http.Error(w, "Admin access required", http.StatusForbidden)
		return
	}

	// Extract user ID from URL path (/api/admin/users/123/delete)
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 5 {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}
	userID, err := strconv.Atoi(parts[4])
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Prevent admin from deleting themselves
	if userID == user.ID {
		http.Error(w, "Cannot delete own account", http.StatusBadRequest)
		return
	}

	err = h.db.AdminDeleteUser(userID)
	if err == sql.ErrNoRows {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to delete user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}