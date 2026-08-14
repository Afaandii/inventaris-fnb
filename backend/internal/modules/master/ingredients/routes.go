package ingredients

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterIngredientRoutes(r *gin.Engine, db *gorm.DB) {
	repo := NewIngredientRepository(db)
	service := NewServiceIngredient(repo)
	handler := NewHandlerIngredient(service)

	group := r.Group("/api/v1/ingredients")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_ingredient", handler.GetById)
		group.POST("", handler.Create)
		group.PUT("/:id_ingredient", handler.Update)
		group.DELETE("/:id_ingredient", handler.Delete)
	}
}
