package wirehouses

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterWirehouseRoutes(r *gin.Engine, db *gorm.DB) {
	repo := NewWirehouseRepository(db)
	service := NewWirehouseService(repo)
	handler := NewHandlerWirehouse(service)

	group := r.Group("/api/v1/wirehouses")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_wirehouse", handler.GetById)
		group.POST("", handler.Create)
		group.PUT("/:id_wirehouse", handler.Update)
		group.DELETE("/:id_wirehouse", handler.Delete)
	}
}
