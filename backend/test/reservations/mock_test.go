package reservations_test

import (
	diningtables "backend/internal/modules/reservations/dining_tables"
	"backend/internal/modules/reservations/reservation"
	"backend/internal/shared/model"
	"time"

	"gorm.io/datatypes"
)

// ========================
// MOCK DINING TABLES SERVICE
// ========================

type MockDiningTableService struct {
	Tables []model.DiningTables
	Err    error
}

func (m *MockDiningTableService) GetAll(outletID uint, status string) ([]model.DiningTables, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	var res []model.DiningTables
	for _, t := range m.Tables {
		if outletID > 0 && t.OutletRef != outletID {
			continue
		}
		if status != "" && t.StatusTable != status {
			continue
		}
		res = append(res, t)
	}
	return res, nil
}

func (m *MockDiningTableService) GetByID(id uint) (*model.DiningTables, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, t := range m.Tables {
		if t.IDDiningTable == id {
			return &t, nil
		}
	}
	return nil, nil
}

func (m *MockDiningTableService) Create(input diningtables.CreateDiningTableInput) (*model.DiningTables, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	status := "available"
	if input.StatusTable != "" {
		status = input.StatusTable
	}
	t := &model.DiningTables{
		IDDiningTable: 1,
		OutletRef:     input.OutletID,
		Name:          input.Name,
		Capacity:      input.Capacity,
		StatusTable:   status,
	}
	return t, nil
}

func (m *MockDiningTableService) Update(id uint, input diningtables.UpdateDiningTableInput) (*model.DiningTables, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return &model.DiningTables{
		IDDiningTable: id,
		OutletRef:     input.OutletID,
		Name:          input.Name,
		Capacity:      input.Capacity,
		StatusTable:   input.StatusTable,
	}, nil
}

func (m *MockDiningTableService) Delete(id uint) error {
	return m.Err
}

// ========================
// MOCK RESERVATIONS SERVICE
// ========================

type MockReservationService struct {
	Reservations []model.Reservations
	AvailTables  []model.DiningTables
	Err          error
}

func (m *MockReservationService) GetAll(outletID, tableID uint, status, dateStr string) ([]model.Reservations, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	var res []model.Reservations
	for _, r := range m.Reservations {
		if outletID > 0 && r.OutletRef != outletID {
			continue
		}
		if tableID > 0 && r.TableRef != tableID {
			continue
		}
		if status != "" && r.StatusReservation != status {
			continue
		}
		res = append(res, r)
	}
	return res, nil
}

func (m *MockReservationService) GetByID(id uint) (*model.Reservations, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, r := range m.Reservations {
		if r.IDReservation == id {
			return &r, nil
		}
	}
	return nil, nil
}

func (m *MockReservationService) GetAvailableTables(outletID uint, dateStr, timeStr string, guestCount int) ([]model.DiningTables, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.AvailTables, nil
}

func (m *MockReservationService) Create(input reservation.CreateReservationInput) (*model.Reservations, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	parsedDate, _ := time.Parse("2006-01-02", input.ReservationDate)
	rsv := &model.Reservations{
		IDReservation:     1,
		OutletRef:         input.OutletID,
		TableRef:          input.TableID,
		CreatedBy:         input.CreatedBy,
		ReservationCode:   "RSV-20261026-001",
		CustName:          input.CustName,
		CustPhone:         input.CustPhone,
		ReservationDate:   parsedDate,
		ReservationTime:   datatypes.NewTime(19, 0, 0, 0),
		NumberOfGuest:     input.NumberOfGuest,
		SpecialRequest:    input.SpecialRequest,
		StatusReservation: "pending",
	}
	return rsv, nil
}

func (m *MockReservationService) Update(id uint, input reservation.UpdateReservationInput) (*model.Reservations, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	parsedDate, _ := time.Parse("2006-01-02", input.ReservationDate)
	return &model.Reservations{
		IDReservation:     id,
		OutletRef:         input.OutletID,
		TableRef:          input.TableID,
		CustName:          input.CustName,
		CustPhone:         input.CustPhone,
		ReservationDate:   parsedDate,
		ReservationTime:   datatypes.NewTime(19, 0, 0, 0),
		NumberOfGuest:     input.NumberOfGuest,
		SpecialRequest:    input.SpecialRequest,
		StatusReservation: "pending",
	}, nil
}

func (m *MockReservationService) UpdateStatus(id uint, status string, userID uint) (*model.Reservations, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for i, r := range m.Reservations {
		if r.IDReservation == id {
			m.Reservations[i].StatusReservation = status
			return &m.Reservations[i], nil
		}
	}
	return &model.Reservations{
		IDReservation:     id,
		StatusReservation: status,
	}, nil
}
