package stokadjustments

import (
	stokbalances "backend/internal/modules/inventory/stok_balances"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB, balanceService stokbalances.StokBalanceService) {
	repo := NewStokAdjustmentRepository(db)
	service := NewStokAdjustmentService(db, repo, balanceService)
	handler := NewHandler(service)

	group := r.Group("/api/v1/inventory/stok-adjustments")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_stok_adjustment", handler.GetByID)
		group.POST("", handler.Create)
	}
}
