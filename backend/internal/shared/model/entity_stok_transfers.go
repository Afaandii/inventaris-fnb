package model

import "time"

type StokTransfers struct {
	IDStokTransfer uint      `json:"id_stok_transfer" gorm:"primaryKey;autoIncrement;column:id_stok_transfer"`
	OutletRef      uint      `json:"outlet_id" gorm:"column:outlet_id"`
	WarehouseFrom  uint      `json:"warehouse_from" gorm:"column:warehouse_from"`
	WarehouseTo    uint      `json:"warehouse_to" gorm:"column:warehouse_to"`
	CreatedBy      uint      `json:"created_by" gorm:"column:created_by"`
	ApprovedBy     uint      `json:"approved_by" gorm:"approved_by"`
	TransferCode   string    `json:"transfer_code" gorm:"type:varchar(255);column:transfer_code"`
	TransferDate   time.Time `json:"transfer_date" gorm:"column:transfer_date"`
	Approved_at    time.Time `json:"approved_at" gorm:"column:approved_at"`
	Notes          string    `json:"notes" gorm:"type:TEXT;column:notes"`
	StatusTransfer string    `json:"status_transfer" gorm:"type:status_transfers;column:status_transfer"`

	Outlet         Outlets   `gorm:"foreignKey:OutletRef;references:IDOutlet;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	WarehousesFrom Wirehouse `gorm:"foreignKey:WarehouseFrom;references:IDWirehouse;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	WarehousesTo   Wirehouse `gorm:"foreignKey:WarehouseTo;references:IDWirehouse;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	CreatedByUsr   Users     `gorm:"foreignKey:CreatedBy;references:IDUser;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	ApprovedByUsr  Users     `gorm:"foreignKey:ApprovedBy;references:IDUser;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	StokTransferItem []StokTransferItems `gorm:"foreignKey:TransferStokRef;references:IDStokTransfer;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
}

func (StokTransfers) TableName() string {
	return "stok_transfers"
}
