package salesorders

import (
	"backend/internal/modules/inventory/stok_balances"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB, balanceService stokbalances.StokBalanceService) SalesOrderService {
	repo := NewSalesOrderRepository(db)
	service := NewSalesOrderService(db, repo, balanceService)
	handler := NewHandler(service)

	group := r.Group("/api/v1/sales/orders")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_sales_order", handler.GetByID)
		group.POST("", handler.Create)
		group.PUT("/:id_sales_order/status", handler.UpdateStatus)
		group.PUT("/:id_sales_order/cancel", handler.CancelOrder)
	}

	return service
}
