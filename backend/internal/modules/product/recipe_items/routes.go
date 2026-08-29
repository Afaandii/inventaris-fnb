package recipeitems

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB) RecipeItemService {
	repo := NewRecipeItemRepository(db)
	service := NewRecipeItemService(db, repo)
	handler := NewHandler(service)

	group := r.Group("/api/v1/product/recipe-items")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_recipe_item", handler.GetByID)
		group.POST("", handler.Create)
		group.PUT("/:id_recipe_item", handler.Update)
		group.DELETE("/:id_recipe_item", handler.Delete)
	}

	return service
}
