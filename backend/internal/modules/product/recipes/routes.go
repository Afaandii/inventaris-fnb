package recipes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB) RecipeService {
	repo := NewRecipeRepository(db)
	service := NewRecipeService(db, repo)
	handler := NewHandler(service)

	group := r.Group("/api/v1/product/recipes")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_recipe", handler.GetByID)
		group.POST("", handler.Create)
		group.PUT("/:id_recipe", handler.Update)
		group.DELETE("/:id_recipe", handler.Delete)
	}

	return service
}
