package units

import (
	"backend/internal/shared/model"
	"time"

	"gorm.io/gorm"
)

type UnitRepository interface {
	GetAll() ([]model.Units, error)
	GetById(id_unit uint) (*model.Units, error)
	Create(units *model.Units) error
	Update(units *model.Units) error
	Delete(id_unit uint) error
	CountTodayUnits() (int64, error)
}

type unitRepository struct {
	db *gorm.DB
}

func NewUnitRepository(db *gorm.DB) UnitRepository {
	return &unitRepository{db}
}

func (req *unitRepository) GetAll() ([]model.Units, error) {
	var data []model.Units
	err := req.db.Find(&data).Error

	return data, err
}

func (req *unitRepository) GetById(id_unit uint) (*model.Units, error) {
	var data model.Units
	err := req.db.First(&data, "id_unit=?", id_unit).Error
	if err != nil {
		return nil, err
	}

	return &data, err
}

func (req *unitRepository) Create(unit *model.Units) error {
	return req.db.Transaction(func(tx *gorm.DB) error {
		err := tx.Create(unit).Error
		if err != nil {
			return nil
		}

		return nil
	})
}

func (req *unitRepository) Update(unit *model.Units) error {
	return req.db.Transaction(func(tx *gorm.DB) error {
		err := tx.Save(unit).Error
		if err != nil {
			return nil
		}

		return nil
	})
}

func (req *unitRepository) Delete(id_unit uint) error {
	return req.db.Delete(&model.Units{}, "id_unit=?", id_unit).Error
}

func (req *unitRepository) CountTodayUnits() (int64, error) {
	var count int64
	today := time.Now().Format("2006-01-02")

	err := req.db.Model(&model.Units{}).Where("DATE(created_at)=?", today).Count(&count).Error

	return count, err
}
