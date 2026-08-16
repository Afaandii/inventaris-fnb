package stokbalances

import (
	"backend/internal/shared/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service StokBalanceService
}

func NewStokBalanceHandler(service StokBalanceService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	wirehouseIDStr := ctx.DefaultQuery("wirehouse_id", "0")
	ingredientIDStr := ctx.DefaultQuery("ingredient_id", "0")

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

	data, err := h.service.GetAll(uint(wirehouseID), uint(ingredientID))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve stock balances!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received stock balances successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_stok_balance")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_stok_balance parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve stock balance by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Stock balance not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received stock balance by ID successfully!", data)
}
