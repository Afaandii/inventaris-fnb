package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type Productions struct {
	IDProduction     uint            `json:"id_production" gorm:"primaryKey;autoIncrement;column:id_production"`
	OutletRef        uint            `json:"outlet_id" gorm:"column:outlet_id"`
	WarehouseRef     uint            `json:"warehouse_id" gorm:"column:warehouse_id"`
	UnitRef          uint            `json:"unit_id" gorm:"column:unit_id"`
	CreatedBy        uint            `json:"created_by" gorm:"created_by"`
	ProductRef       uint            `json:"product_id" gorm:"product_id"`
	Qty              decimal.Decimal `json:"qty" gorm:"type:numeric(15,3);column:qty"`
	StatusProduction string          `json:"status_production" gorm:"type:status_productions;column:status_production"`
	ProductionDate   time.Time       `json:"production_date" gorm:"column:production_date"`
	Notes            string          `json:"notes" gorm:"column:notes"`
	CompletedAt      time.Time       `json:"completed_at" gorm:"column:completed_at"`

	Outlet       Outlets   `gorm:"foreignKey:OutletRef;references:IDOutlet;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	Warehouse    Wirehouse `gorm:"foreignKey:WarehouseRef;references:IDWirehouse;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	Unit         Units     `gorm:"foreignKey:UnitRef;references:IDUnit;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	CreatedByUsr Users     `gorm:"foreignKey:CreatedBy;references:IDUser;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	Product      Products  `gorm:"foreignKey:ProductRef;references:IDProduct;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
}

func (Productions) TableName() string {
	return "productions"
}
