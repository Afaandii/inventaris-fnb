package suppliers

import (
	"backend/internal/shared/model"
	"time"

	"gorm.io/gorm"
)

type SupplierRepository interface {
	GetAll() ([]model.Suppliers, error)
	GetById(id uint) (*model.Suppliers, error)
	Create(supplier *model.Suppliers) error
	Update(supplier *model.Suppliers) error
	Delete(id uint) error
	CountTodaySuppliers() (int64, error)
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
	return req.db.Transaction(func(tx *gorm.DB) error {
		err := tx.Create(supplier).Error
		if err != nil {
			return nil
		}

		return nil
	})
}

func (req *supplierRepository) Update(supplier *model.Suppliers) error {
	return req.db.Transaction(func(tx *gorm.DB) error {
		err := tx.Save(supplier).Error
		if err != nil {
			return nil
		}

		return nil
	})
}

func (req *supplierRepository) Delete(id uint) error {
	return req.db.Delete(&model.Suppliers{}, "id_supplier=?", id).Error
}

// generate code barang otomatis
func (req *supplierRepository) CountTodaySuppliers() (int64, error) {
	var count int64
	today := time.Now().Format("2006-01-02")

	err := req.db.Model(&model.Outlets{}).
		Where("DATE(created_at) = ?", today).
		Count(&count).Error

	return count, err
}
