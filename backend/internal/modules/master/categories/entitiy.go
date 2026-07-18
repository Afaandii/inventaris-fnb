package categories

type Category struct {
	IDCategory uint `json:"id_category" gorm:"primaryKey;autoIncrement;column:id_category"`
}

func (Category) TableName() string {
	return "categories"
}