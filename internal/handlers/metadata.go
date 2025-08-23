package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"golang.org/x/net/html"
)

type MetadataHandler struct{}

type URLMetadata struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Tags        []string `json:"tags"`
	Domain      string   `json:"domain"`
}

func NewMetadataHandler() *MetadataHandler {
	return &MetadataHandler{}
}

func (h *MetadataHandler) ExtractMetadata(w http.ResponseWriter, r *http.Request) {
	targetURL := r.URL.Query().Get("url")
	if targetURL == "" {
		http.Error(w, "URL parameter is required", http.StatusBadRequest)
		return
	}

	// Validate URL
	parsedURL, err := url.Parse(targetURL)
	if err != nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}

	metadata := h.fetchURLMetadata(targetURL)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metadata)
}

func (h *MetadataHandler) fetchURLMetadata(targetURL string) URLMetadata {
	parsedURL, _ := url.Parse(targetURL)
	domain := parsedURL.Hostname()

	metadata := URLMetadata{
		Domain: domain,
		Tags:   []string{},
	}

	// Create HTTP client with timeout and security settings
	client := &http.Client{
		Timeout: 10 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			// Limit redirects to prevent abuse
			if len(via) >= 5 {
				return fmt.Errorf("too many redirects")
			}
			return nil
		},
	}

	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		return metadata
	}

	// Set user agent
	req.Header.Set("User-Agent", "Links-App/1.0 (+https://github.com/yourapp)")
	req.Header.Set("Accept", "text/html,application/xhtml+xml")

	resp, err := client.Do(req)
	if err != nil {
		return metadata
	}
	defer resp.Body.Close()

	// Check content type
	contentType := resp.Header.Get("Content-Type")
	if !strings.Contains(strings.ToLower(contentType), "text/html") {
		return metadata
	}

	// Limit response size to prevent abuse
	limitedBody := io.LimitReader(resp.Body, 1024*1024) // 1MB limit

	// Parse HTML
	doc, err := html.Parse(limitedBody)
	if err != nil {
		return metadata
	}

	metadata.Title = h.extractTitle(doc)
	metadata.Description = h.extractDescription(doc)
	metadata.Tags = h.inferTags(metadata.Title, metadata.Description, domain)

	return metadata
}

func (h *MetadataHandler) extractTitle(n *html.Node) string {
	if n.Type == html.ElementNode && n.Data == "title" {
		if n.FirstChild != nil && n.FirstChild.Type == html.TextNode {
			return strings.TrimSpace(n.FirstChild.Data)
		}
	}

	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if title := h.extractTitle(c); title != "" {
			return title
		}
	}

	return ""
}

func (h *MetadataHandler) extractDescription(n *html.Node) string {
	if n.Type == html.ElementNode && n.Data == "meta" {
		var name, content string
		for _, attr := range n.Attr {
			switch attr.Key {
			case "name", "property":
				name = strings.ToLower(attr.Val)
			case "content":
				content = attr.Val
			}
		}
		
		if (name == "description" || name == "og:description" || name == "twitter:description") && content != "" {
			return strings.TrimSpace(content)
		}
	}

	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if desc := h.extractDescription(c); desc != "" {
			return desc
		}
	}

	return ""
}

func (h *MetadataHandler) inferTags(title, description, domain string) []string {
	tags := make(map[string]bool)
	text := strings.ToLower(title + " " + description)

	// Domain-based tags
	domainTags := map[string]string{
		"github.com":     "github",
		"stackoverflow.com": "stackoverflow",
		"youtube.com":    "youtube",
		"medium.com":     "blog",
		"dev.to":         "blog",
		"twitter.com":    "social",
		"linkedin.com":   "linkedin",
		"reddit.com":     "reddit",
		"wikipedia.org":  "wikipedia",
		"docs.google.com": "docs",
		"google.com":     "google",
	}

	for d, tag := range domainTags {
		if strings.Contains(domain, d) {
			tags[tag] = true
		}
	}

	// Technology tags
	techKeywords := map[string][]string{
		"javascript": {"javascript", "js", "node", "npm", "webpack", "react", "vue", "angular"},
		"python":     {"python", "django", "flask", "pandas", "numpy"},
		"go":         {"golang", "go", "gin", "gorilla"},
		"java":       {"java", "spring", "maven", "gradle"},
		"docker":     {"docker", "container", "kubernetes", "k8s"},
		"ai":         {"ai", "machine learning", "ml", "neural", "tensorflow", "pytorch"},
		"database":   {"database", "sql", "mysql", "postgres", "mongodb", "redis"},
		"api":        {"api", "rest", "graphql", "endpoint"},
		"tutorial":   {"tutorial", "guide", "how to", "learn"},
		"blog":       {"blog", "article", "post"},
		"news":       {"news", "update", "announcement"},
		"tool":       {"tool", "utility", "software", "app"},
	}

	for tag, keywords := range techKeywords {
		for _, keyword := range keywords {
			if strings.Contains(text, keyword) {
				tags[tag] = true
				break
			}
		}
	}

	// Convert map to slice
	result := make([]string, 0, len(tags))
	for tag := range tags {
		result = append(result, tag)
	}

	// Limit to 5 tags
	if len(result) > 5 {
		result = result[:5]
	}

	return result
}

// Clean and validate extracted text
func cleanText(text string) string {
	// Remove excessive whitespace
	re := regexp.MustCompile(`\s+`)
	text = re.ReplaceAllString(strings.TrimSpace(text), " ")
	
	// Limit length
	if len(text) > 200 {
		text = text[:200] + "..."
	}
	
	return text
}