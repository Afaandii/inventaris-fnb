package auth_test

import (
	"backend/internal/shared/middleware"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Helper untuk membuat token JWT valid untuk keperluan unit test
func generateTestJWT(userID uint, expiry time.Duration, secret []byte) string {
	claims := middleware.JWTClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "inventaris-fnb",
			Subject:   fmt.Sprintf("%d", userID),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiry)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, _ := token.SignedString(secret)
	return tokenStr
}

func TestAuthMiddleware_ValidCookie(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	targetUserID := uint(77)
	validToken := generateTestJWT(targetUserID, 1*time.Hour, middleware.GetJWTSecret())

	var capturedUserID uint
	r.GET("/protected", middleware.AuthMiddleware(), func(c *gin.Context) {
		val, _ := c.Get("user_id")
		capturedUserID = val.(uint)
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	// Pasang token di HttpOnly Cookie
	req.AddCookie(&http.Cookie{
		Name:  "access_token",
		Value: validToken,
	})

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 dengan cookie valid, didapat %d", w.Code)
	}
	if capturedUserID != targetUserID {
		t.Errorf("Ekspektasi user_id di context bernilai %d, tapi didapat %d", targetUserID, capturedUserID)
	}
}

func TestAuthMiddleware_ValidBearerHeader(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	targetUserID := uint(88)
	validToken := generateTestJWT(targetUserID, 1*time.Hour, middleware.GetJWTSecret())

	var capturedUserID uint
	r.GET("/protected", middleware.AuthMiddleware(), func(c *gin.Context) {
		val, _ := c.Get("user_id")
		capturedUserID = val.(uint)
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	// Pasang token di Header Authorization Bearer
	req.Header.Set("Authorization", "Bearer "+validToken)

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 dengan Bearer token valid, didapat %d", w.Code)
	}
	if capturedUserID != targetUserID {
		t.Errorf("Ekspektasi user_id di context bernilai %d, tapi didapat %d", targetUserID, capturedUserID)
	}
}

func TestAuthMiddleware_NoToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	r.GET("/protected", middleware.AuthMiddleware(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("Ekspektasi HTTP 401 saat tidak ada token, didapat %d", w.Code)
	}
}

func TestAuthMiddleware_ExpiredToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	// Buat token yang kedaluwarsa 1 jam yang lalu
	expiredToken := generateTestJWT(99, -1*time.Hour, middleware.GetJWTSecret())

	r.GET("/protected", middleware.AuthMiddleware(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+expiredToken)

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("Ekspektasi HTTP 401 untuk token kedaluwarsa, didapat %d", w.Code)
	}
}

func TestAuthMiddleware_WrongSecretToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	// Buat token dengan signature secret yang salah
	fakeSecret := []byte("secret_key_palsu_yang_berbeda")
	tamperedToken := generateTestJWT(99, 1*time.Hour, fakeSecret)

	r.GET("/protected", middleware.AuthMiddleware(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+tamperedToken)

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("Ekspektasi HTTP 401 untuk signature token tidak valid, didapat %d", w.Code)
	}
}

func TestLoginRateLimiter_Threshold(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	// Pasang LoginRateLimiter (default 10 requests / menit)
	r.POST("/login", middleware.LoginRateLimiter(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "allowed"})
	})

	targetIP := "203.0.113.195"

	// 10 request pertama harus diizinkan (200 OK)
	for i := 1; i <= 10; i++ {
		req, _ := http.NewRequest(http.MethodPost, "/login", nil)
		req.RemoteAddr = targetIP + ":1234"
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("Request ke-%d harusnya diizinkan (200), didapat status %d", i, w.Code)
		}
	}

	// Request ke-11 dari IP yang sama harus diblokir (429 Too Many Requests)
	reqBlocked, _ := http.NewRequest(http.MethodPost, "/login", nil)
	reqBlocked.RemoteAddr = targetIP + ":1234"
	wBlocked := httptest.NewRecorder()
	r.ServeHTTP(wBlocked, reqBlocked)

	if wBlocked.Code != http.StatusTooManyRequests {
		t.Fatalf("Request ke-11 dari IP yang sama harusnya diblokir (429), didapat %d", wBlocked.Code)
	}

	// Request dari IP berbeda harus tetap diizinkan
	otherIP := "203.0.113.200"
	reqOther, _ := http.NewRequest(http.MethodPost, "/login", nil)
	reqOther.RemoteAddr = otherIP + ":1234"
	wOther := httptest.NewRecorder()
	r.ServeHTTP(wOther, reqOther)

	if wOther.Code != http.StatusOK {
		t.Fatalf("Request dari IP berbeda harusnya tetap diizinkan (200), didapat %d", wOther.Code)
	}
}
