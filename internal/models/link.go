package models

type Link struct {
	ID          int     `json:"id"`
	UserID      int     `json:"userId"`
	URL         string  `json:"url"`
	Description *string `json:"description"`
	Tags        *string `json:"tags"`
	CreatedAt   string  `json:"createdAt"`
}