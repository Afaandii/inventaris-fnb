package database

import (
	"backend/internal/modules/master/categories"
	"backend/internal/modules/master/ingredients"
	"backend/internal/modules/master/outlets"
	"backend/internal/modules/master/roles"
	"backend/internal/modules/master/suppliers"
	"backend/internal/modules/master/units"
	"backend/internal/modules/master/users"
	wirehouse "backend/internal/modules/master/wirehouses"

	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB) {
	db.AutoMigrate(
		&roles.Roles{},
		&categories.Category{},
		&users.Users{},
		&wirehouse.Wirehouse{},
		&units.Units{},
		&outlets.Outlets{},
		&suppliers.Suppliers{},
		&ingredients.Ingredients{},
	)
}