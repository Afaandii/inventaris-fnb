package wastes

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service WasteService
}

func NewHandler(service WasteService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	warehouseIDStr := ctx.DefaultQuery("warehouse_id", "0")
	ingredientIDStr := ctx.DefaultQuery("ingredient_id", "0")

	warehouseID, err := strconv.Atoi(warehouseIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid warehouse_id parameter", err.Error())
		return
	}

	ingredientID, err := strconv.Atoi(ingredientIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid ingredient_id parameter", err.Error())
		return
	}

	data, err := h.service.GetAll(uint(warehouseID), uint(ingredientID))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve wastes list!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received wastes successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_waste")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_waste parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve waste details by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Waste record not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received waste details by ID successfully!", data)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req struct {
		WarehouseID  uint    `json:"warehouse_id" validate:"required,number,min=1"`
		IngredientID uint    `json:"ingredient_id" validate:"required,number,min=1"`
		UserID       uint    `json:"user_id" validate:"required,number,min=1"`
		Qty          float64 `json:"qty" validate:"required,numeric,gt=0"`
		Reason       string  `json:"reason" validate:"required,min=3"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validator Fail!", errMap)
		return
	}

	data, err := h.service.Create(req.WarehouseID, req.IngredientID, req.UserID, req.Qty, req.Reason)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to record waste!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Recorded waste successfully!", data)
}
