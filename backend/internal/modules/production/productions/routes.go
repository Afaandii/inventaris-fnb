package productions

import (
	"backend/internal/modules/inventory/stok_balances"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB, balanceService stokbalances.StokBalanceService) ProductionService {
	repo := NewProductionRepository(db)
	service := NewProductionService(db, repo, balanceService)
	handler := NewHandler(service)

	group := r.Group("/api/v1/production/productions")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_production", handler.GetByID)
		group.GET("/:id_production/check-stock", handler.CheckStockRequirement)
		group.POST("", handler.Create)
		group.PUT("/:id_production/status", handler.UpdateStatus)
	}

	return service
}
