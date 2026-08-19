package stokadjustments

import (
	"backend/internal/shared/model"
	"errors"
	"time"

	"gorm.io/gorm"
)

type StokAdjustmentRepository interface {
	Create(adj *model.StokAdjustments) error
	CreateWithTx(tx *gorm.DB, adj *model.StokAdjustments) error
	GetAll(warehouseID, ingredientID uint) ([]model.StokAdjustments, error)
	GetByID(id uint) (*model.StokAdjustments, error)
	CountTodayAdjustments() (int64, error)
}

type stokAdjustmentRepository struct {
	db *gorm.DB
}

func NewStokAdjustmentRepository(db *gorm.DB) StokAdjustmentRepository {
	return &stokAdjustmentRepository{db}
}

func (r *stokAdjustmentRepository) Create(adj *model.StokAdjustments) error {
	return r.CreateWithTx(r.db, adj)
}

func (r *stokAdjustmentRepository) CreateWithTx(tx *gorm.DB, adj *model.StokAdjustments) error {
	return tx.Create(adj).Error
}

func (r *stokAdjustmentRepository) GetAll(warehouseID, ingredientID uint) ([]model.StokAdjustments, error) {
	var data []model.StokAdjustments
	query := r.db.Preload("Outlet").Preload("Ingredient").Preload("Unit").Preload("Wirehouse").Preload("Users")

	if warehouseID > 0 {
		query = query.Where("wirehouse_id = ?", warehouseID)
	}
	if ingredientID > 0 {
		query = query.Where("ingredient_id = ?", ingredientID)
	}

	err := query.Order("adjustment_date DESC").Find(&data).Error
	return data, err
}

func (r *stokAdjustmentRepository) GetByID(id uint) (*model.StokAdjustments, error) {
	var data model.StokAdjustments
	err := r.db.Preload("Outlet").Preload("Ingredient").Preload("Unit").Preload("Wirehouse").Preload("Users").
		First(&data, "id_stok_adjustment = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}

func (r *stokAdjustmentRepository) CountTodayAdjustments() (int64, error) {
	var count int64
	today := time.Now().Format("2006-01-02")
	err := r.db.Model(&model.StokAdjustments{}).
		Where("DATE(adjustment_date) = ?", today).
		Count(&count).Error
	return count, err
}
