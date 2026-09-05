package diningtables

import (
	"backend/internal/shared/model"
	"errors"

	"gorm.io/gorm"
)

type CreateDiningTableInput struct {
	OutletID    uint   `json:"outlet_id" validate:"required,number,min=1"`
	Name        string `json:"name" validate:"required,min=1"`
	Capacity    int    `json:"capacity" validate:"required,number,min=1"`
	StatusTable string `json:"status_table" validate:"omitempty,oneof=available reserved occupied cleaning inactive"`
}

type UpdateDiningTableInput struct {
	OutletID    uint   `json:"outlet_id" validate:"required,number,min=1"`
	Name        string `json:"name" validate:"required,min=1"`
	Capacity    int    `json:"capacity" validate:"required,number,min=1"`
	StatusTable string `json:"status_table" validate:"required,oneof=available reserved occupied cleaning inactive"`
}

type DiningTableService interface {
	GetAll(outletID uint, status string) ([]model.DiningTables, error)
	GetByID(id uint) (*model.DiningTables, error)
	Create(input CreateDiningTableInput) (*model.DiningTables, error)
	Update(id uint, input UpdateDiningTableInput) (*model.DiningTables, error)
	Delete(id uint) error
}

type diningTableService struct {
	db   *gorm.DB
	repo DiningTableRepository
}

func NewDiningTableService(db *gorm.DB, repo DiningTableRepository) DiningTableService {
	return &diningTableService{db, repo}
}

func (s *diningTableService) GetAll(outletID uint, status string) ([]model.DiningTables, error) {
	return s.repo.GetAll(outletID, status)
}

func (s *diningTableService) GetByID(id uint) (*model.DiningTables, error) {
	return s.repo.GetByID(id)
}

func (s *diningTableService) Create(input CreateDiningTableInput) (*model.DiningTables, error) {
	var outlet model.Outlets
	if err := s.db.First(&outlet, "id_outlet = ?", input.OutletID).Error; err != nil {
		return nil, errors.New("outlet tidak ditemukan di master data")
	}

	statusTable := "available"
	if input.StatusTable != "" {
		statusTable = input.StatusTable
	}

	table := &model.DiningTables{
		OutletRef:   input.OutletID,
		Name:        input.Name,
		Capacity:    input.Capacity,
		StatusTable: statusTable,
	}

	if err := s.repo.Create(table); err != nil {
		return nil, err
	}

	return s.repo.GetByID(table.IDDiningTable)
}

func (s *diningTableService) Update(id uint, input UpdateDiningTableInput) (*model.DiningTables, error) {
	table, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if table == nil {
		return nil, errors.New("data meja tidak ditemukan")
	}

	var outlet model.Outlets
	if err := s.db.First(&outlet, "id_outlet = ?", input.OutletID).Error; err != nil {
		return nil, errors.New("outlet tidak ditemukan di master data")
	}

	table.OutletRef = input.OutletID
	table.Name = input.Name
	table.Capacity = input.Capacity
	table.StatusTable = input.StatusTable

	if err := s.repo.Update(table); err != nil {
		return nil, err
	}

	return s.repo.GetByID(table.IDDiningTable)
}

func (s *diningTableService) Delete(id uint) error {
	table, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	if table == nil {
		return errors.New("data meja tidak ditemukan")
	}

	return s.repo.Delete(id)
}
