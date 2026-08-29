package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type Recipes struct {
	IDRecipe      uint            `json:"id_recipe" gorm:"primaryKey;autoIncrement;column:id_recipe"`
	ProductRef    uint            `json:"product_id" gorm:"column:product_id"`
	OutletRef     uint            `json:"outlet_id" gorm:"column:outlet_id"`
	YieldQty      decimal.Decimal `json:"yield_qty" gorm:"type:numeric(15,3);column:yield_qty"`
	YieldUnit     string          `json:"yield_unit" gorm:"type:varchar(120);column:yield_unit"`
	Instruction   string          `json:"instruction" gorm:"type:TEXT;column:instruction"`
	RecipeVersion string          `json:"recipe_version" gorm:"type:varchar(30);column:recipe_version"`
	Notes         string          `json:"notes" gorm:"type:TEXT;column:notes"`
	IsActive      bool            `json:"is_active" gorm:"type:is_active;column:is_active"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`

	Product Products `gorm:"foreignKey:ProductRef;references:IDProduct;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	Outlet  Outlets  `gorm:"foreignKey:OutletRef;references:IDOutlet;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`

	RecipeItem []RecipeItems `gorm:"foreignKey:RecipeRef;references:IDRecipe;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
}

func (Recipes) TableName() string {
	return "recipes"
}
