package database

import (
	"backend/internal/modules/master/categories"
	"backend/internal/modules/master/ingredients"
	"backend/internal/modules/master/outlets"
	"backend/internal/modules/master/suppliers"
	"backend/internal/modules/master/units"
	wirehouse "backend/internal/modules/master/wirehouses"
	"backend/internal/shared/model"

	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB) {
	db.AutoMigrate(
		&model.Roles{},
		&categories.Category{},
		&suppliers.Suppliers{},
		&outlets.Outlets{},
		&units.Units{},
		&model.Users{},
		&wirehouse.Wirehouse{},
		&ingredients.Ingredients{},
	)
}