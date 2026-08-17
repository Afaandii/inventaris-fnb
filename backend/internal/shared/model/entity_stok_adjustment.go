package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type StokAdjustments struct {
	IDStokAdjustment uint            `json:"id_stok_adjustment" gorm:"primaryKey;autoIncrement;column:id_stok_adjustment"`
	OutletRef        uint            `json:"outlet_id" gorm:"column:outlet_id"`
	IngredientRef    uint            `json:"ingredient_id" gorm:"column:ingredient_id"`
	UnitRef          uint            `json:"unit_id" gorm:"column:unit_id"`
	WirehouseRef     uint            `json:"wirehouse_id" gorm:"column:wirehouse_id"`
	CreatedBy        uint            `json:"created_by" gorm:"column:created_by"`
	Qty              decimal.Decimal `json:"qty" gorm:"numeric(15,3);column:qty"`
	Reason           string          `json:"reason" gorm:"type:TEXT;column:reason"`
	AdjustmentDate   time.Time       `json:"adjustment_date" gorm:"column:adjustment_date"`

	Outlet     Outlets     `gorm:"foreignKey:OutletRef;references:IDOutlet;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	Ingredient Ingredients `gorm:"foreignKey:IngredientRef;references:IDIngredient;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	Unit       Units       `gorm:"foreignKey:UnitRef;references:IDUnit;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	Wirehouse  Wirehouse   `gorm:"foreignKey:WirehouseRef;references:IDWirehouse;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	Users      Users       `gorm:"foreignKey:CreatedBy;references:IDUser;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
}

func (StokAdjustments) TableName() string {
	return "stok_adjustments"
}
