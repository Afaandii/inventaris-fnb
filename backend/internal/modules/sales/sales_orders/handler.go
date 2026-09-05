package salesorders

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service SalesOrderService
}

func NewHandler(service SalesOrderService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	outletIDStr := ctx.DefaultQuery("outlet_id", "0")
	cashierIDStr := ctx.DefaultQuery("cashier_id", "0")
	tableIDStr := ctx.DefaultQuery("table_id", "0")
	status := ctx.DefaultQuery("status", "")
	paymentStatus := ctx.DefaultQuery("payment_status", "")
	orderType := ctx.DefaultQuery("order_type", "")
	startDate := ctx.DefaultQuery("start_date", "")
	endDate := ctx.DefaultQuery("end_date", "")

	outletID, err := strconv.Atoi(outletIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid outlet_id parameter", err.Error())
		return
	}

	cashierID, err := strconv.Atoi(cashierIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid cashier_id parameter", err.Error())
		return
	}

	tableID, err := strconv.Atoi(tableIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid table_id parameter", err.Error())
		return
	}

	data, err := h.service.GetAll(uint(outletID), uint(cashierID), uint(tableID), status, paymentStatus, orderType, startDate, endDate)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve sales orders list!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received sales orders list successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_sales_order")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_sales_order parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve sales order details by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Sales order not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received sales order details by ID successfully!", data)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req CreateSalesOrderInput

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
		response.Error(ctx, http.StatusInternalServerError, "Failed to create sales order!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created sales order successfully!", data)
}

func (h *Handler) UpdateStatus(ctx *gin.Context) {
	idStr := ctx.Param("id_sales_order")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_sales_order parameter", err.Error())
		return
	}

	var req struct {
		Status string `json:"status" validate:"required,oneof=draft confirmed processing ready completed cancelled"`
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
		response.Error(ctx, http.StatusInternalServerError, "Failed to update sales order status!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated sales order status successfully!", data)
}

func (h *Handler) CancelOrder(ctx *gin.Context) {
	idStr := ctx.Param("id_sales_order")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_sales_order parameter", err.Error())
		return
	}

	var req struct {
		UserID uint `json:"user_id" validate:"required,number,min=1"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validator Fail!", errMap)
		return
	}

	data, err := h.service.CancelOrder(uint(id), req.UserID)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to cancel sales order!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Cancelled sales order successfully!", data)
}
