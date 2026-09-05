package main

import (
	"backend/internal/modules/inventory/stok_adjustments"
	stokbalances "backend/internal/modules/inventory/stok_balances"
	stokmovements "backend/internal/modules/inventory/stok_movements"
	stokopnames "backend/internal/modules/inventory/stok_opnames"
	"backend/internal/modules/inventory/stok_transfers"
	"backend/internal/modules/inventory/wastes"
	"backend/internal/modules/purchasing/good_receipts"
	"backend/internal/modules/purchasing/purchase_orders"
	menuitems "backend/internal/modules/product/menu_items"
	productvariants "backend/internal/modules/product/product_variants"
	"backend/internal/modules/product/products"
	recipeitems "backend/internal/modules/product/recipe_items"
	"backend/internal/modules/product/recipes"
	"backend/internal/modules/production/productions"
	diningtables "backend/internal/modules/reservations/dining_tables"
	"backend/internal/modules/reservations/reservation"
	"backend/internal/modules/master/categories"
	"backend/internal/modules/master/ingredients"
	"backend/internal/modules/master/outlets"
	"backend/internal/modules/master/roles"
	"backend/internal/modules/master/suppliers"
	"backend/internal/modules/master/units"
	"backend/internal/modules/master/users"
	"backend/internal/modules/master/wirehouses"
	"backend/internal/shared/config"
	"backend/internal/shared/database"
	"backend/internal/shared/middleware"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadDBConfig()
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal("connection database: ", err)
	}

	// menutup pool connection secara otomatis saat aplikasi mati
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get db from gorm: ", err)
	}
	defer sqlDB.Close()

	database.AutoMigrate(db)

	// register routes
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())
	categories.RegisterCategoryRoutes(r, db)
	outlets.RegisterOutletRoutes(r, db)
	roles.RegisterRoleRoutes(r, db)
	users.RegisterUserRoutes(r, db)
	suppliers.RegisterSupplierRoutes(r, db)
	units.RegisterUnitRoutes(r, db)
	wirehouses.RegisterWirehouseRoutes(r, db)
	ingredients.RegisterIngredientRoutes(r, db)

	// Register Inventory Routes
	stMovRepo := stokmovements.NewStokMovementRepository(db)
	stMovService := stokmovements.NewStokMovementService(stMovRepo)
	stokmovements.RegisterStokMovementRoutes(r, db, stMovService)
	stBalService := stokbalances.RegisterStokBalanceRoutes(r, db, stMovService)
	stokadjustments.RegisterRoutes(r, db, stBalService)
	stoktransfers.RegisterRoutes(r, db, stMovService)
	stokopnames.RegisterRoutes(r, db, stBalService)
	wastes.RegisterRoutes(r, db, stBalService)

	// Register Purchasing Routes
	purchaseorders.RegisterRoutes(r, db)
	goodreceipts.RegisterRoutes(r, db, stBalService)

	// Register Product Routes
	products.RegisterRoutes(r, db)
	productvariants.RegisterRoutes(r, db)
	recipes.RegisterRoutes(r, db)
	recipeitems.RegisterRoutes(r, db)
	menuitems.RegisterRoutes(r, db)

	// Register Production Routes
	productions.RegisterRoutes(r, db, stBalService)

	// Register Reservation Routes
	diningtables.RegisterRoutes(r, db)
	reservation.RegisterRoutes(r, db)

	if cfg.PORT == "" {
		cfg.PORT = "8080"
	}

	fmt.Print("Server is running on port: ", cfg.PORT)
	log.Fatal(http.ListenAndServe(":"+cfg.PORT, r))
}
