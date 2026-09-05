package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type Payments struct {
	IDPayment        uint            `json:"id_payment" gorm:"primaryKey;autoIncrement;column:id_payment"`
	OrderRef         uint            `json:"sales_order_id" gorm:"column:sales_order_id"`
	PaymentCode      string          `json:"payment_code" gorm:"type:varchar(255);column:payment_code"`
	PaymentMethod    string          `json:"payment_method" gorm:"type:payment_methods;column:payment_method"`
	PaidAmount       decimal.Decimal `json:"paid_amount" gorm:"type:numeric(15,3);column:paid_amount"`
	CashReceived     decimal.Decimal `json:"cash_received" gorm:"type:numeric(15,3);column:cash_received"`
	ReferenceNumber  string          `json:"reference_number" gorm:"type:varchar(255);column:reference_number"`
	PaymentReference string          `json:"payment_reference" gorm:"type:varchar(255);column:payment_reference"`
	ChangeAmount     decimal.Decimal `json:"change_amount" gorm:"type:numeric(15,3);column:change_amount"`
	PaymentProvider  string          `json:"payment_provider" gorm:"type:payment_providers;column:payment_provider"`
	PaymentStatus    string          `json:"payment_status" gorm:"type:status_payments;column:payment_status"`
	CreatedAt        time.Time       `json:"created_at"`

	SalesOrder SalesOrders `gorm:"foreignKey:OrderRef;references:IDSalesOrder;constraint:OnUpdate:RESTRICT,OnDelete:CASCADE"`
}

func (Payments) TableName() string {
	return "payments"
}
