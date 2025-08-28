package middleware

import (
	"html"
	"net/url"
	"regexp"
	"strings"
)

// SanitizeInput provides input sanitization utilities
type SanitizeInput struct{}

// SanitizeURL validates and sanitizes URLs
func (s *SanitizeInput) SanitizeURL(input string) (string, error) {
	if input == "" {
		return "", nil
	}

	// Trim whitespace
	input = strings.TrimSpace(input)

	// Add protocol if missing
	if !strings.HasPrefix(input, "http://") && !strings.HasPrefix(input, "https://") {
		input = "https://" + input
	}

	// Parse and validate URL
	parsedURL, err := url.Parse(input)
	if err != nil {
		return "", err
	}

	// Only allow http and https schemes
	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		return "", err
	}

	// Block private/local addresses
	hostname := strings.ToLower(parsedURL.Hostname())
	
	// Block localhost
	if hostname == "localhost" || hostname == "127.0.0.1" || hostname == "::1" {
		return "", err
	}

	// Block private IP ranges
	privatePatterns := []string{
		"192.168.", "10.", "172.16.", "172.17.", "172.18.", "172.19.", "172.20.",
		"172.21.", "172.22.", "172.23.", "172.24.", "172.25.", "172.26.", "172.27.",
		"172.28.", "172.29.", "172.30.", "172.31.", "169.254.", "0.0.0.0",
	}

	for _, pattern := range privatePatterns {
		if strings.HasPrefix(hostname, pattern) {
			return "", err
		}
	}

	return parsedURL.String(), nil
}

// SanitizeText sanitizes text input to prevent XSS
func (s *SanitizeInput) SanitizeText(input string) string {
	if input == "" {
		return ""
	}

	// HTML escape
	input = html.EscapeString(input)
	
	// Trim and normalize whitespace
	input = strings.TrimSpace(input)
	re := regexp.MustCompile(`\s+`)
	input = re.ReplaceAllString(input, " ")

	// Limit length
	if len(input) > 1000 {
		input = input[:1000]
	}

	return input
}

// SanitizeTags sanitizes and validates tags input
func (s *SanitizeInput) SanitizeTags(input string) string {
	if input == "" {
		return ""
	}

	// Split, sanitize each tag, and rejoin
	tags := strings.Split(input, ",")
	var sanitizedTags []string

	for _, tag := range tags {
		tag = strings.TrimSpace(tag)
		if tag == "" {
			continue
		}

		// Remove special characters except hyphens and underscores
		re := regexp.MustCompile(`[^a-zA-Z0-9\-_\s]`)
		tag = re.ReplaceAllString(tag, "")
		
		// Normalize spaces to hyphens
		tag = strings.ReplaceAll(tag, " ", "-")
		tag = strings.ToLower(tag)

		// Limit tag length
		if len(tag) > 30 {
			tag = tag[:30]
		}

		if tag != "" && len(sanitizedTags) < 10 {
			sanitizedTags = append(sanitizedTags, tag)
		}
	}

	return strings.Join(sanitizedTags, ",")
}

// SanitizeCategory sanitizes category input
func (s *SanitizeInput) SanitizeCategory(input string) string {
	if input == "" {
		return ""
	}

	input = strings.TrimSpace(input)
	input = html.EscapeString(input)

	// Allow only alphanumeric, spaces, hyphens, and underscores
	re := regexp.MustCompile(`[^a-zA-Z0-9\-_\s]`)
	input = re.ReplaceAllString(input, "")

	// Normalize spaces
	re = regexp.MustCompile(`\s+`)
	input = re.ReplaceAllString(input, " ")

	// Limit length
	if len(input) > 50 {
		input = input[:50]
	}

	return input
}

// Global sanitizer instance
var Sanitizer = &SanitizeInput{}