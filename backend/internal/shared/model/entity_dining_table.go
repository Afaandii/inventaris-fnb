package model

import "time"

type DiningTable struct {
	IDDiningTable uint      `json:"id_dining_table" gorm:"primaryKey;autoIncrement;column:id_dining_table"`
	OutletRef     uint      `json:"outlet_id" gorm:"column:outlet_id"`
	Name          string    `json:"name" gorm:"type:varchar(120);column:name"`
	Capacity      int       `json:"capacity" gorm:"column:capacity"`
	Status        string    `json:"status_table" gorm:"type:status_dining_tables;column:status_table"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (DiningTable) TableName() string {
	return "dining_tables"
}
