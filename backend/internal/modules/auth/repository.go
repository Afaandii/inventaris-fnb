package auth

import (
	"backend/internal/shared/model"
	"time"

	"gorm.io/gorm"
)

type AuthRepository interface {
	FindByEmail(email string) (*model.Users, error)
	FindByID(id uint) (*model.Users, error)
	UpdateLastLogin(id uint, t time.Time) error
}

type authRepository struct {
	db *gorm.DB
}

func NewAuthRepository(db *gorm.DB) AuthRepository {
	return &authRepository{db}
}

func (r *authRepository) FindByEmail(email string) (*model.Users, error) {
	var user model.Users
	err := r.db.Preload("Role").Where("LOWER(email) = LOWER(?)", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *authRepository) FindByID(id uint) (*model.Users, error) {
	var user model.Users
	err := r.db.Preload("Role").Where("id_user = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *authRepository) UpdateLastLogin(id uint, t time.Time) error {
	return r.db.Model(&model.Users{}).Where("id_user = ?", id).Update("last_login", t).Error
}
