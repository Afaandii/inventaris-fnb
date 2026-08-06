package model

import "time"

type Units struct {
	IDUnit    uint      `json:"id_unit" gorm:"primaryKey;autoIncrement;column:id_unit"`
	UnitCode  string    `json:"unit_code" gorm:"type:varchar(30);column:unit_code"`
	UnitName  string    `json:"unit_name" gorm:"type:varchar(120);column:unit_name"`
	Type      string    `json:"type" gorm:"type:type_units;column:type"`
	ShortName string    `json:"short_name" gorm:"type:varchar(20);column:short_name"`
	Status    string    `json:"status" validate:"type:status_units;default:'active';column:status_unit"`
	IsActive  bool      `json:"is_active" gorm:"type:bool;column:is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Units) TableName() string {
	return "units"
}
