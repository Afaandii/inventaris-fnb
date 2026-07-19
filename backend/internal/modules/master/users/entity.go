package users

import "time"

type Users struct {
	IDUser      uint   `json:"id_user" gorm:"primaryKey;autoIncrement;column:id_user"`
	RoleRef      uint   `json:"role_id" gorm:"column:role_id"`
	OutletRef    uint   `json:"outlet_id" gorm:"column:outlet_id"`
	Name        string `json:"name" gorm:"type:varchar(150);column:name"`
	Username    string `json:"username" gorm:"type:varchar(200);column:username"`
	Email       string `json:"email" gorm:"type:varchar(220);column:email"`
	Password    string `json:"password" gorm:"type:varchar(255);column:password"`
	PhoneNumber *int   `json:"phone_number" gorm:"type:int;column:phone_number"`
	LastLogin   time.Time `json:"last_login" gorm:"column:last_login"`
	Avatar 			string  `json:"avatar" gorm:"column:avatar"`
	IsActive 		*bool   `json:"is_active" gorm:"type:bool;column:is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Users) TableName() string{
	return "users"
}