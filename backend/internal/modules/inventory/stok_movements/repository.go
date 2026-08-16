package stokmovements

import (
	"backend/internal/shared/model"
	"errors"

	"gorm.io/gorm"
)

type StokMovementRepository interface {
	GetAll(wirehouseID, ingredientID uint, movementType string, startDate, endDate string) ([]model.StokMovements, error)
	GetByID(id uint) (*model.StokMovements, error)
	CreateWithTx(tx *gorm.DB, movement *model.StokMovements) error
}

type stokMovementRepository struct {
	db *gorm.DB
}

func NewStokMovementRepository(db *gorm.DB) StokMovementRepository {
	return &stokMovementRepository{db}
}

func (r *stokMovementRepository) GetAll(wirehouseID, ingredientID uint, movementType string, startDate, endDate string) ([]model.StokMovements, error) {
	var data []model.StokMovements
	query := r.db.Preload("Ingredient").Preload("WarehousesFrom").Preload("WarehousesTo").Preload("CreateBy")

	if wirehouseID > 0 {
		query = query.Where("wirehouse_from = ? OR wirehouse_to = ?", wirehouseID, wirehouseID)
	}
	if ingredientID > 0 {
		query = query.Where("ingredient_id = ?", ingredientID)
	}
	if movementType != "" {
		query = query.Where("movement_type = ?", movementType)
	}
	if startDate != "" && endDate != "" {
		query = query.Where("movement_date BETWEEN ? AND ?", startDate+" 00:00:00", endDate+" 23:59:59")
	}

	err := query.Order("movement_date DESC, id_stok_movement DESC").Find(&data).Error
	return data, err
}

func (r *stokMovementRepository) GetByID(id uint) (*model.StokMovements, error) {
	var data model.StokMovements
	err := r.db.Preload("Ingredient").Preload("WarehousesFrom").Preload("WarehousesTo").Preload("CreateBy").
		First(&data, "id_stok_movement = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}

func (r *stokMovementRepository) CreateWithTx(tx *gorm.DB, movement *model.StokMovements) error {
	return tx.Create(movement).Error
}
