package model

import "time"

type GoodReceipts struct {
	IDGoodReceipt   uint      `json:"id_good_receipt" gorm:"primaryKey;autoIncrement;column:id_good_receipt"`
	PurchaseRef     uint      `json:"purchase_id" gorm:"column:purchase_id"`
	WarehouseRef    uint      `json:"warehouse_id" gorm:"column:warehouse_id"`
	ReceivedBy      uint      `json:"received_by" gorm:"column:received_by"`
	CheckedBy       uint      `json:"checked_by" gorm:"column:checked_by"`
	ReceiptNumber   string    `json:"receipt_number" gorm:"type:varchar(255);column:receipt_number"`
	ReceivedDate    time.Time `json:"received_date" gorm:"column:received_date"`
	SupplierInvoice string    `json:"supplier_invoice" gorm:"type:varchar(255);column:supplier_invoice"`
	StatusReceipt   string    `json:"status_receipt" gorm:"type:status_receipts;column:status_receipt"`
	Notes           string    `json:"notes" gorm:"type:TEXT;column:notes"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	Purchase      PurchaseOrders `gorm:"foreignKey:PurchaseRef;references:IDPurchase;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	Warehouse     Wirehouse      `gorm:"foreignKey:WarehouseRef;references:IDWirehouse;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	ReceivedByUsr Users          `gorm:"foreignKey:ReceivedBy;references:IDUser;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	CheckedByUsr  Users          `gorm:"foreignKey:CheckedBy;references:IDUser;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`

	GoodReceiptItem []GoodReceiptItems `gorm:"foreignKey:GoodReceiptRef;references:IDGoodReceipt;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
}

func (GoodReceipts) TableName() string {
	return "good_receipt"
}
