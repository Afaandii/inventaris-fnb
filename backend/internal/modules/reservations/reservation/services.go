package reservation

import (
	"backend/internal/shared/model"
	"backend/pkg/helper"
	"errors"
	"fmt"
	"strings"
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type CreateReservationInput struct {
	OutletID        uint   `json:"outlet_id" validate:"required,number,min=1"`
	TableID         uint   `json:"table_id" validate:"required,number,min=1"`
	CreatedBy       uint   `json:"created_by" validate:"required,number,min=1"`
	CustName        string `json:"customer_name" validate:"required,min=2"`
	CustPhone       string `json:"customer_phone" validate:"required,min=5"`
	ReservationDate string `json:"reservation_date" validate:"required"`
	ReservationTime string `json:"reservation_time" validate:"required"`
	NumberOfGuest   int    `json:"number_of_guest" validate:"required,number,min=1"`
	SpecialRequest  string `json:"special_request"`
}

type UpdateReservationInput struct {
	OutletID        uint   `json:"outlet_id" validate:"required,number,min=1"`
	TableID         uint   `json:"table_id" validate:"required,number,min=1"`
	CustName        string `json:"customer_name" validate:"required,min=2"`
	CustPhone       string `json:"customer_phone" validate:"required,min=5"`
	ReservationDate string `json:"reservation_date" validate:"required"`
	ReservationTime string `json:"reservation_time" validate:"required"`
	NumberOfGuest   int    `json:"number_of_guest" validate:"required,number,min=1"`
	SpecialRequest  string `json:"special_request"`
}

type ReservationService interface {
	GetAll(outletID, tableID uint, status, dateStr string) ([]model.Reservations, error)
	GetByID(id uint) (*model.Reservations, error)
	GetAvailableTables(outletID uint, dateStr, timeStr string, guestCount int) ([]model.DiningTables, error)
	Create(input CreateReservationInput) (*model.Reservations, error)
	Update(id uint, input UpdateReservationInput) (*model.Reservations, error)
	UpdateStatus(id uint, status string, userID uint) (*model.Reservations, error)
}

type reservationService struct {
	db   *gorm.DB
	repo ReservationRepository
}

func NewReservationService(db *gorm.DB, repo ReservationRepository) ReservationService {
	return &reservationService{db, repo}
}

func formatTimeStr(tStr string) datatypes.Time {
	tStr = strings.TrimSpace(tStr)

	var h, m, s int

	if len(tStr) == 5 {
		fmt.Sscan(tStr, "%d:%d", &h, &m)
	} else {
		fmt.Sscanf(tStr, "%d:%d:%d", &h, &m, &s)
	}

	return datatypes.NewTime(h, m, s, 0)
}

func (s *reservationService) GetAll(outletID, tableID uint, status, dateStr string) ([]model.Reservations, error) {
	return s.repo.GetAll(outletID, tableID, status, dateStr)
}

func (s *reservationService) GetByID(id uint) (*model.Reservations, error) {
	return s.repo.GetByID(id)
}

func (s *reservationService) GetAvailableTables(outletID uint, dateStr, timeStr string, guestCount int) ([]model.DiningTables, error) {
	var outlet model.Outlets
	if err := s.db.First(&outlet, "id_outlet = ?", outletID).Error; err != nil {
		return nil, errors.New("outlet tidak ditemukan di master data")
	}

	formattedTime := formatTimeStr(timeStr)
	return s.repo.GetAvailableTables(outletID, dateStr, formattedTime.String(), guestCount)
}

func (s *reservationService) Create(input CreateReservationInput) (*model.Reservations, error) {
	var outlet model.Outlets
	if err := s.db.First(&outlet, "id_outlet = ?", input.OutletID).Error; err != nil {
		return nil, errors.New("outlet tidak ditemukan di master data")
	}

	var table model.DiningTables
	if err := s.db.First(&table, "id_dining_table = ?", input.TableID).Error; err != nil {
		return nil, errors.New("meja tidak ditemukan")
	}

	// Validasi 1: Meja harus berasal dari Outlet yang dipilih
	if table.OutletRef != input.OutletID {
		return nil, fmt.Errorf("meja '%s' tidak terdaftar pada outlet '%s'", table.Name, outlet.OutletName)
	}

	// Validasi 2: Kapasitas meja mencukupi
	if input.NumberOfGuest > table.Capacity {
		return nil, fmt.Errorf("kapasitas meja tidak mencukupi (Jumlah Tamu: %d, Kapasitas Meja '%s': %d)", input.NumberOfGuest, table.Name, table.Capacity)
	}

	parsedDate, err := time.Parse("2006-01-02", input.ReservationDate)
	if err != nil {
		return nil, errors.New("format reservation_date tidak valid (gunakan format YYYY-MM-DD)")
	}

	formattedTime := formatTimeStr(input.ReservationTime)

	// Validasi 3: Double Booking Prevention
	isBooked, err := s.repo.CheckDoubleBookingWithTx(s.db, input.TableID, input.ReservationDate, formattedTime.String(), 0)
	if err != nil {
		return nil, err
	}
	if isBooked {
		return nil, fmt.Errorf("meja '%s' sudah memiliki reservasi aktif pada tanggal %s jam %s!", table.Name, input.ReservationDate, formattedTime)
	}

	count, err := s.repo.CountTodayReservations()
	if err != nil {
		return nil, err
	}
	rsvCode := helper.GenerateCodeReservation(int(count))

	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	rsv := &model.Reservations{
		OutletRef:         input.OutletID,
		TableRef:          input.TableID,
		CreatedBy:         input.CreatedBy,
		ReservationCode:   rsvCode,
		CustName:          input.CustName,
		CustPhone:         input.CustPhone,
		ReservationDate:   parsedDate,
		ReservationTime:   datatypes.Time(formattedTime),
		NumberOfGuest:     input.NumberOfGuest,
		SpecialRequest:    input.SpecialRequest,
		StatusReservation: "pending",
	}

	if err := s.repo.CreateWithTx(tx, rsv); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.repo.GetByID(rsv.IDReservation)
}

func (s *reservationService) Update(id uint, input UpdateReservationInput) (*model.Reservations, error) {
	rsv, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if rsv == nil {
		return nil, errors.New("data reservasi tidak ditemukan")
	}

	if rsv.StatusReservation == "completed" || rsv.StatusReservation == "cancelled" || rsv.StatusReservation == "no_show" {
		return nil, fmt.Errorf("reservasi berstatus %s tidak dapat diubah lagi", rsv.StatusReservation)
	}

	var outlet model.Outlets
	if err := s.db.First(&outlet, "id_outlet = ?", input.OutletID).Error; err != nil {
		return nil, errors.New("outlet tidak ditemukan di master data")
	}

	var table model.DiningTables
	if err := s.db.First(&table, "id_dining_table = ?", input.TableID).Error; err != nil {
		return nil, errors.New("meja tidak ditemukan")
	}

	if table.OutletRef != input.OutletID {
		return nil, fmt.Errorf("meja '%s' tidak terdaftar pada outlet '%s'", table.Name, outlet.OutletName)
	}

	if input.NumberOfGuest > table.Capacity {
		return nil, fmt.Errorf("kapasitas meja tidak mencukupi (Jumlah Tamu: %d, Kapasitas Meja '%s': %d)", input.NumberOfGuest, table.Name, table.Capacity)
	}

	parsedDate, err := time.Parse("2006-01-02", input.ReservationDate)
	if err != nil {
		return nil, errors.New("format reservation_date tidak valid (gunakan format YYYY-MM-DD)")
	}

	formattedTime := formatTimeStr(input.ReservationTime)

	isBooked, err := s.repo.CheckDoubleBookingWithTx(s.db, input.TableID, input.ReservationDate, formattedTime.String(), id)
	if err != nil {
		return nil, err
	}
	if isBooked {
		return nil, fmt.Errorf("meja '%s' sudah memiliki reservasi aktif pada tanggal %s jam %s!", table.Name, input.ReservationDate, formattedTime)
	}

	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	rsv.OutletRef = input.OutletID
	rsv.TableRef = input.TableID
	rsv.CustName = input.CustName
	rsv.CustPhone = input.CustPhone
	rsv.ReservationDate = parsedDate
	rsv.ReservationTime = datatypes.Time(formattedTime)
	rsv.NumberOfGuest = input.NumberOfGuest
	rsv.SpecialRequest = input.SpecialRequest

	if err := s.repo.UpdateWithTx(tx, rsv); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.repo.GetByID(rsv.IDReservation)
}

func (s *reservationService) UpdateStatus(id uint, status string, userID uint) (*model.Reservations, error) {
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	rsv, err := s.repo.GetByIDWithTx(tx, id)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	if rsv == nil {
		tx.Rollback()
		return nil, errors.New("data reservasi tidak ditemukan")
	}

	var table model.DiningTables
	if err := tx.First(&table, "id_dining_table = ?", rsv.TableRef).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("meja tidak ditemukan")
	}

	switch status {
	case "pending":
		rsv.StatusReservation = "pending"

	case "confirmed":
		rsv.StatusReservation = "confirmed"
		table.StatusTable = "reserved"

	case "seated":
		rsv.StatusReservation = "seated"
		table.StatusTable = "occupied"

	case "completed":
		rsv.StatusReservation = "completed"
		table.StatusTable = "available"

	case "cancelled":
		rsv.StatusReservation = "cancelled"
		if table.StatusTable == "reserved" || table.StatusTable == "occupied" {
			table.StatusTable = "available"
		}

	case "no_show":
		rsv.StatusReservation = "no_show"
		if table.StatusTable == "reserved" || table.StatusTable == "occupied" {
			table.StatusTable = "available"
		}

	default:
		tx.Rollback()
		return nil, fmt.Errorf("status reservasi tidak valid: %s", status)
	}

	if err := tx.Save(&table).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := s.repo.UpdateWithTx(tx, rsv); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.repo.GetByID(rsv.IDReservation)
}
