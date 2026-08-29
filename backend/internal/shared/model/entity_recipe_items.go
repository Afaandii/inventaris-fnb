package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type RecipeItems struct {
	IDRecipeItems uint            `json:"id_recipe_item" gorm:"primaryKey;autoIncrement;column:id_recipe_item"`
	RecipeRef     uint            `json:"recipe_id" gorm:"column:recipe_id"`
	IngredientRef uint            `json:"ingredient_id" gorm:"column:ingredient_id"`
	UnitRef       uint            `json:"unit_id" gorm:"column:unit_id"`
	Quantity      decimal.Decimal `json:"quantity" gorm:"type:numeric(15,3);column:quantity"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`

	Recipe     Recipes     `gorm:"foreignKey:RecipeRef;references:IDRecipe;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	Ingredient Ingredients `gorm:"foreignKey:IngredientRef;references:IDIngredient;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	Unit       Units       `gorm:"foreignKey:UnitRef;references:IDUnit;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
}

func (RecipeItems) TableName() string {
	return "recipe_items"
}
