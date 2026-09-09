package middleware

import (
	"backend/internal/shared/response"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type clientRecord struct {
	attempts    int
	lastAttempt time.Time
}

type RateLimiter struct {
	mu          sync.Mutex
	records     map[string]*clientRecord
	maxAttempts int
	window      time.Duration
}

func NewRateLimiter(maxAttempts int, window time.Duration) *RateLimiter {
	limiter := &RateLimiter{
		records:     make(map[string]*clientRecord),
		maxAttempts: maxAttempts,
		window:      window,
	}

	// Periodic cleanup of stale records
	go func() {
		for {
			time.Sleep(window)
			limiter.mu.Lock()
			now := time.Now()
			for ip, rec := range limiter.records {
				if now.Sub(rec.lastAttempt) > limiter.window {
					delete(limiter.records, ip)
				}
			}
			limiter.mu.Unlock()
		}
	}()

	return limiter
}

var defaultLoginLimiter = NewRateLimiter(10, 1*time.Minute)

// LoginRateLimiter limits login attempts per client IP
func LoginRateLimiter() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		defaultLoginLimiter.mu.Lock()
		rec, exists := defaultLoginLimiter.records[ip]
		now := time.Now()

		if !exists || now.Sub(rec.lastAttempt) > defaultLoginLimiter.window {
			defaultLoginLimiter.records[ip] = &clientRecord{
				attempts:    1,
				lastAttempt: now,
			}
			defaultLoginLimiter.mu.Unlock()
			c.Next()
			return
		}

		if rec.attempts >= defaultLoginLimiter.maxAttempts {
			defaultLoginLimiter.mu.Unlock()
			response.Error(c, http.StatusTooManyRequests, "Terlalu banyak percobaan login. Silakan tunggu beberapa saat.", nil)
			c.Abort()
			return
		}

		rec.attempts++
		rec.lastAttempt = now
		defaultLoginLimiter.mu.Unlock()

		c.Next()
	}
}
