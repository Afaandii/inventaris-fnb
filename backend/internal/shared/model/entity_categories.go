package model

import "time"

type Category struct {
	IDCategory   uint      `json:"id_category" gorm:"primaryKey;autoIncrement;column:id_category"`
	ParentRef    *uint     `json:"parent_id" gorm:"column:parent_id"`
	CategoryName string    `json:"category_name" gorm:"type:varchar(180);column:category_name"`
	Slug         string    `json:"slug" gorm:"type:varchar(120);column:slug"`
	Type         string    `json:"type" gorm:"type:type_categories;column:type"`
	Description  string    `json:"description" gorm:"type:text;column:description"`
	Status       string    `json:"status" gorm:"type:status_categories;default:'active';column:status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	Ingredient []Ingredients `gorm:"foreignKey:CategoryRef;references:IDCategory;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`
}

func (Category) TableName() string {
	return "categories"
}
