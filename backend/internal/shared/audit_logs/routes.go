package auditlogs

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB) AuditLogService {
	repo := NewAuditLogRepository(db)
	service := NewAuditLogService(db, repo)
	handler := NewHandler(service)

	group := r.Group("/api/v1/audit-logs")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_audit_log", handler.GetByID)
	}

	return service
}
