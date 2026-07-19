package database

import (
	"backend/internal/modules/master/roles"

	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB) {
	db.AutoMigrate(
		&roles.Roles{},
	)
}