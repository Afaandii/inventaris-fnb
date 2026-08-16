package stokbalances

import (
	"backend/internal/shared/model"
	"errors"

	"gorm.io/gorm"
)

type StokBalanceRepository interface {
	GetAll(wirehouseID, ingredientID uint) ([]model.StokBalances, error)
	GetByID(id uint) (*model.StokBalances, error)
	GetByIngredientAndWarehouse(ingredientID, wirehouseID uint) ([]model.StokBalances, error)
	GetByIngredientAndWarehouseAndBatch(ingredientID, wirehouseID uint, batchNo string) (*model.StokBalances, error)
	GetByIngredientAndWarehouseAndBatchWithTx(tx *gorm.DB, ingredientID, wirehouseID uint, batchNo string) (*model.StokBalances, error)
	Create(stok *model.StokBalances) error
	CreateWithTx(tx *gorm.DB, stok *model.StokBalances) error
	Update(stok *model.StokBalances) error
	UpdateWithTx(tx *gorm.DB, stok *model.StokBalances) error
	Delete(id uint) error
	GetAvailableBatchesFEFO(ingredientID, wirehouseID uint) ([]model.StokBalances, error)
	GetAvailableBatchesFEFOWithTx(tx *gorm.DB, ingredientID, wirehouseID uint) ([]model.StokBalances, error)
}

type stokBalanceRepository struct {
	db *gorm.DB
}

func NewStokBalanceRepository(db *gorm.DB) StokBalanceRepository {
	return &stokBalanceRepository{db}
}

func (r *stokBalanceRepository) GetAll(wirehouseID, ingredientID uint) ([]model.StokBalances, error) {
	var data []model.StokBalances
	query := r.db.Preload("Ingredient").Preload("Wirehouse")

	if wirehouseID > 0 {
		query = query.Where("wirehouse_id = ?", wirehouseID)
	}
	if ingredientID > 0 {
		query = query.Where("ingredient_id = ?", ingredientID)
	}

	err := query.Find(&data).Error
	return data, err
}

func (r *stokBalanceRepository) GetByID(id uint) (*model.StokBalances, error) {
	var data model.StokBalances
	err := r.db.Preload("Ingredient").Preload("Wirehouse").First(&data, "id_stok_balance = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}

func (r *stokBalanceRepository) GetByIngredientAndWarehouse(ingredientID, wirehouseID uint) ([]model.StokBalances, error) {
	var data []model.StokBalances
	err := r.db.Where("ingredient_id = ? AND wirehouse_id = ?", ingredientID, wirehouseID).Find(&data).Error
	return data, err
}

func (r *stokBalanceRepository) GetByIngredientAndWarehouseAndBatch(ingredientID, wirehouseID uint, batchNo string) (*model.StokBalances, error) {
	return r.GetByIngredientAndWarehouseAndBatchWithTx(r.db, ingredientID, wirehouseID, batchNo)
}

func (r *stokBalanceRepository) GetByIngredientAndWarehouseAndBatchWithTx(tx *gorm.DB, ingredientID, wirehouseID uint, batchNo string) (*model.StokBalances, error) {
	var data model.StokBalances
	err := tx.Where("ingredient_id = ? AND wirehouse_id = ? AND batch_no = ?", ingredientID, wirehouseID, batchNo).First(&data).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}

func (r *stokBalanceRepository) Create(stok *model.StokBalances) error {
	return r.CreateWithTx(r.db, stok)
}

func (r *stokBalanceRepository) CreateWithTx(tx *gorm.DB, stok *model.StokBalances) error {
	return tx.Create(stok).Error
}

func (r *stokBalanceRepository) Update(stok *model.StokBalances) error {
	return r.UpdateWithTx(r.db, stok)
}

func (r *stokBalanceRepository) UpdateWithTx(tx *gorm.DB, stok *model.StokBalances) error {
	return tx.Save(stok).Error
}

func (r *stokBalanceRepository) Delete(id uint) error {
	return r.db.Delete(&model.StokBalances{}, "id_stok_balance = ?", id).Error
}

// GetAvailableBatchesFEFO mengambil batch stok yang belum habis, diurutkan dari yang paling dekat expired date-nya
func (r *stokBalanceRepository) GetAvailableBatchesFEFO(ingredientID, wirehouseID uint) ([]model.StokBalances, error) {
	return r.GetAvailableBatchesFEFOWithTx(r.db, ingredientID, wirehouseID)
}

func (r *stokBalanceRepository) GetAvailableBatchesFEFOWithTx(tx *gorm.DB, ingredientID, wirehouseID uint) ([]model.StokBalances, error) {
	var data []model.StokBalances
	// FEFO: Urgent expire date diutamakan. Nilai null expire date diletakkan di akhir (menggunakan NULLS LAST)
	err := tx.Where("ingredient_id = ? AND wirehouse_id = ? AND available_qty > 0", ingredientID, wirehouseID).
		Order("expire_date ASC NULLS LAST").
		Find(&data).Error
	return data, err
}
