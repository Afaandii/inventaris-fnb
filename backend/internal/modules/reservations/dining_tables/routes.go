package diningtables

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB) DiningTableService {
	repo := NewDiningTableRepository(db)
	service := NewDiningTableService(db, repo)
	handler := NewHandler(service)

	group := r.Group("/api/v1/reservations/dining-tables")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_dining_table", handler.GetByID)
		group.POST("", handler.Create)
		group.PUT("/:id_dining_table", handler.Update)
		group.DELETE("/:id_dining_table", handler.Delete)
	}

	return service
}
