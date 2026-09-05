package salesorderitems

import (
	"backend/internal/shared/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service SalesOrderItemService
}

func NewHandler(service SalesOrderItemService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	orderIDStr := ctx.DefaultQuery("sales_order_id", "0")
	orderID, err := strconv.Atoi(orderIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid sales_order_id parameter", err.Error())
		return
	}

	data, err := h.service.GetAll(uint(orderID))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve sales order items!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received sales order items successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_sales_order_item")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_sales_order_item parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve sales order item details!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Sales order item not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received sales order item details successfully!", data)
}
