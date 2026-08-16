package stokmovements

import (
	"backend/internal/shared/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service StokMovementService
}

func NewStokMovementHandler(service StokMovementService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	wirehouseIDStr := ctx.DefaultQuery("wirehouse_id", "0")
	ingredientIDStr := ctx.DefaultQuery("ingredient_id", "0")
	movementType := ctx.DefaultQuery("movement_type", "")
	startDate := ctx.DefaultQuery("start_date", "")
	endDate := ctx.DefaultQuery("end_date", "")

	wirehouseID, err := strconv.Atoi(wirehouseIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid wirehouse_id parameter", err.Error())
		return
	}

	ingredientID, err := strconv.Atoi(ingredientIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid ingredient_id parameter", err.Error())
		return
	}

	data, err := h.service.GetAll(uint(wirehouseID), uint(ingredientID), movementType, startDate, endDate)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve stock movements history!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received stock movements history successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_stok_movement")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_stok_movement parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve stock movement history by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Stock movement history not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received stock movement history by ID successfully!", data)
}
