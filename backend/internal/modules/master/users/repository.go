package users

import (
	"backend/internal/shared/model"

	"gorm.io/gorm"
)

type UserRepository interface {
	FindAll() ([]model.Users, error)
	FindById(id_usr uint) (*model.Users, error)
	Create(usr *model.Users) error
	Update(usr *model.Users) error
	Delete(id_usr uint) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db}
}

func (req *userRepository) FindAll() ([]model.Users, error) {
	var data []model.Users
	err := req.db.Find(&data).Error

	return data, err
}

func (req *userRepository) FindById(id_usr uint) (*model.Users, error) {
	var data model.Users
	err := req.db.First(&data, "id_user = ?", id_usr).Error
	if err != nil {
		return nil, err
	}

	return &data, err
}

func (req *userRepository) Create(usr *model.Users) error {
	return req.db.Transaction(func(tx *gorm.DB) error {
		err := tx.Create(usr).Error
		if err != nil {
			return nil
		}

		return nil
	})
}

func (req *userRepository) Update(usr *model.Users) error {
	return req.db.Transaction(func(tx *gorm.DB) error {
		err := tx.Save(usr).Error
		if err != nil {
			return nil
		}

		return nil
	})
}

func (req *userRepository) Delete(id_usr uint) error {
	return req.db.Delete(&model.Users{}, "id_user = ?", id_usr).Error
}
