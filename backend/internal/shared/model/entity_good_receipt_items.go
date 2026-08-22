package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type GoodReceiptItems struct {
	IDGoodReceiptItem uint            `json:"id_good_receipt_item" gorm:"primaryKey;autoIncrement;column:id_good_receipt_item"`
	GoodReceiptRef    uint            `json:"good_receipt_id" gorm:"column:good_receipt_id"`
	PurchaseItemRef   uint            `json:"purchase_item_id" gorm:"column:purchase_item_id"`
	IngredientRef     uint            `json:"ingredient_id" gorm:"column:ingredient_id"`
	UnitRef           uint            `json:"unit_id" gorm:"column:unit_id"`
	OrderedQty        decimal.Decimal `json:"ordered_qty" gorm:"type:numeric(15,3);column:ordered_qty"`
	ReceivedQty       decimal.Decimal `json:"received_qty" gorm:"type:numeric(15,3);column:received_qty"`
	AcceptedQty       decimal.Decimal `json:"accepted_qty" gorm:"type:numeric(15,3);column:accepted_qty"`
	RejectedQty       decimal.Decimal `json:"rejected_qty" gorm:"type:numeric(15,3);column:rejected_qty"`
	UnitCost          decimal.Decimal `json:"unit_cost" gorm:"type:numeric(15,3);column:unit_cost"`
	BatchNo           string          `json:"batch_no" gorm:"type:varchar(120);column:batch_no"`
	ExpiryDate        time.Time       `json:"expiry_date" gorm:"column:expiry_date"`
	Notes             string          `json:"notes" gorm:"type:TEXT;column:notes"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at"`

	GoodReceipt  GoodReceipts  `gorm:"foreignKey:GoodReceiptRef;references:IDGoodReceipt;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	PurchaseItem PurchaseItems `gorm:"foreignKey:PurchaseItemRef;references:IDPurchaseItem;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	Ingredient   Ingredients   `gorm:"foreignKey:IngredientRef;references:IDIngredient;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	Unit         Units         `gorm:"foreignKey:UnitRef;references:IDUnit;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
}

func (GoodReceiptItems) TableName() string {
	return "good_receipt_items"
}
