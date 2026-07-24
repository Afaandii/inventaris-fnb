package model

import (
	"time"
)

type Users struct {
	IDUser      uint      `json:"id_user" gorm:"primaryKey;autoIncrement;column:id_user"`
	RoleRef     uint      `json:"role_id" gorm:"column:role_id"`
	OutletRef   *uint     `json:"outlet_id" gorm:"default:null;column:outlet_id"`
	Name        string    `json:"name" gorm:"type:varchar(120);column:name"`
	Username    string    `json:"username" gorm:"type:varchar(80);column:username"`
	Email       string    `json:"email" gorm:"type:varchar(130);column:email"`
	Password    string    `json:"password" gorm:"type:varchar(255);column:password"`
	PhoneNumber *string    `json:"phone_number" gorm:"type:varchar(25);column:phone_number;default:null"`
	LastLogin   *time.Time `json:"last_login" gorm:"default:null;column:last_login"`
	Avatar      *string    `json:"avatar" gorm:"default:null;type:text;column:avatar"`
	IsActive    *bool     `json:"is_active" gorm:"type:bool;column:is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	Role Roles `gorm:"foreignKey:RoleRef;references:IDRole;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
}

func (Users) TableName() string {
	return "users"
}