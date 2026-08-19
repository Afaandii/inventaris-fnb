package stoktransfers

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service StokTransferService
}

func NewHandler(service StokTransferService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	fromStr := ctx.DefaultQuery("warehouse_from", "0")
	toStr := ctx.DefaultQuery("warehouse_to", "0")
	status := ctx.DefaultQuery("status", "")

	from, err := strconv.Atoi(fromStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid warehouse_from parameter", err.Error())
		return
	}

	to, err := strconv.Atoi(toStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid warehouse_to parameter", err.Error())
		return
	}

	data, err := h.service.GetAll(uint(from), uint(to), status)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve stock transfers list!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received stock transfers successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_stok_transfer")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_stok_transfer parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve stock transfer details by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Stock transfer not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received stock transfer details by ID successfully!", data)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req CreateTransferInput

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
		response.Error(ctx, http.StatusInternalServerError, "Failed to create stock transfer!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created stock transfer draft successfully!", data)
}

func (h *Handler) UpdateStatus(ctx *gin.Context) {
	idStr := ctx.Param("id_stok_transfer")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_stok_transfer parameter", err.Error())
		return
	}

	var req struct {
		Status string `json:"status" validate:"required,oneof=approved completed cancelled"`
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
		response.Error(ctx, http.StatusInternalServerError, "Failed to update stock transfer status!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated stock transfer status successfully!", data)
}
