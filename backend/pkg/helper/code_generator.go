package helper

import (
	"fmt"
	"time"
)

func GenerateCode(lastNum int) string {
	today := time.Now().Format("20060102")
	nextNumber := lastNum + 1

	return fmt.Sprintf("OUT-%s-%03d", today, nextNumber)
}
