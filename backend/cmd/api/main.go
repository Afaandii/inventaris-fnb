package main

import (
	"backend/internal/shared/config"
	"backend/internal/shared/database"
	"fmt"
	"log"
	"net/http"
)

func main(){
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

	if cfg.PORT == "" {
		cfg.PORT = "8080"
	}

	fmt.Print("Server is running on port: ", cfg.PORT)
	log.Fatal(http.ListenAndServe(":"+cfg.PORT, nil))
}