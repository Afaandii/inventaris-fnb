package diningtables

import (
	"backend/internal/shared/model"
	"errors"

	"gorm.io/gorm"
)

type DiningTableRepository interface {
	Create(table *model.DiningTables) error
	Update(table *model.DiningTables) error
	Delete(id uint) error
	GetAll(outletID uint, status string) ([]model.DiningTables, error)
	GetByID(id uint) (*model.DiningTables, error)
}

type diningTableRepository struct {
	db *gorm.DB
}

func NewDiningTableRepository(db *gorm.DB) DiningTableRepository {
	return &diningTableRepository{db}
}

func (r *diningTableRepository) Create(table *model.DiningTables) error {
	return r.db.Create(table).Error
}

func (r *diningTableRepository) Update(table *model.DiningTables) error {
	return r.db.Save(table).Error
}

func (r *diningTableRepository) Delete(id uint) error {
	return r.db.Delete(&model.DiningTables{}, id).Error
}

func (r *diningTableRepository) GetAll(outletID uint, status string) ([]model.DiningTables, error) {
	var data []model.DiningTables
	query := r.db.Preload("Outlet")

	if outletID > 0 {
		query = query.Where("outlet_id = ?", outletID)
	}
	if status != "" {
		query = query.Where("status_table = ?", status)
	}

	err := query.Order("id_dining_table DESC").Find(&data).Error
	return data, err
}

func (r *diningTableRepository) GetByID(id uint) (*model.DiningTables, error) {
	var data model.DiningTables
	err := r.db.Preload("Outlet").First(&data, "id_dining_table = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}
