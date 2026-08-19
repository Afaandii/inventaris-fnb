package stoktransfers

import (
	"backend/internal/modules/inventory/stok_movements"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB, movementService stokmovements.StokMovementService) {
	repo := NewStokTransferRepository(db)
	service := NewStokTransferService(db, repo, movementService)
	handler := NewHandler(service)

	group := r.Group("/api/v1/inventory/stock-transfers")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_stok_transfer", handler.GetByID)
		group.POST("", handler.Create)
		group.PUT("/:id_stok_transfer/status", handler.UpdateStatus)
	}
}
