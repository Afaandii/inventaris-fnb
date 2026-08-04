package suppliers

import (
	"backend/internal/shared/model"

	"gorm.io/gorm"
)

type SupplierRepository interface {
	GetAll() ([]model.Suppliers, error)
	GetById(id uint) (*model.Suppliers, error)
	Create(supplier *model.Suppliers) error
	Update(supplier *model.Suppliers) error
	Delete(id uint) error
}

type supplierRepository struct {
	db *gorm.DB
}

func NewSupplierRepository(db *gorm.DB) SupplierRepository {
	return &supplierRepository{db}
}

func (req *supplierRepository) GetAll() ([]model.Suppliers, error) {
	var data []model.Suppliers
	err := req.db.Find(&data).Error
	return data, err
}

func (req *supplierRepository) GetById(id uint) (*model.Suppliers, error) {
	var data model.Suppliers
	err := req.db.First(&data, "id_supplier=?", id).Error
	if err != nil {
		return nil, err
	}

	return &data, err
}

func (req *supplierRepository) Create(supplier *model.Suppliers) error {
	return req.db.Create(supplier).Error
}

func (req *supplierRepository) Update(supplier *model.Suppliers) error {
	return req.db.Save(supplier).Error
}

func (req *supplierRepository) Delete(id uint) error {
	return req.db.Delete(&model.Suppliers{}, "id_supplier=?", id).Error
}
