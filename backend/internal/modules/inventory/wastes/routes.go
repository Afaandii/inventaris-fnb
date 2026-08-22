package wastes

import (
	"backend/internal/modules/inventory/stok_balances"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB, balanceService stokbalances.StokBalanceService) {
	repo := NewWasteRepository(db)
	service := NewWasteService(db, repo, balanceService)
	handler := NewHandler(service)

	group := r.Group("/api/v1/inventory/wastes")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_waste", handler.GetByID)
		group.POST("", handler.Create)
	}
}
