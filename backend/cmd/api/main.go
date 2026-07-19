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
	_, err := database.Connect(cfg)
	if err != nil {
		log.Fatal("connection database: ", err)
	}

	if cfg.PORT == "" {
		cfg.PORT = "8080"
	}

	fmt.Print("Server is running on port: ", cfg.PORT)
	log.Fatal(http.ListenAndServe(":"+cfg.PORT, nil))
}