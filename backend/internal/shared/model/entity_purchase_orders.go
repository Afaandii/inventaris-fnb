package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type PurchaseOrders struct {
	IDPurchase     uint            `json:"id_purchase" gorm:"primaryKey;autoIncrement;column:id_purchase"`
	OutletRef      uint            `json:"outlet_id" gorm:"column:outlet_id"`
	SupplierRef    uint            `json:"supplier_id" gorm:"column:supplier_id"`
	WarehouseRef   uint            `json:"warehouse_id" gorm:"column:warehouse_id"`
	CreatedBy      uint            `json:"created_by" gorm:"column:created_by"`
	ApprovedBy     uint            `json:"approved_by" gorm:"column:approved_by"`
	PurchaseCode   string          `json:"purchase_code" gorm:"type:varchar(255);column:purchase_code" `
	PONumber       string          `json:"po_number" gorm:"type:varchar(120);unique;column:po_number"`
	TotalAmount    decimal.Decimal `json:"total_amount" gorm:"type:numeric(15,3);column:total_amount" `
	ApprovedAt     time.Time       `json:"approved_at" gorm:"type:timestamp;column:approved_at" `
	ExpectedDate   time.Time       `json:"expected_date" gorm:"type:timestamp;column:expected_date" `
	ReceivedDate   time.Time       `json:"received_date" gorm:"type:timestamp;column:received_date" `
	Notes          string          `json:"notes" gorm:"type:TEXT;column:notes" `
	StatusPurchase string          `json:"status_purchase" gorm:"type:status_purchases;default:'draft';column:status_purchase"`
	OrderDate      time.Time       `json:"order_date" gorm:"type:timestamp;column:order_date" `

	GoodReceipt  []GoodReceipts  `gorm:"foreignKey:PurchaseRef;references:IDPurchase;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	PurchaseItem []PurchaseItems `gorm:"foreignKey:PurchaseRef;references:IDPurchase;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`

	Oulet         Outlets   `gorm:"foreignKey:OutletRef;references:IDOutlet;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	Supplier      Suppliers `gorm:"foreignKey:SupplierRef;references:IDSupplier;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	Warehouse     Wirehouse `gorm:"foreignKey:WarehouseRef;references:IDWirehouse;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	CreatedByUsr  Users     `gorm:"foreignKey:CreatedBy;references:IDUser;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	ApprovedByUsr Users     `gorm:"foreignKey:ApprovedBy;references:IDUser;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
}

func (PurchaseOrders) TableName() string {
	return "purchase_orders"
}
