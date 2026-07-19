package ingredients

import "time"

type Ingredients struct {
	IDIngredient uint   `json:"id_ingredient" gorm:"primaryKey;autoIncrement;column:id_ingredient"`
	CategoryRef  uint   `json:"category_id" gorm:"column:category_id"`
	UnitRef      uint   `json:"unit_id" gorm:"column:unit_id"`
	SupplierRef  uint   `json:"supplier_id" gorm:"column:supplier_id"`
	IngreCode    string `json:"ingre_code" gorm:"type:varchar(255);column:ingre_code"`
	IngreName    string `json:"ingre_name" gorm:"type:varchar(255);column:ingre_name"`
	Sku          string `json:"sku" gorm:"type:varchar(255);column:sku"`
	Barcode      string `json:"barcode" gorm:"type:varchar(255);column:barcode"`
	MinStok      uint   `json:"min_stok" gorm:"column:min_stok"`
	MaxStok      uint   `json:"max_stok" gorm:"column:max_stok"`
	CostPrice    *int   `json:"cost_price" gorm:"type:int; column:cost_price"`
	AverageCost  *int   `json:"average_cost" gorm:"type:int;column:average_cost"`
	IsPerishable bool   `json:"is_perishable" gorm:"type:bool;column:is_perishable"`
	ShelfLifeDay *int   `json:"shelf_life_day" gorm:"type:int;column:shelf_life_day"`
	IsActive     bool   `json:"is_active" gorm:"type:bool;column:is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (Ingredients) TableName() string{
	return "ingredients"
}