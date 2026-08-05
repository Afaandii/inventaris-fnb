package outlets

import (
	"backend/internal/shared/model"

	"gorm.io/gorm"
)

type OutletRepository interface {
	GetAll() ([]model.Outlets, error)
	GetById(id uint) (*model.Outlets, error)
	Create(out *model.Outlets) error
	Update(out *model.Outlets) error
	Delete(id uint) error
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
	return req.db.Create(out).Error
}

func (req *outletRepository) Update(out *model.Outlets) error {
	return req.db.Save(out).Error
}

func (req *outletRepository) Delete(id uint) error {
	return req.db.Delete(&model.Outlets{}, "id_outlet=?", id).Error
}
