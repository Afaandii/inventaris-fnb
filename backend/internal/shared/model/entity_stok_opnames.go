package model

import "time"

type StokOpnames struct {
	IDStokOpname uint      `json:"id_stok_opname" gorm:"primaryKey;autoIncrement;column:id_stok_opname"`
	OutletRef    uint      `json:"outlet_id" gorm:"column:outlet_id"`
	WirehouseRef uint      `json:"wirehouse_id" gorm:"column:wirehouse_id"`
	CreatedBy    uint      `json:"created_by" gorm:"column:created_by"`
	ApprovedBy   uint      `json:"approved_by" gorm:"column:approved_by;default:null"`
	OpnameCode   string    `json:"opname_code" gorm:"type:varchar(255);column:opname_code"`
	OpnameDate   time.Time `json:"opname_date" gorm:"column:opname_date"`
	ApprovedAt   time.Time `json:"approved_at" gorm:"column:approved_at"`
	Notes        string    `json:"notes" gorm:"type:TEXT;column:notes"`
	StatusOpname string    `json:"status_opname" gorm:"type:status_opnames;column:status_opname"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	// relations
	Outlet         Outlets           `gorm:"foreignKey:OutletRef;references:IDOutlet;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	Wirehouse      Wirehouse         `gorm:"foreignKey:WirehouseRef;references:IDWirehouse;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	CreatedByOpnm  Users             `gorm:"foreignKey:CreatedBy;references:IDUser;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	ApprovedByOpnm Users             `gorm:"foreignKey:ApprovedBy;references:IDUser;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	StokOpnameItem []StokOpnameItems `gorm:"foreignKey:OpnameRef;references:IDStokOpname;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
}

func (StokOpnames) TableName() string {
	return "stok_opnames"
}
