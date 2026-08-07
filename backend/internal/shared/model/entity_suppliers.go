package model

import "time"

type Suppliers struct {
	IDSupplier     uint      `json:"id_supplier" gorm:"primaryKey;autoIncrement;column:id_supplier"`
	Npwp           *string   `json:"npwp" gorm:"type:varchar(16);column:npwp"`
	SupplierCode   string    `json:"supplier_code" gorm:"type:varchar(255);column:supplier_code"`
	SupplierName   string    `json:"supplier_name" gorm:"type:varchar(120);column:supplier_name"`
	Email          string    `json:"email" gorm:"type:varchar(125);column:email"`
	Address        string    `json:"address" gorm:"type:text;column:address"`
	City           string    `json:"city" gorm:"type:varchar(120);column:city"`
	ContactPerson  *string   `json:"contact_person" gorm:"type:varchar(20);column:contact_person"`
	BankAccount    string    `json:"bank_account" gorm:"type:varchar(100);column:bank_account"`
	Notes          string    `json:"notes" gorm:"type:text;column:notes"`
	StatusSupplier string    `json:"status_supplier" gorm:"type:status_suppliers;default:'active';column:status_supplier"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (Suppliers) TableName() string {
	return "suppliers"
}
