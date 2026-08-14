package categories

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterCategoryRoutes(r *gin.Engine, db *gorm.DB) {
	repo := NewCategoryRepository(db)
	service := NewServiceRole(repo)
	handler := NewHandlerRole(service)

	group := r.Group("/api/v1/categories")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_category", handler.GetById)
		group.POST("", handler.Create)
		group.PUT("/:id_category", handler.Update)
		group.DELETE("/:id_category", handler.Delete)
	}
}
