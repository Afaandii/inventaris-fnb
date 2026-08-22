package wastes

import (
	"backend/internal/shared/model"
	"errors"

	"gorm.io/gorm"
)

type WasteRepository interface {
	CreateWithTx(tx *gorm.DB, waste *model.Wastes) error
	GetAll(warehouseID, ingredientID uint) ([]model.Wastes, error)
	GetByID(id uint) (*model.Wastes, error)
	GetByIDWithTx(tx *gorm.DB, id uint) (*model.Wastes, error)
}

type wasteRepository struct {
	db *gorm.DB
}

func NewWasteRepository(db *gorm.DB) WasteRepository {
	return &wasteRepository{db}
}

func (r *wasteRepository) CreateWithTx(tx *gorm.DB, waste *model.Wastes) error {
	return tx.Create(waste).Error
}

func (r *wasteRepository) GetAll(warehouseID, ingredientID uint) ([]model.Wastes, error) {
	var data []model.Wastes
	query := r.db.Preload("Outlet").
		Preload("Ingredient").
		Preload("Wirehouse").
		Preload("Unit").
		Preload("CreatedByWas")

	if warehouseID > 0 {
		query = query.Where("wirehouse_id = ?", warehouseID)
	}
	if ingredientID > 0 {
		query = query.Where("ingredient_id = ?", ingredientID)
	}

	err := query.Order("waste_date DESC").Find(&data).Error
	return data, err
}

func (r *wasteRepository) GetByID(id uint) (*model.Wastes, error) {
	return r.GetByIDWithTx(r.db, id)
}

func (r *wasteRepository) GetByIDWithTx(tx *gorm.DB, id uint) (*model.Wastes, error) {
	var data model.Wastes
	err := tx.Preload("Outlet").
		Preload("Ingredient").
		Preload("Wirehouse").
		Preload("Unit").
		Preload("CreatedByWas").
		First(&data, "id_waste = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}
