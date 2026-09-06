package reports

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB) ReportService {
	repo := NewReportRepository(db)
	service := NewReportService(db, repo)
	handler := NewHandler(service)

	group := r.Group("/api/v1/reports")
	{
		group.GET("/dashboard", handler.GetDashboardMetrics)

		// Sales Reports
		salesGroup := group.Group("/sales")
		{
			salesGroup.GET("/summary", handler.GetSalesSummary)
			salesGroup.GET("/details", handler.GetSalesDetails)
			salesGroup.GET("/products", handler.GetProductSales)
			salesGroup.GET("/payments", handler.GetPaymentSummary)
		}

		// Inventory Reports
		inventoryGroup := group.Group("/inventory")
		{
			inventoryGroup.GET("/current-stock", handler.GetCurrentStock)
			inventoryGroup.GET("/low-stock", handler.GetLowStockAlerts)
			inventoryGroup.GET("/movements", handler.GetStockMovements)
			inventoryGroup.GET("/opnames", handler.GetStockOpnames)
			inventoryGroup.GET("/adjustments", handler.GetStockAdjustments)
			inventoryGroup.GET("/transfers", handler.GetStockTransfers)
			inventoryGroup.GET("/wastes", handler.GetWasteReport)
		}

		// Purchasing Reports
		purchasingGroup := group.Group("/purchasing")
		{
			purchasingGroup.GET("/orders", handler.GetPurchaseOrders)
			purchasingGroup.GET("/receipts", handler.GetGoodReceipts)
		}

		// Production Reports
		productionGroup := group.Group("/production")
		{
			productionGroup.GET("/summary", handler.GetProductionSummary)
		}

		// Reservation Reports
		reservationGroup := group.Group("/reservations")
		{
			reservationGroup.GET("/summary", handler.GetReservationSummary)
		}
	}

	return service
}
