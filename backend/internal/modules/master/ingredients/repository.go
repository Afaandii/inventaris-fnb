package ingredients

import (
	"backend/internal/shared/model"
	"time"

	"gorm.io/gorm"
)

type IngredientRepository interface {
	FindAll() ([]model.Ingredients, error)
	FindById(id uint) (*model.Ingredients, error)
	Create(ingre *model.Ingredients) error
	Update(ingre *model.Ingredients) error
	Delete(id uint) error
	CountTodayIngredients() (int64, error)
}

type ingredientRepository struct {
	db *gorm.DB
}

func NewIngredientRepository(db *gorm.DB) IngredientRepository {
	return &ingredientRepository{db}
}

func (req *ingredientRepository) FindAll() ([]model.Ingredients, error) {
	var data []model.Ingredients
	err := req.db.Find(&data).Error

	return data, err
}

func (req *ingredientRepository) FindById(id uint) (*model.Ingredients, error) {
	var data model.Ingredients
	err := req.db.First(&data, "id_ingredient = ?", id).Error
	if err != nil {
		return nil, err
	}

	return &data, err
}

func (req *ingredientRepository) Create(ingre *model.Ingredients) error {
	return req.db.Transaction(func(tx *gorm.DB) error {
		err := tx.Create(ingre).Error
		if err != nil {
			return nil
		}

		return nil
	})
}

func (req *ingredientRepository) Update(ingre *model.Ingredients) error {
	return req.db.Transaction(func(tx *gorm.DB) error {
		err := tx.Save(ingre).Error
		if err != nil {
			return nil
		}

		return nil
	})
}

func (req *ingredientRepository) Delete(id uint) error {
	return req.db.Delete(model.Ingredients{}, "id_ingredient = ?", id).Error
}

func (req *ingredientRepository) CountTodayIngredients() (int64, error) {
	var count int64
	today := time.Now().Format("2006-01-02")

	// Menghitung data yang dibuat hari ini berdasarkan created_at
	err := req.db.Model(&model.Outlets{}).
		Where("DATE(created_at) = ?", today).
		Count(&count).Error

	return count, err
}
