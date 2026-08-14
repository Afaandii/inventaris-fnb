package wirehouses

import (
	"backend/internal/shared/model"
	"time"

	"gorm.io/gorm"
)

type WirehouseRepository interface {
	GetAll() ([]model.Wirehouse, error)
	GetById(id_wire uint) (*model.Wirehouse, error)
	Create(wire *model.Wirehouse) error
	Update(wire *model.Wirehouse) error
	Delete(id_wire uint) error
	CountTodayWirehouses() (int64, error)
}

type wirehouseRepository struct {
	db *gorm.DB
}

func NewWirehouseRepository(db *gorm.DB) WirehouseRepository {
	return &wirehouseRepository{db}
}

func (req *wirehouseRepository) GetAll() ([]model.Wirehouse, error) {
	var data []model.Wirehouse
	err := req.db.Preload("User", func(slc *gorm.DB) *gorm.DB {
		return slc.Select("id_user", "role_id", "name", "username", "email", "phone_number")
	}).Preload("User.Role", func(db *gorm.DB) *gorm.DB {
		return db.Select("id_role", "role_name", "display_name", "description")
	}).Preload("Outlet", func(db *gorm.DB) *gorm.DB {
		return db.Select("id_outlet", "outlet_code", "outlet_name", "address", "city", "phone_number")
	}).Find(&data).Error

	return data, err
}

func (req *wirehouseRepository) GetById(id_wire uint) (*model.Wirehouse, error) {
	var data model.Wirehouse
	err := req.db.Preload("User", func(db *gorm.DB) *gorm.DB {
		return db.Select("id_user", "role_id", "name", "email", "phone_number")
	}).Preload("User.Role", func(db *gorm.DB) *gorm.DB {
		return db.Select("id_role", "role_name", "display_name", "description")
	}).Preload("Outlet", func(db *gorm.DB) *gorm.DB {
		return db.Select("id_outlet", "outlet_code", "outlet_name", "address", "city", "phone_number")
	}).First(&data, "id_wirehouse = ?", id_wire).Error
	if err != nil {
		return nil, err
	}

	return &data, err
}

func (req *wirehouseRepository) Create(wire *model.Wirehouse) error {
	return req.db.Create(wire).Error
}

func (req *wirehouseRepository) Update(wire *model.Wirehouse) error {
	return req.db.Save(wire).Error
}

func (req *wirehouseRepository) Delete(id_wire uint) error {
	return req.db.Delete(&model.Wirehouse{}, "id_wirehouse=?", id_wire).Error
}

func (req *wirehouseRepository) CountTodayWirehouses() (int64, error) {
	var count int64
	today := time.Now().Format("2006-01-02")

	err := req.db.Model(&model.Wirehouse{}).Where("DATE(created_at)=?", today).Count(&count).Error

	return count, err
}
