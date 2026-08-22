package stokopnames

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service StokOpnameService
}

func NewHandler(service StokOpnameService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	warehouseIDStr := ctx.DefaultQuery("warehouse_id", "0")
	status := ctx.DefaultQuery("status", "")

	warehouseID, err := strconv.Atoi(warehouseIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid warehouse_id parameter", err.Error())
		return
	}

	data, err := h.service.GetAll(uint(warehouseID), status)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve stock opnames list!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received stock opnames successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_stok_opname")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_stok_opname parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve stock opname details by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Stock opname not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received stock opname details by ID successfully!", data)
}

func (h *Handler) GetStockSummary(ctx *gin.Context) {
	warehouseIDStr := ctx.DefaultQuery("warehouse_id", "0")
	warehouseID, err := strconv.Atoi(warehouseIDStr)
	if err != nil || warehouseID <= 0 {
		response.Error(ctx, http.StatusBadRequest, "Invalid or missing warehouse_id parameter", nil)
		return
	}

	data, err := h.service.GetStockSummary(uint(warehouseID))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve warehouse stock summary!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received warehouse stock summary successfully!", data)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req CreateOpnameInput

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
		response.Error(ctx, http.StatusInternalServerError, "Failed to create stock opname draft!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created stock opname draft successfully!", data)
}

func (h *Handler) UpdateStatus(ctx *gin.Context) {
	idStr := ctx.Param("id_stok_opname")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_stok_opname parameter", err.Error())
		return
	}

	var req struct {
		Status string `json:"status" validate:"required,oneof=approved completed"`
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
		response.Error(ctx, http.StatusInternalServerError, "Failed to update stock opname status!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated stock opname status successfully!", data)
}
