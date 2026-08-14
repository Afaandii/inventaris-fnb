package helper

import (
	"fmt"
	"time"
)

func GenerateCodeOutlet(lastNum int) string {
	today := time.Now().Format("20060102")
	nextNumber := lastNum + 1

	return fmt.Sprintf("OUT-%s-%03d", today, nextNumber)
}

func GenerateCodeSupplier(lastNumber int) string {
	today := time.Now().Format("20060102")
	nextNumber := lastNumber + 1

	return fmt.Sprintf("SUP-%s-%03d", today, nextNumber)
}

func GenerateCodeUnits(lastNum int) string {
	today := time.Now().Format("20060102")
	nextNumber := lastNum + 1

	return fmt.Sprintf("UNT-%s-%03d", today, nextNumber)
}

func GenerateCodeWirehouse(lastNum int) string {
	today := time.Now().Format("20060102")
	nextNumber := lastNum + 1

	return fmt.Sprintf("WRH-%s-%03d", today, nextNumber)
}

func GenerateCodeIngredient(lastnum int) string {
	today := time.Now().Format("20060102")
	nextNumber := lastnum + 1

	return fmt.Sprintf("INGR-%s-%03d", today, nextNumber)
}
