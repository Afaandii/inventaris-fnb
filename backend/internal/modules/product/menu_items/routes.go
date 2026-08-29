package menuitems

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB) MenuItemService {
	repo := NewMenuItemRepository(db)
	service := NewMenuItemService(db, repo)
	handler := NewHandler(service)

	group := r.Group("/api/v1/product/menu-items")
	{
		group.GET("", handler.GetAll)
		group.GET("/catalog/outlet/:outlet_id", handler.GetCatalogByOutlet)
		group.GET("/:id_menu_item", handler.GetByID)
		group.POST("", handler.Create)
		group.PUT("/:id_menu_item", handler.Update)
		group.DELETE("/:id_menu_item", handler.Delete)
	}

	return service
}
