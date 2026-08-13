package model

import (
	"time"

	"gorm.io/datatypes"
)

type Outlets struct {
	IDOutlet     uint           `json:"id_outlet" gorm:"primaryKey;autoIncrement;column:id_outlet"`
	OutletCode   string         `json:"outlet_code" gorm:"type:varchar(255);column:outlet_code"`
	OutletName   string         `json:"outlet_name" gorm:"type:varchar(125);column:outlet_name"`
	Address      string         `json:"address" gorm:"type:text;column:address"`
	City         string         `json:"city" gorm:"type:varchar(60);column:city"`
	OpeningHours datatypes.Time `json:"opening_hours" gorm:"type:time;column:opening_hours"`
	ClosingHours datatypes.Time `json:"closing_hours" gorm:"type:time;column:closing_hours"`
	PhoneNumber  *string        `json:"phone_number" gorm:"type:varchar(20);column:phone_number"`
	StatusOutlet string         `json:"status_outlet" gorm:"type:status_outlets;default:'active';column:status_outlet"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`

	Wirehouse []Wirehouse `gorm:"foreignKey:OutletRef;references:IDOutlet;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
}

func (Outlets) TableName() string {
	return "outlets"
}
