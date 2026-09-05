package payments

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB) PaymentService {
	repo := NewPaymentRepository(db)
	service := NewPaymentService(db, repo)
	handler := NewHandler(service)

	group := r.Group("/api/v1/sales/payments")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_payment", handler.GetByID)
		group.POST("", handler.Create)
	}

	return service
}
