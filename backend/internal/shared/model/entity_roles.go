package model

import (
	"time"
)

type Roles struct {
	IDRoles     uint   `json:"id_role" gorm:"primaryKey;autoIncrement;column:id_role"`
	RoleName    string `json:"role_name" gorm:"type:varchar(80);column:role_name"`
	DisplayName string `json:"display_name" gorm:"type:varchar(120);column:display_name"`
	Description *string `json:"description" gorm:"default:null;type:text;column:description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt 	time.Time `json:"updated_at"`

	User []Users `gorm:"foreignKey:RoleRef;references:IDRole;constraint:OnUpdate:RESTRICT,OnDelete:CASCADE"`
}

func (Roles) TableName() string{
	return "roles"
}