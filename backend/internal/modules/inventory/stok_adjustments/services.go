package stokadjustments

import (
	"backend/internal/modules/inventory/stok_balances"
	"backend/internal/shared/model"
	"errors"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type StokAdjustmentService interface {
	GetAll(warehouseID, ingredientID uint) ([]model.StokAdjustments, error)
	GetByID(id uint) (*model.StokAdjustments, error)
	Create(warehouseID, ingredientID, userID uint, actualQty uint, reason string) (*model.StokAdjustments, error)
}

type stokAdjustmentService struct {
	db             *gorm.DB
	repo           StokAdjustmentRepository
	balanceService stokbalances.StokBalanceService
}

func NewStokAdjustmentService(db *gorm.DB, repo StokAdjustmentRepository, balanceService stokbalances.StokBalanceService) StokAdjustmentService {
	return &stokAdjustmentService{db, repo, balanceService}
}

func (s *stokAdjustmentService) GetAll(warehouseID, ingredientID uint) ([]model.StokAdjustments, error) {
	return s.repo.GetAll(warehouseID, ingredientID)
}

func (s *stokAdjustmentService) GetByID(id uint) (*model.StokAdjustments, error) {
	return s.repo.GetByID(id)
}

func (s *stokAdjustmentService) Create(warehouseID, ingredientID, userID uint, actualQty uint, reason string) (*model.StokAdjustments, error) {
	// Start Transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 1. Dapatkan data wirehouse untuk mengambil outlet_id
	var wirehouse model.Wirehouse
	if err := tx.First(&wirehouse, "id_wirehouse = ?", warehouseID).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("warehouse tidak ditemukan")
	}

	// 2. Dapatkan data ingredient untuk mengambil unit_id dan average_cost
	var ingredient model.Ingredients
	if err := tx.First(&ingredient, "id_ingredient = ?", ingredientID).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("ingredient tidak ditemukan")
	}

	// 3. Hitung total stok sistem saat ini di gudang tersebut
	var balances []model.StokBalances
	if err := tx.Where("ingredient_id = ? AND wirehouse_id = ?", ingredientID, warehouseID).Find(&balances).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	var systemQty uint = 0
	for _, b := range balances {
		systemQty += b.AvailableQty
	}

	diff := int(actualQty) - int(systemQty)

	// 4. Buat record StokAdjustments
	diffDecimal := decimal.NewFromInt(int64(diff))
	adj := &model.StokAdjustments{
		OutletRef:      wirehouse.OutletRef,
		IngredientRef:  ingredientID,
		UnitRef:        ingredient.UnitRef,
		WirehouseRef:   warehouseID,
		CreatedBy:      userID,
		Qty:            diffDecimal,
		Reason:         reason,
		AdjustmentDate: time.Now(),
	}

	if err := s.repo.CreateWithTx(tx, adj); err != nil {
		tx.Rollback()
		return nil, err
	}

	// 5. Terapkan mutasi stok berdasarkan selisih
	if diff > 0 {
		// Koreksi Positif: Tambah stok
		err := s.balanceService.AddStock(
			tx,
			ingredientID,
			warehouseID,
			uint(diff),
			"",                      // Tanpa nomor batch khusus penyesuaian manual
			time.Time{},             // Tanpa expired date
			ingredient.AverageCost,  // unit_cost disetel otomatis ke AverageCost
			userID,
			adj.IDStokAdjustment,
			"stok_adjusment",        // Sesuai enum postgres: "stok_adjusment"
			reason,
		)
		if err != nil {
			tx.Rollback()
			return nil, err
		}
	} else if diff < 0 {
		// Koreksi Negatif: Kurangi stok (FEFO)
		err := s.balanceService.ReduceStock(
			tx,
			ingredientID,
			warehouseID,
			uint(-diff),
			userID,
			adj.IDStokAdjustment,
			"stok_adjusment",        // Sesuai enum postgres: "stok_adjusment"
			reason,
		)
		if err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// Ambil data utuh yang baru dibuat beserta preloads
	return s.repo.GetByID(adj.IDStokAdjustment)
}
