package database

import (
	"backend/internal/shared/model"

	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB) {
	db.AutoMigrate(
		&model.Roles{},
		&model.Category{},
		&model.Suppliers{},
		&model.Outlets{},
		&model.Units{},
		&model.Users{},
		&model.Wirehouse{},
		&model.Ingredients{},
	)
}