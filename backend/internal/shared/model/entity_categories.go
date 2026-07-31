package model

import "time"

type Category struct {
	IDCategory   uint   `json:"id_category" gorm:"primaryKey;autoIncrement;column:id_category"`
	ParentRef     *uint   `json:"parent_id" gorm:"column:parent_id"`
	CategoryName string `json:"category_name" gorm:"type:varchar(180);column:category_name"`
	Slug         string `json:"slug" gorm:"type:varchar(120);column:slug"`
	Type         string `json:"type" gorm:"type:varchar(80);column:type"`
	Description  string `json:"description" gorm:"type:text;column:description"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt 	 time.Time 	`json:"updated_at"`
}

func (Category) TableName() string {
	return "categories"
}