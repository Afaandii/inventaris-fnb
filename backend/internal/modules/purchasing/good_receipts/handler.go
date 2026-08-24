package goodreceipts

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service GoodReceiptService
}

func NewHandler(service GoodReceiptService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	purchaseIDStr := ctx.DefaultQuery("purchase_id", "0")
	warehouseIDStr := ctx.DefaultQuery("warehouse_id", "0")
	status := ctx.DefaultQuery("status", "")

	purchaseID, err := strconv.Atoi(purchaseIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid purchase_id parameter", err.Error())
		return
	}

	warehouseID, err := strconv.Atoi(warehouseIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid warehouse_id parameter", err.Error())
		return
	}

	data, err := h.service.GetAll(uint(purchaseID), uint(warehouseID), status)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve good receipts list!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received good receipts successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_good_receipt")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_good_receipt parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve good receipt details by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Good receipt not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received good receipt details by ID successfully!", data)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req CreateGRInput

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
		response.Error(ctx, http.StatusInternalServerError, "Failed to create good receipt!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created good receipt draft successfully!", data)
}

func (h *Handler) UpdateStatus(ctx *gin.Context) {
	idStr := ctx.Param("id_good_receipt")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_good_receipt parameter", err.Error())
		return
	}

	var req struct {
		Status string `json:"status" validate:"required,oneof=received partial completed cancelled"`
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
		response.Error(ctx, http.StatusInternalServerError, "Failed to update good receipt status!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated good receipt status successfully!", data)
}
