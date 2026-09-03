package model

import (
	"time"
)

type Users struct {
	IDUser      uint       `json:"id_user" gorm:"primaryKey;autoIncrement;column:id_user"`
	RoleRef     uint       `json:"role_id" gorm:"column:role_id"`
	OutletRef   *uint      `json:"outlet_id" gorm:"default:null;column:outlet_id"`
	Name        string     `json:"name" gorm:"type:varchar(120);column:name"`
	Username    string     `json:"username" gorm:"type:varchar(80);column:username"`
	Email       string     `json:"email" gorm:"type:varchar(130);column:email"`
	Password    string     `json:"password" gorm:"type:varchar(255);column:password"`
	PhoneNumber *string    `json:"phone_number" gorm:"type:varchar(25);column:phone_number;default:null"`
	LastLogin   *time.Time `json:"last_login" gorm:"default:null;column:last_login"`
	Avatar      *string    `json:"avatar" gorm:"default:null;type:text;column:avatar"`
	Status      string     `json:"status" gorm:"type:status_users;default:'active';column:status"`
	IsActive    *bool      `json:"is_active" gorm:"type:bool;column:is_active"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`

	Role      Roles       `gorm:"foreignKey:RoleRef;references:IDRole;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	Wirehouse []Wirehouse `gorm:"foreignKey:ManagerRef;referencesIDUser;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	StokMovement []StokMovements `gorm:"foreignKey:CreatedBy;references:IDUser;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	StokAdjustment []StokAdjustments `gorm:"foreignKey:CreatedBy;references:IDUser;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	CreatedByUsr  []StokTransfers `gorm:"foreignKey:CreatedBy;references:IDUser;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	ApprovedByUsr []StokTransfers `gorm:"foreignKey:ApprovedBy;references:IDUser;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	StokOpnameCret   []StokOpnames `gorm:"foreignKey:CreatedBy;references:IDUser;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	StokOpnameApprov []StokOpnames `gorm:"foreignKey:ApprovedBy;references:IDUser;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	Waste []Wastes `gorm:"foreignKey:CreatedBy;references:IDUser;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	GoodReceiptRecei []GoodReceipts `gorm:"foreignKey:ReceivedBy;references:IDUser;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	GoodReceiptCheck []GoodReceipts `gorm:"foreignKey:CheckedBy;references:IDUser;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`

	PurchaseOrderCret  []PurchaseOrders `gorm:"foreignKey:CreatedBy;references:IDUser;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
	PurchaseOrderAppro []PurchaseOrders `gorm:"foreignKey:ApprovedBy;references:IDUser;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`

	Production []Productions `gorm:"foreignKey:CreatedBy;references:IDUser;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`

	Reservation []Reservations `gorm:"foreignKey:CreatedBy;references:IDUser;constraint:OnUpdate:RESTRICT,OnDelete:CASCADE"`
}

func (Users) TableName() string {
	return "users"
}
