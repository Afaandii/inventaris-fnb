package model

import "time"

type MenuItems struct {
	IDMenuItem  uint      `json:"id_menu_item" gorm:"primaryKey;autoIncement;column:id_menu_item"`
	ProductRef  uint      `json:"product_id" gorm:"column:product_id"`
	OutletRef   uint      `json:"outlet_id" gorm:"column:outlet_id"`
	SortOrder   uint      `json:"sort_order" gorm:"column:sort_order"`
	IsAvailable bool      `json:"is_available" gorm:"type:boolean;column:is_available"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	Product Products `gorm:"foreignKey:ProductRef;references:IDProduct;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
	Outlet  Outlets  `gorm:"foreignKey:OutletRef;references:IDOutlet;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
}

func (MenuItems) TableName() string {
	return "menu_items"
}
