package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type Wastes struct {
	IDWaste       uint            `json:"id_waste" gorm:"primaryKey;autoIncrement;column:id_waste"`
	OutletRef     uint            `json:"outlet_id" gorm:"column:outlet_id"`
	IngredientRef uint            `json:"ingredient_id" gorm:"column:ingredient_id"`
	WirehouseRef  uint            `json:"wirehouse_id" gorm:"column:wirehouse_id"`
	UnitRef       uint            `json:"unit_id" gorm:"column:unit_id"`
	CreatedBy     uint            `json:"created_by" gorm:"column:created_by"`
	Qty           decimal.Decimal `json:"qty" gorm:"type:numeric(15,3);column:qty"`
	Reason        string          `json:"reason" gorm:"type:TEXT;column:reason"`
	WasteDate     time.Time       `json:"waste_date" gorm:"column:waste_date"`

	// relation
	Outlet       Outlets     `gorm:"foreignKey:OutletRef;references:IDOutlet;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	Ingredient   Ingredients `gorm:"foreignKey:IngredientRef;references:IDIngredient;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	Wirehouse    Wirehouse   `gorm:"foreignKey:WirehouseRef;references:IDWirehouse;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	Unit         Units       `gorm:"foreignKey:UnitRef;references:IDUnit;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	CreatedByWas Users       `gorm:"foreignKey:CreatedBy;references:IDUser;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
}

func (Wastes) TableName() string {
	return "wastes"
}
