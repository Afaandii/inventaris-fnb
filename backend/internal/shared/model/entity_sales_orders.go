package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type SalesOrders struct {
	IDSalesOrder   uint            `json:"id_sales_order" gorm:"primaryKey;autoIncrement;column:id_sales_order"`
	OutletRef      uint            `json:"outlet_id" gorm:"column:outlet_id"`
	TableRef       uint            `json:"table_id" gorm:"column:table_id"`
	CashierRef     uint            `json:"cashier_id" gorm:"column:cashier_id"`
	OrderNumber    string          `json:"order_number" gorm:"type:varchar(255);column:order_number"`
	OrderType      string          `json:"order_type" gorm:"type:type_orders;column:order_type"`
	OrderDate      time.Time       `json:"order_date" gorm:"type:timestamp;column:order_date"`
	CustomerName   string          `json:"customer_name" gorm:"type:varchar(120);column:customer_name"`
	QueueNumber    string          `json:"queue_number" gorm:"type:varchar(80);column:queue_number"`
	ServiceCharge  decimal.Decimal `json:"service_charge" gorm:"type:numeric(15,3);column:service_charge"`
	StatusOrders   string          `json:"status_order" gorm:"type:status_orders;column:status_order"`
	Subtotal       decimal.Decimal `json:"subtotal" gorm:"type:numeric(15,3);column:subtotal"`
	DiscountAmount decimal.Decimal `json:"discount_amount" gorm:"type:numeric(15,3);column:discount_amount"`
	TaxAmount      decimal.Decimal `json:"tax_amount" gorm:"type:numeric(15,3);column:tax_amount"`
	TotalAmount    decimal.Decimal `json:"total_amount" gorm:"type:numeric(15,3);column:total_amount"`
	PaymentStatus  string          `json:"payment_status" gorm:"type:status_payments_orders;column:payment_status"`
	Notes          string          `json:"notes" gorm:"type:text;column:notes"`
	CreatedAt      time.Time       `json:"created_at"`

	Outlet  Outlets      `gorm:"foreignKey:OutletRef;references:IDOutlet;constraint:OnUpdate:RESTRICT,OnDelete:CASCADE"`
	Table   DiningTables `gorm:"foreignKey:TableRef;references:IDDiningTable;constraint:OnUpdate:RESTRICT,OnDelete:CASCADE"`
	Cashier Users        `gorm:"foreignKey:CashierRef;references:IDUser;constraint:OnUpdate:RESTRICT,OnDelete:CASCADE"`

	Payment        []Payments        `gorm:"foreignKey:OrderRef;references:IDSalesOrder;constraint:OnUpdate:RESTRICT,OnDelete:CASCADE"`
	SalesOrderItem []SalesOrderItems `gorm:"foreignKey:OrderRef;references:IDSalesOrder;constraint:OnUpdate:RESTRICT,OnDelete:CASCADE"`
}

func (SalesOrders) TableName() string {
	return "sales_orders"
}
