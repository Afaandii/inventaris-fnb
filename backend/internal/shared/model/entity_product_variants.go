package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type ProductVariants struct {
	IDProductVariant uint            `json:"id_product_variant" gorm:"primaryKey;autoIncrement;column:id_product_variant"`
	ProductRef       uint            `json:"product_id" gorm:"column:product_id"`
	VariantCode      string          `json:"variant_code" gorm:"type:varchar(255);column:variant_code"`
	VariantName      string          `json:"variant_name" gorm:"type:varchar(255);column:variant_name"`
	SellPrice        decimal.Decimal `json:"sell_price" gorm:"type:numeric(15,3);column:sell_price"`
	CostPrice        decimal.Decimal `json:"cost_price" gorm:"type:numeric(15,3);column:cost_price"`
	Barcode          string          `json:"barcode" gorm:"type:varchar(255);column:barcode"`
	IsAvailable      bool            `json:"is_available" gorm:"type:boolean;column:is_available"`
	IsActive         bool            `json:"is_active" gorm:"type:boolean;column:is_active"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdateAt         time.Time       `json:"updated_at"`

	Product Products `gorm:"foreignKey:ProductRef;references:IDProduct;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
}

func (ProductVariants) TableName() string {
	return "product_variants"
}
