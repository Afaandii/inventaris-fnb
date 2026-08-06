package helper

import (
	"fmt"
	"strings"

	"gorm.io/gorm"
)

// EnumMap berisi pasangan nama enum dan list nilainya
type EnumMap map[string][]string

// CreatePostgresEnums membuat custom enum type di PostgreSQL jika belum ada
func CreatePostgresEnums(db *gorm.DB, enums EnumMap) error {
	var sqlBuilder strings.Builder
	sqlBuilder.WriteString("DO $$ \nBEGIN\n")

	for enumName, values := range enums {
		// Format nilai enum menjadi 'val1', 'val2', 'val3'
		formattedValues := make([]string, len(values))
		for i, v := range values {
			formattedValues[i] = fmt.Sprintf("'%s'", v)
		}
		enumList := strings.Join(formattedValues, ", ")

		sqlBuilder.WriteString(fmt.Sprintf(`  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '%s') THEN
    CREATE TYPE %s AS ENUM (%s);
  END IF;
  `, enumName, enumName, enumList))
	}

	sqlBuilder.WriteString("END $$;")

	return db.Exec(sqlBuilder.String()).Error
}
