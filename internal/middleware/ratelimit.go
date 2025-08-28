package middleware

import (
	"net/http"
	"sync"
	"time"
)

type RateLimiter struct {
	visitors map[string]*Visitor
	mu       sync.RWMutex
	rate     int
	burst    int
	cleanup  time.Duration
}

type Visitor struct {
	limiter  *TokenBucket
	lastSeen time.Time
}

type TokenBucket struct {
	tokens   int
	capacity int
	rate     int
	last     time.Time
	mu       sync.Mutex
}

func NewRateLimiter(rate, burst int, cleanup time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*Visitor),
		rate:     rate,
		burst:    burst,
		cleanup:  cleanup,
	}

	// Cleanup old visitors periodically
	go rl.cleanupVisitors()

	return rl
}

func (rl *RateLimiter) GetVisitor(ip string) *TokenBucket {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	v, exists := rl.visitors[ip]
	if !exists {
		v = &Visitor{
			limiter: &TokenBucket{
				tokens:   rl.burst,
				capacity: rl.burst,
				rate:     rl.rate,
				last:     time.Now(),
			},
			lastSeen: time.Now(),
		}
		rl.visitors[ip] = v
	}

	v.lastSeen = time.Now()
	return v.limiter
}

func (tb *TokenBucket) Allow() bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(tb.last).Seconds()
	tb.last = now

	// Add tokens based on elapsed time
	tb.tokens += int(elapsed * float64(tb.rate))
	if tb.tokens > tb.capacity {
		tb.tokens = tb.capacity
	}

	if tb.tokens > 0 {
		tb.tokens--
		return true
	}

	return false
}

func (rl *RateLimiter) cleanupVisitors() {
	for {
		time.Sleep(rl.cleanup)
		rl.mu.Lock()
		for ip, v := range rl.visitors {
			if time.Since(v.lastSeen) > rl.cleanup {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get client IP
		ip := r.Header.Get("X-Forwarded-For")
		if ip == "" {
			ip = r.Header.Get("X-Real-IP")
		}
		if ip == "" {
			ip = r.RemoteAddr
		}

		// Get limiter for this IP
		limiter := rl.GetVisitor(ip)
		
		if !limiter.Allow() {
			http.Error(w, "Rate limit exceeded. Please try again later.", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Predefined rate limiters for different endpoints
var (
	// General API rate limiter: 100 requests per minute
	GeneralRateLimiter = NewRateLimiter(100, 10, 10*time.Minute)
	
	// Auth endpoints rate limiter: 5 attempts per minute (stricter)
	AuthRateLimiter = NewRateLimiter(5, 5, 15*time.Minute)
	
	// Metadata endpoints rate limiter: 30 requests per minute
	MetadataRateLimiter = NewRateLimiter(30, 5, 5*time.Minute)
)

func GeneralRateLimit(next http.Handler) http.Handler {
	return GeneralRateLimiter.Middleware(next)
}

func AuthRateLimit(next http.Handler) http.Handler {
	return AuthRateLimiter.Middleware(next)
}

func MetadataRateLimit(next http.Handler) http.Handler {
	return MetadataRateLimiter.Middleware(next)
}