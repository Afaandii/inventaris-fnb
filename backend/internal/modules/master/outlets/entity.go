package outlets

import (
	"time"

	"gorm.io/datatypes"
)

type Outlets struct {
	IDOutlet     uint   `json:"id_outlet" gorm:"primaryKey;autoIncrement;column:id_outlet"`
	OutletCode   string `json:"outlet_code" gorm:"type:varchar(255);column:outlet_code"`
	OutletName   string `json:"outlet_name" gorm:"type:varchar(255);column:outlet_name"`
	Address      string `json:"address" gorm:"type:varchar(255);column:address"`
	City         string `json:"city" gorm:"type:varchar(255);column:city"`
	OpeningHours datatypes.Time `json:"opening_hours" gorm:"column:opening_hours"`
	ClosingHours datatypes.Time `json:"closing_hours" gorm:"column:closing_hours"`
	PhoneNumber *int `json:"phone_number" gorm:"type:int;column:phone_number"`
	StatusOutlet string `json:"status_outlet" gorm:"type:varchar(255);column:status_outlet"`
	CreatedAt 	 time.Time `json:"created_at"`
	UpdatedAt 	 time.Time `json:"updated_at"`
}

func (Outlets) TableName() string{
	return "outlets"
}