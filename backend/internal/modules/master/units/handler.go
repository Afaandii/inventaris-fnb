package units

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service ServiceUnit
}

func NewHandlerUnit(service ServiceUnit) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	unt, err := h.service.GetAll()
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieved data unit!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received data unit successfully!", unt)
}

func (h *Handler) GetById(ctx *gin.Context) {
	id_unit, err := strconv.Atoi(ctx.Param("id_unit"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id unit!", err.Error())
		return
	}

	unt, err := h.service.GetById(uint(id_unit))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieved data unit by id!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received data unit by id successfully!", unt)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req struct {
		UnitName  string `json:"unit_name" validate:"required,min=3,max=150"`
		Type      string `json:"type" validate:"required,min=3,max=180"`
		ShortName string `json:"short_name" validate:"required,min=1,max=80"`
		IsActive  bool   `json:"is_active" validate:"required,boolean"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validator fail!", errMap)
		return
	}

	unt, err := h.service.Create(req.UnitName, req.Type, req.ShortName, req.IsActive)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed create data unit!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created data unit successfully!", unt)
}

func (h *Handler) Update(ctx *gin.Context) {
	id_unit, err := strconv.Atoi(ctx.Param("id_unit"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id unit!", err.Error())
		return
	}

	var req struct {
		UnitName  string `json:"unit_name" validate:"required,min=3,max=150"`
		Type      string `json:"type" validate:"required,min=3,max=180"`
		ShortName string `json:"short_name" validate:"required,min=1,max=80"`
		IsActive  bool   `json:"is_active" validate:"required,boolean"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validator fail!", errMap)
		return
	}

	unt, err := h.service.Update(uint(id_unit), req.UnitName, req.Type, req.ShortName, req.IsActive)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed update data unit!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated data unit successfully!", unt)
}

func (h *Handler) Delete(ctx *gin.Context) {
	id_unit, err := strconv.Atoi(ctx.Param("id_unit"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id unit!", err.Error())
		return
	}

	err = h.service.Delete(uint(id_unit))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed deteled data unit!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Deleted data unit successfully!", nil)
}
