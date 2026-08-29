package productvariants

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB) ProductVariantService {
	repo := NewProductVariantRepository(db)
	service := NewProductVariantService(db, repo)
	handler := NewHandler(service)

	group := r.Group("/api/v1/product/variants")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_product_variant", handler.GetByID)
		group.POST("", handler.Create)
		group.PUT("/:id_product_variant", handler.Update)
		group.DELETE("/:id_product_variant", handler.Delete)
	}

	return service
}
