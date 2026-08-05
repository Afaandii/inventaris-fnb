package outlets

import (
	"backend/internal/shared/model"

	"gorm.io/datatypes"
)

type OutletService interface {
	GetAll() ([]model.Outlets, error)
	GetById(id_outlet uint) (*model.Outlets, error)
	Create(outlet_code, outlet_name, address, city string, opening_hours, closing_hours datatypes.Time, phone_number, status_outlet string) (*model.Outlets, error)
	Update(id_outlet uint, outlet_code, outlet_name, address, city string, opening_hours, closing_hours datatypes.Time, phone_number, status_outlet string) (*model.Outlets, error)
	Delete(id_outlet uint) error
}

type outletService struct {
	repo OutletRepository
}

func NewServiceOutlet(repo OutletRepository) OutletService {
	return &outletService{repo}
}

func (so *outletService) GetAll() ([]model.Outlets, error) {
	return so.repo.GetAll()
}

func (so *outletService) GetById(id_outlet uint) (*model.Outlets, error) {
	return so.repo.GetById(id_outlet)
}

func (so *outletService) Create(outlet_code, outlet_name, address, city string, opening_hours, closing_hours datatypes.Time, phone_number, status_outlet string) (*model.Outlets, error) {
	out := &model.Outlets{
		OutletCode:   outlet_code,
		OutletName:   outlet_name,
		Address:      address,
		City:         city,
		OpeningHours: opening_hours,
		ClosingHours: closing_hours,
		PhoneNumber:  &phone_number,
		StatusOutlet: status_outlet,
	}

	err := so.repo.Create(out)

	return out, err
}

func (so *outletService) Update(id_outlet uint, outlet_code, outlet_name, address, city string, opening_hours, closing_hours datatypes.Time, phone_number, status_outlet string) (*model.Outlets, error) {
	out, err := so.repo.GetById(id_outlet)
	if err != nil {
		return nil, err
	}

	out.OutletCode = outlet_code
	out.OutletName = outlet_name
	out.Address = address
	out.City = city
	out.OpeningHours = opening_hours
	out.ClosingHours = closing_hours
	out.PhoneNumber = &phone_number
	out.StatusOutlet = status_outlet

	err = so.repo.Update(out)

	return out, err
}

func (so *outletService) Delete(id_outlet uint) error {
	return so.repo.Delete(id_outlet)
}
