package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type SalesOrderItems struct {
	IDSalesOrderItem uint            `json:"id_sales_order_item" gorm:"primaryKey;autoIncrement;column:id_sales_order_item"`
	OrderRef         uint            `json:"sales_order_id" gorm:"column:sales_order_id"`
	ProdVarRef       uint            `json:"product_variant_id" gorm:"column:product_variant_id"`
	Qty              int             `json:"qty" gorm:"type:int;column:qty"`
	UnitPrice        decimal.Decimal `json:"unit_price" gorm:"type:numeric(15,3);column:unit_price"`
	DiscountAmount   decimal.Decimal `json:"discount_amount" gorm:"type:numeric(15,3);column:discount_amount"`
	TotalAmount      decimal.Decimal `json:"total_amount" gorm:"type:numeric(15,3);column:total_amount"`
	Notes            string          `json:"notes" gorm:"type:text;column:notes"`
	CreatedAt        time.Time       `json:"created_at"`

	SalesOrder     SalesOrders     `gorm:"foreignKey:OrderRef;references:IDSalesOrder;constraint:OnUpdate:RESTRICT,OnDelete:CASCADE"`
	ProductVariant ProductVariants `gorm:"foreignKey:ProdVarRef;references:IDProductVariant;constraint:OnUpdate:RESTRICT,OnDelete:CASCADE"`
}

func (SalesOrderItems) TableName() string {
	return "sales_order_items"
}
