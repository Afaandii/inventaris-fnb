package reservation

import (
	"backend/internal/shared/model"
	"errors"
	"time"

	"gorm.io/gorm"
)

type ReservationRepository interface {
	CreateWithTx(tx *gorm.DB, reservation *model.Reservations) error
	UpdateWithTx(tx *gorm.DB, reservation *model.Reservations) error
	GetAll(outletID, tableID uint, status, dateStr string) ([]model.Reservations, error)
	GetByID(id uint) (*model.Reservations, error)
	GetByIDWithTx(tx *gorm.DB, id uint) (*model.Reservations, error)
	CheckDoubleBookingWithTx(tx *gorm.DB, tableID uint, dateStr string, timeStr string, excludeID uint) (bool, error)
	CountTodayReservations() (int64, error)
	GetAvailableTables(outletID uint, dateStr string, timeStr string, guestCount int) ([]model.DiningTables, error)
}

type reservationRepository struct {
	db *gorm.DB
}

func NewReservationRepository(db *gorm.DB) ReservationRepository {
	return &reservationRepository{db}
}

func (r *reservationRepository) CreateWithTx(tx *gorm.DB, reservation *model.Reservations) error {
	return tx.Create(reservation).Error
}

func (r *reservationRepository) UpdateWithTx(tx *gorm.DB, reservation *model.Reservations) error {
	return tx.Save(reservation).Error
}

func (r *reservationRepository) GetAll(outletID, tableID uint, status, dateStr string) ([]model.Reservations, error) {
	var data []model.Reservations
	query := r.db.Preload("Outlet").
		Preload("DiningTable").
		Preload("CreatedByUsr")

	if outletID > 0 {
		query = query.Where("outlet_id = ?", outletID)
	}
	if tableID > 0 {
		query = query.Where("table_id = ?", tableID)
	}
	if status != "" {
		query = query.Where("status_reservation = ?", status)
	}
	if dateStr != "" {
		query = query.Where("DATE(reservation_date) = ?", dateStr)
	}

	err := query.Order("reservation_date DESC, reservation_time DESC").Find(&data).Error
	return data, err
}

func (r *reservationRepository) GetByID(id uint) (*model.Reservations, error) {
	return r.GetByIDWithTx(r.db, id)
}

func (r *reservationRepository) GetByIDWithTx(tx *gorm.DB, id uint) (*model.Reservations, error) {
	var data model.Reservations
	err := tx.Preload("Outlet").
		Preload("DiningTable").
		Preload("CreatedByUsr").
		First(&data, "id_reservation = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}

func (r *reservationRepository) CheckDoubleBookingWithTx(tx *gorm.DB, tableID uint, dateStr string, timeStr string, excludeID uint) (bool, error) {
	var count int64
	query := tx.Model(&model.Reservations{}).
		Where("table_id = ?", tableID).
		Where("DATE(reservation_date) = ?", dateStr).
		Where("reservation_time = ?", timeStr).
		Where("status_reservation IN ?", []string{"pending", "confirmed", "seated"})

	if excludeID > 0 {
		query = query.Where("id_reservation != ?", excludeID)
	}

	err := query.Count(&count).Error
	return count > 0, err
}

func (r *reservationRepository) CountTodayReservations() (int64, error) {
	var count int64
	today := time.Now().Format("2006-01-02")
	err := r.db.Model(&model.Reservations{}).
		Where("DATE(created_at) = ?", today).
		Count(&count).Error
	return count, err
}

func (r *reservationRepository) GetAvailableTables(outletID uint, dateStr string, timeStr string, guestCount int) ([]model.DiningTables, error) {
	var tables []model.DiningTables
	query := r.db.Where("outlet_id = ? AND status_table != ?", outletID, "inactive")

	if guestCount > 0 {
		query = query.Where("capacity >= ?", guestCount)
	}

	if err := query.Find(&tables).Error; err != nil {
		return nil, err
	}

	var available []model.DiningTables
	for _, t := range tables {
		isBooked, err := r.CheckDoubleBookingWithTx(r.db, t.IDDiningTable, dateStr, timeStr, 0)
		if err != nil {
			return nil, err
		}
		if !isBooked {
			available = append(available, t)
		}
	}

	return available, nil
}
