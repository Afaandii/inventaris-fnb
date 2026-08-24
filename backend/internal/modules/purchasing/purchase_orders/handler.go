package purchaseorders

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service PurchaseOrderService
}

func NewHandler(service PurchaseOrderService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	supplierIDStr := ctx.DefaultQuery("supplier_id", "0")
	warehouseIDStr := ctx.DefaultQuery("warehouse_id", "0")
	status := ctx.DefaultQuery("status", "")

	supplierID, err := strconv.Atoi(supplierIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid supplier_id parameter", err.Error())
		return
	}

	warehouseID, err := strconv.Atoi(warehouseIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid warehouse_id parameter", err.Error())
		return
	}

	data, err := h.service.GetAll(uint(supplierID), uint(warehouseID), status)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve purchase orders list!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received purchase orders successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_purchase")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_purchase parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve purchase order by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Purchase order not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received purchase order details by ID successfully!", data)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req CreatePOInput

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
		response.Error(ctx, http.StatusInternalServerError, "Failed to create purchase order!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created purchase order successfully!", data)
}

func (h *Handler) UpdateStatus(ctx *gin.Context) {
	idStr := ctx.Param("id_purchase")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_purchase parameter", err.Error())
		return
	}

	var req struct {
		Status     string `json:"status" validate:"required,oneof=pending approved partially_received completed rejected cancelled"`
		ApprovedBy uint   `json:"approved_by" validate:"required,number,min=1"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validator Fail!", errMap)
		return
	}

	data, err := h.service.UpdateStatus(uint(id), req.Status, req.ApprovedBy)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to update purchase order status!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated purchase order status successfully!", data)
}
