package helper

import (
	"fmt"
	"strings"

	"gorm.io/gorm"
)

// EnumMap berisi pasangan nama enum dan list nilainya
type EnumMap map[string][]string

func CreatePostgresEnums(db *gorm.DB, enums EnumMap) error {
	// Cek semua enum yang sudah ada dalam 1 query (< 2ms)
	var existingEnums []string
	err := db.Raw("SELECT typname FROM pg_type WHERE typtype = 'e'").Scan(&existingEnums).Error
	if err != nil {
		return err
	}

	existingMap := make(map[string]bool)
	for _, e := range existingEnums {
		existingMap[e] = true
	}

	// Buat enum satu per satu jika didatabase belum ada
	for enumName, values := range enums {
		// Skip jika menemukan enum name didalam mapping
		if existingMap[enumName] {
			continue
		}

		formattedValue := make([]string, len(values))
		for i, v := range values {
			formattedValue[i] = fmt.Sprintf("'%s'", v)
		}
		enumList := strings.Join(formattedValue, ", ")
		query := fmt.Sprintf("CREATE TYPE %s AS ENUM (%s);", enumName, enumList)
		if err := db.Exec(query).Error; err != nil {
			return err
		}
	}

	return nil
}
