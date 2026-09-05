package salesorderitems

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB) SalesOrderItemService {
	repo := NewSalesOrderItemRepository(db)
	service := NewSalesOrderItemService(db, repo)
	handler := NewHandler(service)

	group := r.Group("/api/v1/sales/order-items")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_sales_order_item", handler.GetByID)
	}

	return service
}
