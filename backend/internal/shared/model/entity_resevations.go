package model

import (
	"time"

	"gorm.io/datatypes"
)

type Reservations struct {
	IDReservation     uint           `json:"id_reservation" gorm:"primaryKey;autoIncrement;column:id_reservation"`
	OutletID          uint           `json:"outlet_id" gorm:"column:outlet_id"`
	TableRef          uint           `json:"table_id" gorm:"column:table_id"`
	CreatedBy         uint           `json:"created_by" gorm:"column:created_by"`
	ReservationCode   string         `json:"reservation_code" gorm:"type:varchar(255);column:reservation_code"`
	CustName          string         `json:"customer_name" gorm:"type:varchar(120);column:customer_name"`
	CustPhone         string         `json:"customer_phone" gorm:"type:varchar(20);column:customer_phone"`
	ReservationDate   time.Time      `json:"reservation_date" gorm:"column:reservation_date"`
	ReservationTime   datatypes.Time `json:"reservation_time" gorm:"type:time;column:reservation_time"`
	NumberOfGuest     int            `json:"number_of_guest" gorm:"type:int;column:number_of_guest"`
	SpecialRequest    string         `json:"special_request" gorm:"type:TEXT;column:special_request"`
	StatusReservation string         `json:"status_reservation" gorm:"type:status_reservations;default:'pending';column:status_reservation"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
}

func (Reservations) TableName() string {
	return "reservations"
}
