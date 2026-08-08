package units

import (
	"backend/internal/shared/model"
	"backend/pkg/helper"
)

type ServiceUnit interface {
	GetAll() ([]model.Units, error)
	GetById(id_unit uint) (*model.Units, error)
	Create(unit_name, types, short_name string, is_active bool) (*model.Units, error)
	Update(id_unit uint, unit_name, types, short_name string, is_active bool) (*model.Units, error)
	Delete(id_unit uint) error
}

type serviceUnit struct {
	repo UnitRepository
}

func NewUnitService(repo UnitRepository) ServiceUnit {
	return &serviceUnit{repo}
}

func (us *serviceUnit) GetAll() ([]model.Units, error) {
	return us.repo.GetAll()
}

func (us *serviceUnit) GetById(id_unit uint) (*model.Units, error) {
	return us.repo.GetById(uint(id_unit))
}

func (us *serviceUnit) Create(unit_name, types, short_name string, is_active bool) (*model.Units, error) {
	count, err := us.repo.CountTodayUnits()
	if err != nil {
		return nil, err
	}

	generatedCode := helper.GenerateCodeUnits(int(count))

	unt := &model.Units{
		UnitCode:  generatedCode,
		UnitName:  unit_name,
		Type:      types,
		ShortName: short_name,
		IsActive:  is_active,
	}

	err = us.repo.Create(unt)

	return unt, err
}

func (us *serviceUnit) Update(id_unit uint, unit_name, types, short_name string, is_active bool) (*model.Units, error) {
	unt, err := us.repo.GetById(uint(id_unit))
	if err != nil {
		return nil, err
	}

	count, err := us.repo.CountTodayUnits()
	if err != nil {
		return nil, err
	}

	generatedCode := helper.GenerateCodeUnits(int(count))

	unt.UnitCode = generatedCode
	unt.UnitName = unit_name
	unt.Type = types
	unt.ShortName = short_name
	unt.IsActive = is_active

	err = us.repo.Update(unt)

	return unt, err
}

func (us *serviceUnit) Delete(id_unit uint) error {
	return us.repo.Delete(id_unit)
}
