package wirehouse

import "time"

type Wirehouse struct {
	IDWirehouse   uint   `json:"id_wirehouse" gorm:"primaryKey;autoIncrement;column:id_wirehouse"`
	OutletRef     uint   `json:"outlet_id" gorm:"column:outlet_id"`
	ManagerRef    *uint   `json:"manager_id" gorm:"column:manager_id"`
	WirehouseCode string `json:"wirehouse_code" gorm:"type:varchar(255);column:wirehouse_coode"`
	WirehouseName string `json:"wirehouse_name" gorm:"type:varchar(255);column:wirehouse_name"`
	Address       string `json:"address" gorm:"type:text;column:address"`
	City          string `json:"city" gorm:"type:varchar(60);column:city"`
	PhoneNumber   *string   `json:"phone_number" gorm:"type:varchar(20);column:phone_number"`
	Type          string `json:"type" gorm:"type:varchar(255);column:type"`
	Status        string `json:"status" gorm:"type:varchar(255);column:status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt 		time.Time `json:"updated_at"`
}

func (Wirehouse) TableName() string{
	return "wirehouses"
}