package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type PurchaseItems struct {
	IDPurchaseItem uint            `json:"id_purchase_item" gorm:"primaryKey;autoIncrement;column:id_purchase_item"`
	PurchaseRef    uint            `json:"purchase_id" gorm:"column:purchase_id"`
	IngredientRef  uint            `json:"ingredient_id" gorm:"column:ingredient_id"`
	UnitRef        uint            `json:"unit_id" gorm:"column:unit_id"`
	Qty            uint            `json:"qty" gorm:"qty"`
	UnitPrice      decimal.Decimal `json:"unit_price" gorm:"type:numeric(15,3);column:unit_price"`
	TotalPrice     decimal.Decimal `json:"total_price" gorm:"type:numeric(15,3);column:total_price"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

func (PurchaseItems) TableName() string {
	return "purchase_order_items"
}
