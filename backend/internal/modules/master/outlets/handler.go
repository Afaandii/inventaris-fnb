package outlets

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
)

type Handler struct {
	service OutletService
}

func NewHandlerOutlet(service OutletService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	out, err := h.service.GetAll()
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieved data outlet", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received data outlet successfully!", out)
}

func (h *Handler) GetById(ctx *gin.Context) {
	id_outlet, err := strconv.Atoi(ctx.Param("id_outlet"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id outlet!", nil)
		return
	}

	out, err := h.service.GetById(uint(id_outlet))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to received data outlet by id!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received data outlet by id successfully!", out)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req struct {
		OutletCode   string         `json:"outlet_code" validate:"required,min=3,max=255"`
		OutletName   string         `json:"outlet_name" validate:"required,min=3,max=125"`
		Address      string         `json:"address" validate:"required,min=3,max=150"`
		City         string         `json:"city" validate:"required,min=3,max=150"`
		OpeningHours datatypes.Time `json:"opening_hours" validate:"required,min=3,max=255,time"`
		ClosingHours datatypes.Time `json:"closing_hours" validate:"required,min=3,max=255,time"`
		PhoneNumber  string         `json:"phone_number" validate:"required,min=3,max=20,numeric"`
		StatusOutlet string         `json:"status_outlet" validate:"required,min=3,max=150,oneof=open closed repaired"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validation fail!", errMap)
		return
	}

	out, err := h.service.Create(req.OutletCode, req.OutletName, req.Address, req.City, req.OpeningHours, req.ClosingHours, req.PhoneNumber, req.StatusOutlet)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to create data outlet!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Oulet created successfully!", out)
}

func (h *Handler) Update(ctx *gin.Context) {
	id_outlet, err := strconv.Atoi(ctx.Param("id_outlet"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id outlet!", err.Error())
		return
	}

	var req struct {
		OutletCode   string         `json:"outlet_code" validate:"required,min=3,max=255"`
		OutletName   string         `json:"outlet_name" validate:"required,min=3,max=125"`
		Address      string         `json:"address" validate:"required,min=3,max=150"`
		City         string         `json:"city" validate:"required,min=3,max=150"`
		OpeningHours datatypes.Time `json:"opening_hours" validate:"required,min=3,max=255,time"`
		ClosingHours datatypes.Time `json:"closing_hours" validate:"required,min=3,max=255,time"`
		PhoneNumber  string         `json:"phone_number" validate:"required,min=3,max=20,numeric"`
		StatusOutlet string         `json:"status_outlet" validate:"required,min=3,max=150,oneof=open closed repaired"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validation fail!", errMap)
		return
	}

	out, err := h.service.Update(uint(id_outlet), req.OutletCode, req.OutletName, req.Address, req.City, req.OpeningHours, req.ClosingHours, req.PhoneNumber, req.StatusOutlet)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to updated data outlet!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated data outlet successfully!", out)
}

func (h *Handler) Delete(ctx *gin.Context) {
	id_outlet, err := strconv.Atoi(ctx.Param("id_outlet"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id outlet!", err.Error())
		return
	}

	if err := h.service.Delete(uint(id_outlet)); err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to delete data outlet!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Deleted data outlet successfully!", nil)
}
