package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"links/internal/models"
)

type LinksHandler struct {
	db LinksDBInterface
}

type LinksDBInterface interface {
	CreateLink(userID int, url string, description, tags *string, createdAt string) (int64, error)
	GetLinksByUserID(userID int) ([]models.Link, error)
	DeleteLink(linkID, userID int) error
}

func NewLinksHandler(db LinksDBInterface) *LinksHandler {
	return &LinksHandler{db: db}
}

func (h *LinksHandler) CreateLink(w http.ResponseWriter, r *http.Request) {
	var link models.Link

	err := json.NewDecoder(r.Body).Decode(&link)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userID, _ := strconv.Atoi(r.Header.Get("X-User-ID"))
	link.UserID = userID
	link.CreatedAt = time.Now().Format("2006-01-02 15:04:05")

	id, err := h.db.CreateLink(link.UserID, link.URL, link.Description, link.Tags, link.CreatedAt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	link.ID = int(id)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(link)
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