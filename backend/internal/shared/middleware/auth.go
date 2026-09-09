package middleware

import (
	"backend/internal/shared/response"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	UserID uint `json:"sub"`
	jwt.RegisteredClaims
}

func GetJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "default_jwt_secret_key_change_in_production"
	}
	return []byte(secret)
}

// AuthMiddleware validates JWT token from HttpOnly cookie or Authorization header.
// NOTE: Strictly authentication only (identifies the user and validates session).
// Does NOT perform authorization or RBAC checks.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenString string

		// 1. Prioritaskan HttpOnly Cookie "access_token"
		cookieToken, err := c.Cookie("access_token")
		if err == nil && cookieToken != "" {
			tokenString = cookieToken
		} else {
			// 2. Fallback ke Header Authorization: Bearer <token>
			authHeader := c.GetHeader("Authorization")
			if authHeader != "" {
				parts := strings.Split(authHeader, " ")
				if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
					tokenString = parts[1]
				}
			}
		}

		if tokenString == "" {
			response.Error(c, http.StatusUnauthorized, "Autentikasi diperlukan. Sesi atau token tidak ditemukan.", nil)
			c.Abort()
			return
		}

		claims := &JWTClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return GetJWTSecret(), nil
		})

		if err != nil || !token.Valid {
			response.Error(c, http.StatusUnauthorized, "Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.", nil)
			c.Abort()
			return
		}

		if claims.UserID == 0 {
			response.Error(c, http.StatusUnauthorized, "Klaim token tidak valid.", nil)
			c.Abort()
			return
		}

		// Set user_id in context for subsequent handlers
		c.Set("user_id", claims.UserID)
		c.Next()
	}
}
