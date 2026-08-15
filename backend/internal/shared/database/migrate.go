package database

import (
	"backend/internal/shared/model"
	"backend/pkg/helper"
	"fmt"
	"log"

	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB) {
	/** Create enum type data **/
	enums := helper.EnumMap{
		"status_users":         {"active", "inactive", "suspended", "banned"},
		"type_categories":      {"ingredient", "product", "menu"},
		"status_categories":    {"active", "inactive"},
		"type_units":           {"weight", "volume", "count", "package"},
		"status_units":         {"active", "inactive"},
		"status_outlets":       {"active", "inactive", "renovation", "closed"},
		"status_suppliers":     {"active", "inactive", "blacklist"},
		"status_ingredients":   {"active", "inactive", "discontinued"},
		"status_wirehouses":    {"active", "inactive", "maintenance", "closed"},
		"type_wirehouses":      {"main", "kitchen", "bar", "storage"},
		"reference_type_stmov": {"good_receipt", "stok_transfer", "stok_adjusment", "stok_opname", "waste", "production", "sales_order"},
		"movement_type_stmov":  {"in", "out", "transfer", "adjustment"},
	}

	// 2. Eksekusi pembuatannya lewat helper
	if err := helper.CreatePostgresEnums(db, enums); err != nil {
		log.Fatalf("Gagal membuat enum types: %v", err)
	}

	// db.Migrator().DropTable(
	// 	&model.Roles{},
	// 	&model.Category{},
	// 	&model.Suppliers{},
	// 	&model.Outlets{},
	// 	&model.Units{},
	// 	&model.Users{},
	// 	&model.Wirehouse{},
	// 	&model.Ingredients{},
	// )
	err := db.AutoMigrate(
		&model.Roles{},
		&model.Category{},
		&model.Suppliers{},
		&model.Outlets{},
		&model.Units{},
		&model.Users{},
		&model.Wirehouse{},
		&model.Ingredients{},
	)

	if err != nil {
		log.Fatal(fmt.Printf("Failed migration database: %v", err))
	}
}
