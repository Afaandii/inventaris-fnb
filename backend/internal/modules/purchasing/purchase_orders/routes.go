package purchaseorders

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB) PurchaseOrderService {
	repo := NewPurchaseOrderRepository(db)
	service := NewPurchaseOrderService(db, repo)
	handler := NewHandler(service)

	group := r.Group("/api/v1/purchasing/purchase-orders")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_purchase", handler.GetByID)
		group.POST("", handler.Create)
		group.PUT("/:id_purchase/status", handler.UpdateStatus)
	}

	return service
}
