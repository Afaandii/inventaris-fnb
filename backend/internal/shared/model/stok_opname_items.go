package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type StokOpnameItems struct {
	IDStokOpnameItem uint            `json:"id_stok_opname_item" gorm:"primaryKey;autoIncrement;column:id_stok_opname_item"`
	OpnameRef        uint            `json:"opname_id" gorm:"column:opname_id"`
	IngredientRef    uint            `json:"ingredient_id" gorm:"column:ingredient_id"`
	UnitRef          uint            `json:"unit_id" gorm:"column:unit_id"`
	SystemQty        decimal.Decimal `json:"system_qty" gorm:"type:numeric(15,3);column:system_qty"`
	PhysicalQty      decimal.Decimal `json:"physical_qty" gorm:"type:numeric(15,3);column:physical_qty"`
	DifferenceQty    decimal.Decimal `json:"difference_qty" gorm:"type:numeric(15,3);column:difference_qty"`
	Remarks          string          `json:"remarks" gorm:"type:TEXT;column:remarks"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`

	Opname     StokOpnames `gorm:"foreignKey:OpnameRef;references:IDStokOpname;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	Ingredient Ingredients `gorm:"foreignKey:IngredientRef;references:IDIngredient;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	Unit       Units       `gorm:"foreignKey:UnitRef;references:IDUnit;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
}

func (StokOpnameItems) TableName() string {
	return "stok_opname_items"
}
