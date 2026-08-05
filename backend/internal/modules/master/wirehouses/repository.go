package wirehouses

import (
	"backend/internal/shared/model"

	"gorm.io/gorm"
)

type WirehouseRepository interface {
	GetAll() ([]model.Wirehouse, error)
	GetById(id_wire uint) (*model.Wirehouse, error)
	Create(wire *model.Wirehouse) error
	Update(wire *model.Wirehouse) error
	Delete(id_wire uint) error
}

type wirehouseRepository struct {
	db *gorm.DB
}

func NewWirehouseRepository(db *gorm.DB) WirehouseRepository {
	return &wirehouseRepository{db}
}

func (req *wirehouseRepository) GetAll() ([]model.Wirehouse, error) {
	var data []model.Wirehouse
	err := req.db.Raw("SELECT * FROM wirehouse").Scan(&data).Error

	return data, err
}

func (req *wirehouseRepository) GetById(id_wire uint) (*model.Wirehouse, error) {
	var data model.Wirehouse
	err := req.db.Where(map[string]interface{}{"id_wirehouse": id_wire}).Find(&data).Error
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
