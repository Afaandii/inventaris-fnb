package roles

import (
	"backend/internal/shared/model"

	"gorm.io/gorm"
)

type RoleRepository interface {
	FindAll() ([]model.Roles, error)
	FindById(id uint) (*model.Roles, error)
	Create(role *model.Roles) error
	Update(role *model.Roles) error
	Delete(id uint) error
}

type roleRepository struct {
	db *gorm.DB
}

func NewRoleRepository(db *gorm.DB) RoleRepository {
	return &roleRepository{db}
}

func (req *roleRepository) FindAll() ([]model.Roles, error) {
	var data []model.Roles
	err := req.db.Find(&data).Error
	return data, err
}

func (req *roleRepository) FindById(id uint) (*model.Roles, error) {
	var data model.Roles
	err := req.db.First(&data, "id_role=?", id).Error
	if err != nil {
		return nil, err
	}
	return &data, err
}

func (req *roleRepository) Create(role *model.Roles) error {
	return req.db.Transaction(func(tx *gorm.DB) error {
		err := tx.Create(role).Error
		if err != nil {
			return nil
		}
		return nil
	})
}

func (req *roleRepository) Update(role *model.Roles) error {
	return req.db.Transaction(func(tx *gorm.DB) error {
		err := tx.Save(role).Error
		if err != nil {
			return nil
		}
		return nil
	})
}

func (req *roleRepository) Delete(id uint) error {
	return req.db.Delete(&model.Roles{}, "id_role=?", id).Error
}
