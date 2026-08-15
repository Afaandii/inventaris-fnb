package model

import "time"

type StokBalances struct {
	IDStokBalance uint      `json:"id_stok_balance" gorm:"primaryKey;autoIncrement;column:id_stok_balance"`
	IngredientRef uint      `json:"ingredient_id" gorm:"column:ingredient_id"`
	WirehouseRef  uint      `json:"wirehouse_id" gorm:"column:wirehouse_id"`
	AvailableQty  uint      `json:"available_qty" gorm:"type:int;column:available_qty"`
	ReservedQty   uint      `json:"reserved_qty" gorm:"type:int;column:reserved_qty"`
	BatchNo       string    `json:"batch_no" gorm:"type:varchar(255);column:batch_no"`
	ExpireDate    time.Time `json:"expire_date" gorm:"expire_date"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	Ingredient Ingredients `gorm:"foreignKey:IngredientRef;references:IDIngredient;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	Wirehouse  Wirehouse   `gorm:"foreignKey:WirehouseRef;references:IDWirehouse;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
}

func (StokBalances) TableName() string {
	return "stok_balances"
}
