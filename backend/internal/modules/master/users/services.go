package users

import (
	"backend/internal/shared/model"
	"time"
)

type ServiceUser interface {
	GetAll() ([]model.Users, error)
	GetById(id_usr uint) (*model.Users, error)
	Create(role_id, outlet_id uint, name, username, email, password, phone_number string, last_login time.Time, avatar, status string, is_active bool) (*model.Users, error)
	Update(id_user, role_id, outlet_id uint, name, username, email, password, phone_number string, last_login time.Time, avatar, status string, is_active bool) (*model.Users, error)
	Delete(id_user uint) error
}

type serviceUser struct {
	repo UserRepository
}

func NewServiceUser(repo UserRepository) ServiceUser {
	return &serviceUser{repo}
}

func (us *serviceUser) GetAll() ([]model.Users, error) {
	return us.repo.FindAll()
}

func (us *serviceUser) GetById(id_user uint) (*model.Users, error) {
	return us.repo.FindById(id_user)
}

func (us *serviceUser) Create(role_id, outlet_id uint, name, username, email, password, phone_number string, last_login time.Time, avatar, status string, is_active bool) (*model.Users, error) {
	usr := &model.Users{
		RoleRef:     role_id,
		OutletRef:   &outlet_id,
		Name:        name,
		Username:    username,
		Email:       email,
		Password:    password,
		PhoneNumber: &phone_number,
		LastLogin:   &last_login,
		Avatar:      &avatar,
		Status:      status,
		IsActive:    &is_active,
	}

	err := us.repo.Create(usr)

	return usr, err
}

func (us *serviceUser) Update(id_user uint, role_id, outlet_id uint, name, username, email, password, phone_number string, last_login time.Time, avatar, status string, is_active bool) (*model.Users, error) {
	usr, err := us.repo.FindById(id_user)
	if err != nil {
		return nil, err
	}

	usr.RoleRef = role_id
	usr.OutletRef = &outlet_id
	usr.Name = name
	usr.Username = username
	usr.Email = email
	usr.Password = password
	usr.PhoneNumber = &phone_number
	usr.LastLogin = &last_login
	usr.Avatar = &avatar
	usr.Status = status
	usr.IsActive = &is_active

	err = us.repo.Update(usr)

	return usr, err
}

func (us *serviceUser) Delete(id_user uint) error {
	return us.repo.Delete(id_user)
}
