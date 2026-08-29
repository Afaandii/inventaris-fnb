package model

import "time"

type Units struct {
	IDUnit    uint      `json:"id_unit" gorm:"primaryKey;autoIncrement;column:id_unit"`
	UnitCode  string    `json:"unit_code" gorm:"type:varchar(255);column:unit_code"`
	UnitName  string    `json:"unit_name" gorm:"type:varchar(120);column:unit_name"`
	Type      string    `json:"type" gorm:"type:type_units;column:type"`
	ShortName string    `json:"short_name" gorm:"type:varchar(20);column:short_name"`
	Status    string    `json:"status" gorm:"type:status_units;default:'active';column:status_unit"`
	IsActive  bool      `json:"is_active" gorm:"type:bool;column:is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Ingredient []Ingredients `gorm:"foreignKey:UnitRef;references:IDUnit;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	StokAdjustment []StokAdjustments `gorm:"foreignKey:UnitRef;references:IDUnit;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	StokTransferItem []StokTransferItems `gorm:"foreignKey:UnitRef;references:IDUnit;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	Waste []Wastes `gorm:"foreignKey:UnitRef;references:IDUnit;constraint:OnDelete:CASCADE;OnUpdate:RESTRICT"`

	StokOpnameItem []StokOpnameItems `gorm:"foreignKey:UnitRef;references:IDUnit;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`

	GoodReceiptItems []GoodReceiptItems `gorm:"foreignKey:UnitRef;references:IDUnit;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`

	PurchaseItem []PurchaseItems `gorm:"foreignKey:UnitRef;references:IDUnit;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`

	RecipeItem []RecipeItems `gorm:"foreignKey:UnitRef;references:IDUnit;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`

	Production []Productions `gorm:"foreignKey:UnitRef;references:IDUnit;constraint:OnUpdate:RESTRICT;OnDelete:CASCADE"`
}

func (Units) TableName() string {
	return "units"
}
