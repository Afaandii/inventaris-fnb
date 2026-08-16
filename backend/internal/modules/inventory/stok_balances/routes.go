package stokbalances

import (
	stokmovements "backend/internal/modules/inventory/stok_movements"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterStokBalanceRoutes(r *gin.Engine, db *gorm.DB, movementService stokmovements.StokMovementService) StokBalanceService {
	repo := NewStokBalanceRepository(db)
	service := NewStokBalanceService(repo, movementService)
	handler := NewStokBalanceHandler(service)

	group := r.Group("/api/v1/inventory/stok-balances")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_stok_balance", handler.GetByID)
	}

	return service
}
