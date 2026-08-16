package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type Ingredients struct {
	IDIngredient uint             `json:"id_ingredient" gorm:"primaryKey;autoIncrement;column:id_ingredient"`
	CategoryRef  uint             `json:"category_id" gorm:"column:category_id"`
	UnitRef      uint             `json:"unit_id" gorm:"column:unit_id"`
	SupplierRef  *uint            `json:"supplier_id" gorm:"column:supplier_id"`
	IngreCode    string           `json:"ingre_code" gorm:"type:varchar(255);column:ingre_code"`
	IngreName    string           `json:"ingre_name" gorm:"type:varchar(120);column:ingre_name"`
	Sku          *string          `json:"sku" gorm:"type:varchar(60);column:sku"`
	Barcode      *string          `json:"barcode" gorm:"type:varchar(80);column:barcode"`
	MinStok      decimal.Decimal  `json:"min_stok" gorm:"type:numeric(15,3);column:min_stok"`
	MaxStok      *decimal.Decimal `json:"max_stok" gorm:"type:numeric(15,3);column:max_stok"`
	CostPrice    decimal.Decimal  `json:"cost_price" gorm:"type:numeric(15,2); column:cost_price"`
	AverageCost  decimal.Decimal  `json:"average_cost" gorm:"type:numeric(15,2);column:average_cost"`
	IsPerishable bool             `json:"is_perishable" gorm:"type:bool;column:is_perishable"`
	ShelfLifeDay *int             `json:"shelf_life_day" gorm:"type:int;column:shelf_life_day"`
	Status       string           `json:"status" gorm:"type:status_ingredients;default:'active';column:status_ingredient"`
	IsActive     bool             `json:"is_active" gorm:"type:bool;column:is_active"`
	CreatedAt    time.Time        `json:"created_at"`
	UpdatedAt    time.Time        `json:"updated_at"`

	Category Category  `gorm:"foreignKey:CategoryRef;references:IDCategory;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	Unit     Units     `gorm:"foreignKey:UnitRef;references:IDUnit;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	Supplier Suppliers `gorm:"foreignKey:SupplierRef;references:IDSupplier;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	StokBalance []StokBalances `gorm:"foreignKey:IngredientRef;references:IDIngredient;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	StokMovement []StokMovements `gorm:"foreignKey:IngredientRef;references:IDIngredient;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
}

func (Ingredients) TableName() string {
	return "ingredients"
}
