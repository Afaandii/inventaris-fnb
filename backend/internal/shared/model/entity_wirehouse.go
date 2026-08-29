package model

import "time"

type Wirehouse struct {
	IDWirehouse   uint      `json:"id_wirehouse" gorm:"primaryKey;autoIncrement;column:id_wirehouse"`
	OutletRef     uint      `json:"outlet_id" gorm:"column:outlet_id"`
	ManagerRef    *uint     `json:"manager_id" gorm:"column:manager_id"`
	WirehouseCode string    `json:"wirehouse_code" gorm:"type:varchar(255);column:wirehouse_code"`
	WirehouseName string    `json:"wirehouse_name" gorm:"type:varchar(255);column:wirehouse_name"`
	Address       string    `json:"address" gorm:"type:text;column:address"`
	City          string    `json:"city" gorm:"type:varchar(60);column:city"`
	PhoneNumber   *string   `json:"phone_number" gorm:"type:varchar(20);column:phone_number"`
	Type          string    `json:"type" gorm:"type:type_wirehouses;column:type"`
	Status        string    `json:"status" gorm:"type:status_wirehouses;default:'active';column:status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	User   Users   `gorm:"foreignKey:ManagerRef;references:IDUser;constraint:OnUpdate:RESTRICT,OnDelete:CASCADE"`
	Outlet Outlets `gorm:"foreignKey:OutletRef;references:IDOutlet;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	StokBalance []StokBalances `gorm:"foreignKey:WirehouseRef;references:IDWirehouse;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	MovementFrom []StokMovements `gorm:"foreignKey:WirehouseFrom;references:IDWirehouse;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	MovementTo   []StokMovements `gorm:"foreignKey:WirehouseTo;references:IDWirehouse;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	StokAdjustment []StokAdjustments `gorm:"foreignKey:WirehouseRef;references:IDWirehouse;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	TransferFrom []StokTransfers `gorm:"foreignKey:WarehouseFrom;references:IDWirehouse;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	TransferTo   []StokTransfers `gorm:"foreignKey:WarehouseTo;references:IDWirehouse;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	StokOpname []StokOpnames `gorm:"foreignKey:WirehouseRef;references:IDWirehouse;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	Waste []Wastes `gorm:"foreignKey:WirehouseRef;references:IDWirehouse;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	GoodReceipt []GoodReceipts `gorm:"foreignKey:WarehouseRef;references:IDWirehouse;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`

	PurchaseOrder []PurchaseOrders `gorm:"foreignKey:WarehouseRef;references:IDWirehouse;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`

	Production []Productions `gorm:"foreignKey:WarehouseRef;references:IDWirehouse;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
}

func (Wirehouse) TableName() string {
	return "wirehouses"
}
