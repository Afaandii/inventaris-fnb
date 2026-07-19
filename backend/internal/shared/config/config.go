package config

import (
	"log"
	"os"
	"path/filepath"
	"runtime"

	"github.com/joho/godotenv"
)

type DBConfig struct {
	DB_HOST     string
	DB_PORT     string
	DB_USER     string
	DB_PASSWORD string
	DB_NAME     string
	PORT        string
}

func LoadDBConfig() *DBConfig {
	// cari file absolute dari file config ini berada
	_, b, _, _ := runtime.Caller(0)
	// mendapatkan basepath dari config ini
	basePath := filepath.Dir(b)
	// naikan ke folder diatasnya alias root folder
	rootPath := filepath.Join(basePath, "..", "..", "..")
	// gabungkan root path dengan file .env
	envPath := filepath.Join(rootPath, ".env")
	err := godotenv.Load(envPath)
	if err != nil{
		log.Println(".env not found or failed to load!")
	}

	return &DBConfig{
		DB_HOST:    		os.Getenv("DB_HOST"),
		DB_PORT: 				os.Getenv("DB_PORT"),
		DB_USER: 				os.Getenv("DB_USER"),
		DB_PASSWORD: 		os.Getenv("DB_PASSWORD"),
		DB_NAME: 				os.Getenv("DB_NAME"),
		PORT: 					os.Getenv("PORT"),
	}
}