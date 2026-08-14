package wirehouses

import (
	"backend/internal/shared/model"
	"backend/pkg/helper"
)

type ServiceWirehouse interface {
	GetAll() ([]model.Wirehouse, error)
	GetById(id_wire uint) (*model.Wirehouse, error)
	Create(outlet_id, manager_id uint, wirehouse_name, address, city, phone_number, types, status string) (*model.Wirehouse, error)
	Update(id_wire, outlet_id, manager_id uint, wirehouse_name, address, city, phone_number, types, status string) (*model.Wirehouse, error)
	Delete(id_wire uint) error
}

type serviceWirehouse struct {
	repo WirehouseRepository
}

func NewWirehouseService(repo WirehouseRepository) ServiceWirehouse {
	return &serviceWirehouse{repo}
}

func (ws *serviceWirehouse) GetAll() ([]model.Wirehouse, error) {
	return ws.repo.GetAll()
}

func (ws *serviceWirehouse) GetById(id_wire uint) (*model.Wirehouse, error) {
	return ws.repo.GetById(uint(id_wire))
}

func (ws *serviceWirehouse) Create(outlet_id, manager_id uint, wirehouse_name, address, city, phone_number, types, status string) (*model.Wirehouse, error) {
	count, err := ws.repo.CountTodayWirehouses()
	if err != nil {
		return nil, err
	}

	generated := helper.GenerateCodeWirehouse(int(count))

	wire := &model.Wirehouse{
		OutletRef:     outlet_id,
		ManagerRef:    &manager_id,
		WirehouseCode: generated,
		WirehouseName: wirehouse_name,
		Address:       address,
		City:          city,
		PhoneNumber:   &phone_number,
		Type:          types,
		Status:        status,
	}

	err = ws.repo.Create(wire)

	return wire, err
}

func (ws *serviceWirehouse) Update(id_wire uint, outlet_id, manager_id uint, wirehouse_name, address, city, phone_number, types, status string) (*model.Wirehouse, error) {
	wire, err := ws.repo.GetById(id_wire)
	if err != nil {
		return nil, err
	}

	count, err := ws.repo.CountTodayWirehouses()
	if err != nil {
		return nil, err
	}

	generated := helper.GenerateCodeWirehouse(int(count))

	wire.OutletRef = outlet_id
	wire.ManagerRef = &manager_id
	wire.WirehouseCode = generated
	wire.WirehouseName = wirehouse_name
	wire.Address = address
	wire.PhoneNumber = &phone_number
	wire.Type = types
	wire.Status = status

	err = ws.repo.Update(wire)

	return wire, err
}

func (ws *serviceWirehouse) Delete(id_wire uint) error {
	return ws.repo.Delete(uint(id_wire))
}
