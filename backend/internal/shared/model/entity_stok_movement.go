package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type StokMovements struct {
	IDStokMovement uint            `json:"id_stok_movement" gorm:"primaryKey;autoIncrement;column:id_stok_movement"`
	WirehouseFrom  uint            `json:"wirehouse_from" gorm:"column:wirehouse_from"`
	WirehouseTo    uint            `json:"wirehouse_to" gorm:"column:wirehouse_to"`
	IngredientRef  uint            `json:"ingredient_id" gorm:"column:ingredient_id"`
	CreatedBy      uint            `json:"created_by" gorm:"column:created_by"`
	RefenceId      uint            `json:"reference_id" gorm:"type:int;column:reference_id"`
	ReferenceType  string          `json:"reference_type" gorm:"type:reference_type_stmov;column:reference_type"`
	MovementType   string          `json:"movement_type" gorm:"type:movement_type_stmov;column:movement_type"`
	MovementDate   time.Time       `json:"movement_date" gorm:"column:movement_date"`
	Qty            decimal.Decimal `json:"qty" gorm:"type:numeric(15,3);column:qty"`
	UnitCost       decimal.Decimal `json:"unit_cost" gorm:"type:numeric(15,3);column:unit_cost"`
	Remarks        string          `json:"remarks" gorm:"type:TEXT;column:remarks"`
	Notes          string          `json:"notes" gorm:"type:TEXT;column:notes"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

func (StokMovements) TableName() string {
	return "stok_movements"
}
