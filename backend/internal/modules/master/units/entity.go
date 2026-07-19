package units

import "time"

type Units struct {
	IDUnit    uint   `json:"id_unit" gorm:"primaryKey;autoIncrement;column:id_unit"`
	UnitCode  string `json:"unit_code" gorm:"type:varchar(255);column:unit_code"`
	UnitName  string `json:"unit_name" gorm:"type:varchar(255);column:unit_name"`
	Type      string `json:"type" gorm:"type:varchar(255);column:type"`
	ShortName string `json:"short_name" gorm:"type:varchar(255);column:short_name"`
	IsActive  bool   `json:"is_active" gorm:"type:bool;column:is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Units) TableName() string{
	return "units"
}