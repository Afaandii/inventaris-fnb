package auth

import (
	auditlogs "backend/internal/shared/audit_logs"
	"backend/internal/shared/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB, auditService auditlogs.AuditLogService) {
	repo := NewAuthRepository(db)
	service := NewAuthService(repo, auditService)
	handler := NewAuthHandler(service)

	authGroup := r.Group("/api/v1/auth")
	{
		authGroup.POST("/login", middleware.LoginRateLimiter(), handler.Login)
		authGroup.POST("/logout", handler.Logout)
		authGroup.GET("/me", middleware.AuthMiddleware(), handler.Me)
	}
}
