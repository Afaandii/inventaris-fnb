package roles

import "backend/internal/shared/model"

type ServiceRole interface {
	GetAll() ([]model.Roles, error)
	GetById(id uint) (*model.Roles, error)
	Create(role_name, display_name, description string) (*model.Roles, error)
	Update(id_role uint, role_name, display_name, description string) (*model.Roles, error)
	Delete(id uint) error
}

type serviceRole struct {
	repo RoleRepository
}

func NewServiceRole(repo RoleRepository) ServiceRole {
	return &serviceRole{repo}
}

func (sr *serviceRole) GetAll() ([]model.Roles, error) {
	return sr.repo.FindAll()
}

func (sr *serviceRole) GetById(id_role uint) (*model.Roles, error) {
	return sr.repo.FindById(id_role)
}

func (sr *serviceRole) Create(role_name, display_name, description string) (*model.Roles, error) {
	role := &model.Roles{
		RoleName:    role_name,
		DisplayName: display_name,
		Description: &description,
	}

	err := sr.repo.Create(role)
	return role, err
}

func (sr *serviceRole) Update(id_role uint, role_name, display_name, description string) (*model.Roles, error) {
	role, err := sr.repo.FindById(id_role)
	if err != nil {
		return nil, err
	}

	role.RoleName = role_name
	role.DisplayName = display_name
	role.Description = &description

	err = sr.repo.Update(role)
	return role, err
}

func (sr *serviceRole) Delete(id uint) error {
	return sr.repo.Delete(id)
}
