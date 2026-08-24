package goodreceipts

import (
	"backend/internal/modules/inventory/stok_balances"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB, balanceService stokbalances.StokBalanceService) {
	repo := NewGoodReceiptRepository(db)
	service := NewGoodReceiptService(db, repo, balanceService)
	handler := NewHandler(service)

	group := r.Group("/api/v1/purchasing/good-receipts")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_good_receipt", handler.GetByID)
		group.POST("", handler.Create)
		group.PUT("/:id_good_receipt/status", handler.UpdateStatus)
	}
}
