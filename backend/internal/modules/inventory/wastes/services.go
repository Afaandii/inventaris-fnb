package wastes

import (
	stokbalances "backend/internal/modules/inventory/stok_balances"
	"backend/internal/shared/model"
	"errors"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type WasteService interface {
	GetAll(warehouseID, ingredientID uint) ([]model.Wastes, error)
	GetByID(id uint) (*model.Wastes, error)
	Create(warehouseID, ingredientID, createdBy uint, qty float64, reason string) (*model.Wastes, error)
}

type wasteService struct {
	db             *gorm.DB
	repo           WasteRepository
	balanceService stokbalances.StokBalanceService
}

func NewWasteService(db *gorm.DB, repo WasteRepository, balanceService stokbalances.StokBalanceService) WasteService {
	return &wasteService{db, repo, balanceService}
}

func (s *wasteService) GetAll(warehouseID, ingredientID uint) ([]model.Wastes, error) {
	return s.repo.GetAll(warehouseID, ingredientID)
}

func (s *wasteService) GetByID(id uint) (*model.Wastes, error) {
	return s.repo.GetByID(id)
}

func (s *wasteService) Create(warehouseID, ingredientID, createdBy uint, qty float64, reason string) (*model.Wastes, error) {
	qtyNeeded := uint(qty)
	if qtyNeeded == 0 {
		return nil, errors.New("kuantitas waste harus lebih besar dari 0")
	}

	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var wirehouse model.Wirehouse
	if err := tx.First(&wirehouse, "id_wirehouse = ?", warehouseID).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("warehouse tidak ditemukan")
	}

	var ingredient model.Ingredients
	if err := tx.First(&ingredient, "id_ingredient = ?", ingredientID).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("ingredient tidak ditemukan")
	}

	waste := &model.Wastes{
		OutletRef:     wirehouse.OutletRef,
		IngredientRef: ingredientID,
		WirehouseRef:  warehouseID,
		UnitRef:       ingredient.UnitRef,
		CreatedBy:     createdBy,
		Qty:           decimal.NewFromFloat(qty),
		Reason:        reason,
		WasteDate:     time.Now(),
	}

	if err := s.repo.CreateWithTx(tx, waste); err != nil {
		tx.Rollback()
		return nil, err
	}

	// Kurangi saldo stok secara transaksional dengan strategi FEFO dan catat movement tipe 'waste'
	err := s.balanceService.ReduceStock(
		tx,
		ingredientID,
		warehouseID,
		qtyNeeded,
		createdBy,
		waste.IDWaste,
		"waste",
		reason,
	)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.repo.GetByID(waste.IDWaste)
}
