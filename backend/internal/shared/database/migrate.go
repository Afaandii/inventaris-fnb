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
		"status_users":           {"active", "inactive", "suspended", "banned"},
		"type_categories":        {"ingredient", "product", "menu"},
		"status_categories":      {"active", "inactive"},
		"type_units":             {"weight", "volume", "count", "package"},
		"status_units":           {"active", "inactive"},
		"status_outlets":         {"active", "inactive", "renovation", "closed"},
		"status_suppliers":       {"active", "inactive", "blacklist"},
		"status_ingredients":     {"active", "inactive", "discontinued"},
		"status_wirehouses":      {"active", "inactive", "maintenance", "closed"},
		"type_wirehouses":        {"main", "kitchen", "bar", "storage"},
		"reference_type_stmov":   {"good_receipt", "stok_transfer", "stok_adjusment", "stok_opname", "waste", "production", "sales_order"},
		"movement_type_stmov":    {"in", "out", "transfer", "adjustment"},
		"status_transfers":       {"draft", "approved", "completed", "cancelled"},
		"status_opnames":         {"draft", "approved", "completed"},
		"status_receipts":        {"draft", "received", "partial", "completed", "cancelled"},
		"status_purchases":       {"draft", "pending", "approved", "partially_received", "completed", "cancelled", "rejected"},
		"type_products":          {"raw", "prepared", "finished"},
		"status_productions":     {"draft", "in_progress", "completed", "cancelled"},
		"status_reservations":    {"pending", "confirmed", "seated", "completed", "cancelled", "no_show"},
		"status_dining_tables":   {"available", "reserved", "occupied", "cleaning", "inactive"},
		"type_orders":            {"dine_in", "takeaway"},
		"status_orders":          {"draft", "confirmed", "processing", "ready", "completed", "cancelled"},
		"status_payments_orders": {"unpaid", "paid", "failed", "cancelled", "refunded"},
		"payment_methods":        {"cash", "card", "qris", "bank_transfer", "debit_card", "credit_card", "e_wallet"},
		"payment_providers":      {"midtrans", "xendit", "tripay", "doku", "manual"},
		"status_payments":        {"pending", "paid", "failed", "cancelled", "refunded"},
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
		&model.StokBalances{},
		&model.StokMovements{},
		&model.StokAdjustments{},
		&model.StokTransfers{},
		&model.StokTransferItems{},
		&model.StokOpnames{},
		&model.StokOpnameItems{},
		&model.Wastes{},
		&model.PurchaseOrders{},
		&model.PurchaseItems{},
		&model.GoodReceipts{},
		&model.GoodReceiptItems{},
		&model.Products{},
		&model.ProductVariants{},
		&model.Recipes{},
		&model.RecipeItems{},
		&model.MenuItems{},
		&model.Productions{},
		&model.DiningTables{},
		&model.Reservations{},
		&model.SalesOrders{},
		&model.SalesOrderItems{},
		&model.Payments{},
	)

	if err != nil {
		log.Fatal(fmt.Printf("Failed migration database: %v", err))
	}
}
