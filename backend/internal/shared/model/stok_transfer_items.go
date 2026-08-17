package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type StokTransferItems struct {
	IDStokTransferItem uint            `json:"id_stok_transfer_item" gorm:"primaryKey;autoIncrement;column:id_stok_transfer_item"`
	TransferStokRef    uint            `json:"transfer_id" gorm:"column:transfer_id"`
	IngredientRef      uint            `json:"ingredient_id" gorm:"column:ingredient_id"`
	UnitRef            uint            `json:"unit_id" gorm:"column:unit_id"`
	Qty                decimal.Decimal `json:"qty" gorm:"type:numeric(15,3);column:qty"`
	Remarks            string          `json:"remarks" gorm:"type:TEXT;column:remarks"`
	CreatedAt          time.Time       `json:"created_at"`
	UpdatedAt          time.Time       `json:"updated_at"`

	TransferStok StokTransfers `gorm:"foreignKey:TransferStokRef;references:IDStokTransfer;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	Ingredient   Ingredients   `gorm:"foreignKey:IngredientRef;references:IDIngredient;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	Unit         Units         `gorm:"foreignKey:UnitRef;references:IDUnit;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
}

func (StokTransferItems) TableName() string {
	return "stok_transfer_items"
}
