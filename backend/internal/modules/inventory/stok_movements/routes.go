package stokmovements

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterStokMovementRoutes(r *gin.Engine, db *gorm.DB, service StokMovementService) {
	handler := NewStokMovementHandler(service)

	group := r.Group("/api/v1/inventory/stok-movements")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_stok_movement", handler.GetByID)
	}
}
