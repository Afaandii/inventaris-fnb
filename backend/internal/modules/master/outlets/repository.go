package outlets

import (
	"backend/internal/shared/model"
	"time"

	"gorm.io/gorm"
)

type OutletRepository interface {
	GetAll() ([]model.Outlets, error)
	GetById(id uint) (*model.Outlets, error)
	Create(out *model.Outlets) error
	Update(out *model.Outlets) error
	Delete(id uint) error
	CountTodayOutlets() (int64, error)
}

type outletRepository struct {
	db *gorm.DB
}

func NewOutletRepository(db *gorm.DB) OutletRepository {
	return &outletRepository{db}
}

func (req *outletRepository) GetAll() ([]model.Outlets, error) {
	var data []model.Outlets
	err := req.db.Find(&data).Error
	if err != nil {
		return nil, err
	}

	return data, err
}

func (req *outletRepository) GetById(id uint) (*model.Outlets, error) {
	var data model.Outlets
	err := req.db.First(&data, "id_outlet=?", id).Error
	if err != nil {
		return nil, err
	}

	return &data, err
}

func (req *outletRepository) Create(out *model.Outlets) error {
	return req.db.Transaction(func(tx *gorm.DB) error {
		err := tx.Create(out).Error
		if err != nil {
			return nil
		}
		return nil
	})
}

func (req *outletRepository) Update(out *model.Outlets) error {
	return req.db.Transaction(func(tx *gorm.DB) error {
		err := tx.Save(out).Error
		if err != nil {
			return nil
		}
		return nil
	})
}

func (req *outletRepository) Delete(id uint) error {
	return req.db.Delete(&model.Outlets{}, "id_outlet=?", id).Error
}

func (req *outletRepository) CountTodayOutlets() (int64, error) {
	var count int64
	today := time.Now().Format("2006-01-02")

	// Menghitung data yang dibuat hari ini berdasarkan created_at
	err := req.db.Model(&model.Outlets{}).
		Where("DATE(created_at) = ?", today).
		Count(&count).Error

	return count, err
}
