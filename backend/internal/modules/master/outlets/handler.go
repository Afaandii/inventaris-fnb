package outlets

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"log"
	"net/http"
	"strconv"
	"time"

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
		OutletName   string `json:"outlet_name" validate:"required,min=3,max=255"`
		Address      string `json:"address" validate:"required,min=3,max=150"`
		City         string `json:"city" validate:"required,min=3,max=150"`
		OpeningHours string `json:"opening_hours" validate:"required,datetime=15:04"`
		ClosingHours string `json:"closing_hours" validate:"required,datetime=15:04"`
		PhoneNumber  string `json:"phone_number" validate:"required,min=3,max=20,numeric"`
		StatusOutlet string `json:"status_outlet" validate:"required,min=3,max=150,oneof=active inactive renovation closed"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validation fail!", errMap)
		return
	}

	openTimeParse, err := time.Parse("15:04", req.OpeningHours)
	if err != nil {
		log.Print("Failed to parse opening time!", err)
	}

	closedTimeParse, err := time.Parse("15:04", req.OpeningHours)
	if err != nil {
		log.Print("Failed to parse closed time!", err)
	}

	openTime := datatypes.NewTime(openTimeParse.Hour(), openTimeParse.Minute(), 0, 0)
	closedTime := datatypes.NewTime(closedTimeParse.Hour(), closedTimeParse.Minute(), 0, 0)

	out, err := h.service.Create(req.OutletName, req.Address, req.City, openTime, closedTime, req.PhoneNumber, req.StatusOutlet)
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
		OutletName   string `json:"outlet_name" validate:"required,min=3,max=125"`
		Address      string `json:"address" validate:"required,min=3,max=150"`
		City         string `json:"city" validate:"required,min=3,max=150"`
		OpeningHours string `json:"opening_hours" validate:"required,min=3,max=255,datetime=15:04"`
		ClosingHours string `json:"closing_hours" validate:"required,min=3,max=255,datetime=15:04"`
		PhoneNumber  string `json:"phone_number" validate:"required,min=3,max=20,numeric"`
		StatusOutlet string `json:"status_outlet" validate:"required,min=3,max=150,oneof=active inactive renovation closed"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validation fail!", errMap)
		return
	}

	openTimeParse, err := time.Parse("15:04", req.OpeningHours)
	if err != nil {
		log.Print("Failed to parse opening time!", err)
	}

	closedTimeParse, err := time.Parse("15:04", req.ClosingHours)
	if err != nil {
		log.Print("Failed to parse closed time!", err)
	}

	openTime := datatypes.NewTime(openTimeParse.Hour(), openTimeParse.Minute(), 0, 0)
	closedTime := datatypes.NewTime(closedTimeParse.Hour(), closedTimeParse.Minute(), 0, 0)
	out, err := h.service.Update(uint(id_outlet), req.OutletName, req.Address, req.City, openTime, closedTime, req.PhoneNumber, req.StatusOutlet)
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
