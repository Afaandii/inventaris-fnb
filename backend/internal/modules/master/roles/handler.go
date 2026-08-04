package roles

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service ServiceRole
}

func NewHandlerRole(service ServiceRole) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	roles, err := h.service.GetAll()
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieved data roles", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received data roles successfully!", roles)
}

func (h *Handler) GetById(ctx *gin.Context) {
	id_role, err := strconv.Atoi(ctx.Param("id_role"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id role!", nil)
		return
	}

	roles, err := h.service.GetById(uint(id_role))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieved data role", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received data role by id successfully!", roles)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req struct {
		RoleName    string `json:"role_name" validate:"required,min=3,max=200"`
		DisplayName string `json:"display_name" validate:"required,min=3,max=200"`
		Description string `json:"description" validate:"min:3,max=500"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validation fail!", errMap)
		return
	}

	roles, err := h.service.Create(req.RoleName, req.DisplayName, req.Description)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to create role", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Role created successfully!", roles)
}

func (h *Handler) Update(ctx *gin.Context) {
	id_role, err := strconv.Atoi(ctx.Param("id_role"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id role!", nil)
		return
	}

	var req struct {
		RoleName    string `json:"role_name" validate:"required,min=3,max=200"`
		DisplayName string `json:"display_name" validate:"required,min=3,max=200"`
		Description string `json:"description" validate:"min:3,max=500"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validation fail!", errMap)
		return
	}

	roles, err := h.service.Update(uint(id_role), req.RoleName, req.DisplayName, req.Description)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to update role", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Role updated successfully!", roles)
}

func (h *Handler) Delete(ctx *gin.Context) {
	id_role, err := strconv.Atoi(ctx.Param("id_role"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id role!", nil)
		return
	}

	err = h.service.Delete(uint(id_role))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to delete role", err.Error())
		return
	}
	response.Success(ctx, http.StatusOK, "Role deleted successfully!", nil)
}
