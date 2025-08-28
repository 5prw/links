package models

type Link struct {
	ID          int     `json:"id"`
	UserID      int     `json:"userId"`
	URL         string  `json:"url"`
	Description *string `json:"description"`
	Tags        *string `json:"tags"`
	Category    *string `json:"category"`
	CreatedAt   string  `json:"created_at"`
	IsPrivate   bool    `json:"is_private"`
	IsFavorite  bool    `json:"is_favorite"`
	AccessCount int     `json:"access_count"`
	IsLocked    bool    `json:"is_locked"` // Admin can lock link privacy
	Username    string  `json:"username,omitempty"`
}