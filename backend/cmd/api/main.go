package main

import (
	"backend/internal/modules/master/categories"
	"backend/internal/modules/master/outlets"
	"backend/internal/modules/master/roles"
	"backend/internal/modules/master/suppliers"
	"backend/internal/modules/master/units"
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
	categories.RegisterRoutesCategory(r, db)
	outlets.RegisterOutletRoutes(r, db)
	roles.RegisterRoutesRole(r, db)
	suppliers.RegisterSupplierRoutes(r, db)
	units.RegisterUnitRoute(r, db)
	wirehouses.RegisterWirehouseRoute(r, db)

	if cfg.PORT == "" {
		cfg.PORT = "8080"
	}

	fmt.Print("Server is running on port: ", cfg.PORT)
	log.Fatal(http.ListenAndServe(":"+cfg.PORT, nil))
}
