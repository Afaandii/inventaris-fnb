package model

import "time"

type Products struct {
	IDProduct      uint      `json:"id_product" gorm:"primaryKey;autoIncrement;column:id_product"`
	CategoryRef    uint      `json:"category_id" gorm:"column:category_id"`
	ProdCode       string    `json:"prod_code" gorm:"type:varchar(255);column:prod_code"`
	ProdName       string    `json:"prod_name" gorm:"type:varchar(255);column:prod_name"`
	Slug           string    `json:"slug" gorm:"type:varchar(255);column:slug"`
	Sku            string    `json:"sku" gorm:"type:varchar(120);column:sku"`
	ProdType       string    `json:"prod_type" gorm:"type:type_products;column:prod_type"`
	IsAvailable    bool      `json:"is_available" gorm:"type:boolean;column:is_available"`
	IsActive       bool      `json:"is_active" gorm:"column:is_active"`
	Description    string    `json:"description" gorm:"type:TEXT;column:description"`
	ProdThumbnails string    `json:"prod_thumbnail" gorm:"type:TEXT;column:prod_thumbnail"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`

	Category Category `gorm:"foreignKey:CategoryRef;references:IDCategory;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`

	ProductVariant []ProductVariants `gorm:"foreignKey:ProductRef;references:IDProduct;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`

	MenuItem []MenuItems `gorm:"foreignKey:ProductRef;references:IDProduct;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	Recipe []Recipes `gorm:"foreignKey:ProductRef;references:IDProduct;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	Production []Productions `gorm:"foreignKey:ProductRef;references:IDProduct;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
}

func (Products) TableName() string {
	return "products"
}
