package stokopnames

import (
	"backend/internal/modules/inventory/stok_balances"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB, balanceService stokbalances.StokBalanceService) {
	repo := NewStokOpnameRepository(db)
	service := NewStokOpnameService(db, repo, balanceService)
	handler := NewHandler(service)

	group := r.Group("/api/v1/inventory/stok-opnames")
	{
		group.GET("", handler.GetAll)
		group.GET("/summary-balance", handler.GetStockSummary)
		group.GET("/:id_stok_opname", handler.GetByID)
		group.POST("", handler.Create)
		group.PUT("/:id_stok_opname/status", handler.UpdateStatus)
	}
}
