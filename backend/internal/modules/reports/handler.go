package reports

import (
	"backend/internal/shared/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service ReportService
}

func NewHandler(service ReportService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetDashboardMetrics(ctx *gin.Context) {
	outletIDStr := ctx.DefaultQuery("outlet_id", "0")
	outletID, _ := strconv.Atoi(outletIDStr)

	data, err := h.service.GetDashboardMetrics(uint(outletID))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve dashboard metrics!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received dashboard metrics successfully!", data)
}

func (h *Handler) GetSalesSummary(ctx *gin.Context) {
	outletIDStr := ctx.DefaultQuery("outlet_id", "0")
	startDate := ctx.DefaultQuery("start_date", "")
	endDate := ctx.DefaultQuery("end_date", "")
	orderType := ctx.DefaultQuery("order_type", "")

	outletID, _ := strconv.Atoi(outletIDStr)

	data, err := h.service.GetSalesSummary(uint(outletID), startDate, endDate, orderType)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve sales summary report!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received sales summary report successfully!", data)
}

func (h *Handler) GetSalesDetails(ctx *gin.Context) {
	outletIDStr := ctx.DefaultQuery("outlet_id", "0")
	cashierIDStr := ctx.DefaultQuery("cashier_id", "0")
	tableIDStr := ctx.DefaultQuery("table_id", "0")
	status := ctx.DefaultQuery("status", "")
	paymentStatus := ctx.DefaultQuery("payment_status", "")
	orderType := ctx.DefaultQuery("order_type", "")
	startDate := ctx.DefaultQuery("start_date", "")
	endDate := ctx.DefaultQuery("end_date", "")

	outletID, _ := strconv.Atoi(outletIDStr)
	cashierID, _ := strconv.Atoi(cashierIDStr)
	tableID, _ := strconv.Atoi(tableIDStr)

	data, err := h.service.GetSalesDetails(uint(outletID), uint(cashierID), uint(tableID), status, paymentStatus, orderType, startDate, endDate)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve sales details report!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received sales details report successfully!", data)
}

func (h *Handler) GetProductSales(ctx *gin.Context) {
	outletIDStr := ctx.DefaultQuery("outlet_id", "0")
	categoryIDStr := ctx.DefaultQuery("category_id", "0")
	startDate := ctx.DefaultQuery("start_date", "")
	endDate := ctx.DefaultQuery("end_date", "")

	outletID, _ := strconv.Atoi(outletIDStr)
	categoryID, _ := strconv.Atoi(categoryIDStr)

	data, err := h.service.GetProductSales(uint(outletID), uint(categoryID), startDate, endDate)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve product sales report!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received product sales report successfully!", data)
}

func (h *Handler) GetPaymentSummary(ctx *gin.Context) {
	outletIDStr := ctx.DefaultQuery("outlet_id", "0")
	startDate := ctx.DefaultQuery("start_date", "")
	endDate := ctx.DefaultQuery("end_date", "")

	outletID, _ := strconv.Atoi(outletIDStr)

	data, err := h.service.GetPaymentSummary(uint(outletID), startDate, endDate)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve payment summary report!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received payment summary report successfully!", data)
}

func (h *Handler) GetCurrentStock(ctx *gin.Context) {
	warehouseIDStr := ctx.DefaultQuery("warehouse_id", "0")
	categoryIDStr := ctx.DefaultQuery("category_id", "0")
	statusFilter := ctx.DefaultQuery("status", "")

	warehouseID, _ := strconv.Atoi(warehouseIDStr)
	categoryID, _ := strconv.Atoi(categoryIDStr)

	data, err := h.service.GetCurrentStock(uint(warehouseID), uint(categoryID), statusFilter)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve current stock report!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received current stock report successfully!", data)
}

func (h *Handler) GetLowStockAlerts(ctx *gin.Context) {
	warehouseIDStr := ctx.DefaultQuery("warehouse_id", "0")
	warehouseID, _ := strconv.Atoi(warehouseIDStr)

	data, err := h.service.GetLowStockAlerts(uint(warehouseID))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve low stock alerts report!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received low stock alerts report successfully!", data)
}

func (h *Handler) GetStockMovements(ctx *gin.Context) {
	warehouseIDStr := ctx.DefaultQuery("warehouse_id", "0")
	ingredientIDStr := ctx.DefaultQuery("ingredient_id", "0")
	movementType := ctx.DefaultQuery("movement_type", "")
	refType := ctx.DefaultQuery("ref_type", "")
	startDate := ctx.DefaultQuery("start_date", "")
	endDate := ctx.DefaultQuery("end_date", "")

	warehouseID, _ := strconv.Atoi(warehouseIDStr)
	ingredientID, _ := strconv.Atoi(ingredientIDStr)

	data, err := h.service.GetStockMovements(uint(warehouseID), uint(ingredientID), movementType, refType, startDate, endDate)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve stock movements report!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received stock movements report successfully!", data)
}

func (h *Handler) GetStockOpnames(ctx *gin.Context) {
	warehouseIDStr := ctx.DefaultQuery("warehouse_id", "0")
	status := ctx.DefaultQuery("status", "")
	startDate := ctx.DefaultQuery("start_date", "")
	endDate := ctx.DefaultQuery("end_date", "")

	warehouseID, _ := strconv.Atoi(warehouseIDStr)

	data, err := h.service.GetStockOpnames(uint(warehouseID), status, startDate, endDate)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve stock opnames report!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received stock opnames report successfully!", data)
}

func (h *Handler) GetStockAdjustments(ctx *gin.Context) {
	warehouseIDStr := ctx.DefaultQuery("warehouse_id", "0")
	ingredientIDStr := ctx.DefaultQuery("ingredient_id", "0")
	startDate := ctx.DefaultQuery("start_date", "")
	endDate := ctx.DefaultQuery("end_date", "")

	warehouseID, _ := strconv.Atoi(warehouseIDStr)
	ingredientID, _ := strconv.Atoi(ingredientIDStr)

	data, err := h.service.GetStockAdjustments(uint(warehouseID), uint(ingredientID), startDate, endDate)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve stock adjustments report!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received stock adjustments report successfully!", data)
}

func (h *Handler) GetStockTransfers(ctx *gin.Context) {
	warehouseFromStr := ctx.DefaultQuery("warehouse_from_id", "0")
	warehouseToStr := ctx.DefaultQuery("warehouse_to_id", "0")
	status := ctx.DefaultQuery("status", "")
	startDate := ctx.DefaultQuery("start_date", "")
	endDate := ctx.DefaultQuery("end_date", "")

	warehouseFrom, _ := strconv.Atoi(warehouseFromStr)
	warehouseTo, _ := strconv.Atoi(warehouseToStr)

	data, err := h.service.GetStockTransfers(uint(warehouseFrom), uint(warehouseTo), status, startDate, endDate)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve stock transfers report!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received stock transfers report successfully!", data)
}

func (h *Handler) GetWasteReport(ctx *gin.Context) {
	outletIDStr := ctx.DefaultQuery("outlet_id", "0")
	warehouseIDStr := ctx.DefaultQuery("warehouse_id", "0")
	ingredientIDStr := ctx.DefaultQuery("ingredient_id", "0")
	startDate := ctx.DefaultQuery("start_date", "")
	endDate := ctx.DefaultQuery("end_date", "")

	outletID, _ := strconv.Atoi(outletIDStr)
	warehouseID, _ := strconv.Atoi(warehouseIDStr)
	ingredientID, _ := strconv.Atoi(ingredientIDStr)

	data, err := h.service.GetWasteReport(uint(outletID), uint(warehouseID), uint(ingredientID), startDate, endDate)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve waste report!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received waste report successfully!", data)
}

func (h *Handler) GetPurchaseOrders(ctx *gin.Context) {
	supplierIDStr := ctx.DefaultQuery("supplier_id", "0")
	warehouseIDStr := ctx.DefaultQuery("warehouse_id", "0")
	status := ctx.DefaultQuery("status", "")
	startDate := ctx.DefaultQuery("start_date", "")
	endDate := ctx.DefaultQuery("end_date", "")

	supplierID, _ := strconv.Atoi(supplierIDStr)
	warehouseID, _ := strconv.Atoi(warehouseIDStr)

	data, err := h.service.GetPurchaseOrders(uint(supplierID), uint(warehouseID), status, startDate, endDate)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve purchase orders report!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received purchase orders report successfully!", data)
}

func (h *Handler) GetGoodReceipts(ctx *gin.Context) {
	supplierIDStr := ctx.DefaultQuery("supplier_id", "0")
	warehouseIDStr := ctx.DefaultQuery("warehouse_id", "0")
	status := ctx.DefaultQuery("status", "")
	startDate := ctx.DefaultQuery("start_date", "")
	endDate := ctx.DefaultQuery("end_date", "")

	supplierID, _ := strconv.Atoi(supplierIDStr)
	warehouseID, _ := strconv.Atoi(warehouseIDStr)

	data, err := h.service.GetGoodReceipts(uint(supplierID), uint(warehouseID), status, startDate, endDate)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve good receipts report!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received good receipts report successfully!", data)
}

func (h *Handler) GetProductionSummary(ctx *gin.Context) {
	outletIDStr := ctx.DefaultQuery("outlet_id", "0")
	warehouseIDStr := ctx.DefaultQuery("warehouse_id", "0")
	productIDStr := ctx.DefaultQuery("product_id", "0")
	status := ctx.DefaultQuery("status", "")
	startDate := ctx.DefaultQuery("start_date", "")
	endDate := ctx.DefaultQuery("end_date", "")

	outletID, _ := strconv.Atoi(outletIDStr)
	warehouseID, _ := strconv.Atoi(warehouseIDStr)
	productID, _ := strconv.Atoi(productIDStr)

	data, err := h.service.GetProductionSummary(uint(outletID), uint(warehouseID), uint(productID), status, startDate, endDate)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve production summary report!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received production summary report successfully!", data)
}

func (h *Handler) GetReservationSummary(ctx *gin.Context) {
	outletIDStr := ctx.DefaultQuery("outlet_id", "0")
	tableIDStr := ctx.DefaultQuery("table_id", "0")
	status := ctx.DefaultQuery("status", "")
	startDate := ctx.DefaultQuery("start_date", "")
	endDate := ctx.DefaultQuery("end_date", "")

	outletID, _ := strconv.Atoi(outletIDStr)
	tableID, _ := strconv.Atoi(tableIDStr)

	data, err := h.service.GetReservationSummary(uint(outletID), uint(tableID), status, startDate, endDate)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve reservation summary report!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received reservation summary report successfully!", data)
}
