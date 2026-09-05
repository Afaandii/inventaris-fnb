package reservation

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service ReservationService
}

func NewHandler(service ReservationService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	outletIDStr := ctx.DefaultQuery("outlet_id", "0")
	tableIDStr := ctx.DefaultQuery("table_id", "0")
	status := ctx.DefaultQuery("status", "")
	dateStr := ctx.DefaultQuery("date", "")

	outletID, err := strconv.Atoi(outletIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid outlet_id parameter", err.Error())
		return
	}

	tableID, err := strconv.Atoi(tableIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid table_id parameter", err.Error())
		return
	}

	data, err := h.service.GetAll(uint(outletID), uint(tableID), status, dateStr)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve reservations list!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received reservations list successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_reservation")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_reservation parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve reservation details by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Reservation not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received reservation details by ID successfully!", data)
}

func (h *Handler) GetAvailableTables(ctx *gin.Context) {
	outletIDStr := ctx.DefaultQuery("outlet_id", "0")
	dateStr := ctx.DefaultQuery("date", "")
	timeStr := ctx.DefaultQuery("time", "")
	guestStr := ctx.DefaultQuery("guest", "0")

	outletID, err := strconv.Atoi(outletIDStr)
	if err != nil || outletID <= 0 {
		response.Error(ctx, http.StatusBadRequest, "Invalid or missing outlet_id parameter", nil)
		return
	}

	guestCount, _ := strconv.Atoi(guestStr)

	data, err := h.service.GetAvailableTables(uint(outletID), dateStr, timeStr, guestCount)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to check available dining tables!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received available dining tables successfully!", data)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req CreateReservationInput

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validator Fail!", errMap)
		return
	}

	data, err := h.service.Create(req)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to create reservation!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created reservation successfully!", data)
}

func (h *Handler) Update(ctx *gin.Context) {
	idStr := ctx.Param("id_reservation")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_reservation parameter", err.Error())
		return
	}

	var req UpdateReservationInput

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validator Fail!", errMap)
		return
	}

	data, err := h.service.Update(uint(id), req)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to update reservation!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated reservation successfully!", data)
}

func (h *Handler) UpdateStatus(ctx *gin.Context) {
	idStr := ctx.Param("id_reservation")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_reservation parameter", err.Error())
		return
	}

	var req struct {
		Status string `json:"status" validate:"required,oneof=pending confirmed seated completed cancelled no_show"`
		UserID uint   `json:"user_id" validate:"required,number,min=1"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validator Fail!", errMap)
		return
	}

	data, err := h.service.UpdateStatus(uint(id), req.Status, req.UserID)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to update reservation status!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated reservation status successfully!", data)
}
