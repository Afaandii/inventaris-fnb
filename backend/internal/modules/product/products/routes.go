package products

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB) ProductService {
	repo := NewProductRepository(db)
	service := NewProductService(db, repo)
	handler := NewHandler(service)

	group := r.Group("/api/v1/product/products")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_product", handler.GetByID)
		group.POST("", handler.Create)
		group.PUT("/:id_product", handler.Update)
		group.DELETE("/:id_product", handler.Delete)
	}

	return service
}
