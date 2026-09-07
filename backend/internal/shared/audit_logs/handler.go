package auditlogs

import (
	"backend/internal/shared/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service AuditLogService
}

func NewHandler(service AuditLogService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	userIDStr := ctx.DefaultQuery("user_id", "0")
	module := ctx.DefaultQuery("module", "")
	action := ctx.DefaultQuery("action", "")
	entityType := ctx.DefaultQuery("entity_type", "")
	startDate := ctx.DefaultQuery("start_date", "")
	endDate := ctx.DefaultQuery("end_date", "")

	userID, _ := strconv.Atoi(userIDStr)

	data, err := h.service.GetAll(uint(userID), module, action, entityType, startDate, endDate)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve audit logs!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received audit logs list successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_audit_log")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_audit_log parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve audit log details by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Audit log not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received audit log details by ID successfully!", data)
}

// ExtractAuditInfo Helper function to extract IP, User-Agent, and Request-ID from Gin Context
func ExtractAuditInfo(ctx *gin.Context) (ip string, userAgent string, requestID string) {
	ip = ctx.ClientIP()
	userAgent = ctx.GetHeader("User-Agent")
	requestID = ctx.GetHeader("X-Request-ID")
	return
}
