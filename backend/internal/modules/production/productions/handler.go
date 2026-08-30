package productions

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service ProductionService
}

func NewHandler(service ProductionService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	productIDStr := ctx.DefaultQuery("product_id", "0")
	warehouseIDStr := ctx.DefaultQuery("warehouse_id", "0")
	outletIDStr := ctx.DefaultQuery("outlet_id", "0")
	status := ctx.DefaultQuery("status", "")

	productID, err := strconv.Atoi(productIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid product_id parameter", err.Error())
		return
	}

	warehouseID, err := strconv.Atoi(warehouseIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid warehouse_id parameter", err.Error())
		return
	}

	outletID, err := strconv.Atoi(outletIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid outlet_id parameter", err.Error())
		return
	}

	data, err := h.service.GetAll(uint(productID), uint(warehouseID), uint(outletID), status)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve productions list!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received productions list successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_production")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_production parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve production details by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Production transaction not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received production details by ID successfully!", data)
}

func (h *Handler) CheckStockRequirement(ctx *gin.Context) {
	idStr := ctx.Param("id_production")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_production parameter", err.Error())
		return
	}

	data, err := h.service.CheckStockRequirement(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to simulate production stock requirement!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received stock check requirement simulation successfully!", data)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req CreateProductionInput

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
		response.Error(ctx, http.StatusInternalServerError, "Failed to create production transaction!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created production transaction successfully!", data)
}

func (h *Handler) UpdateStatus(ctx *gin.Context) {
	idStr := ctx.Param("id_production")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_production parameter", err.Error())
		return
	}

	var req struct {
		Status string `json:"status" validate:"required,oneof=in_progress completed cancelled"`
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
		response.Error(ctx, http.StatusInternalServerError, "Failed to update production status!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated production status successfully!", data)
}
