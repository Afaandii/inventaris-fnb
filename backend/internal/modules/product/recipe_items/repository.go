package recipeitems

import (
	"backend/internal/shared/model"
	"errors"

	"gorm.io/gorm"
)

type RecipeItemRepository interface {
	Create(item *model.RecipeItems) error
	Update(item *model.RecipeItems) error
	Delete(id uint) error
	GetAll(recipeID uint) ([]model.RecipeItems, error)
	GetByID(id uint) (*model.RecipeItems, error)
}

type recipeItemRepository struct {
	db *gorm.DB
}

func NewRecipeItemRepository(db *gorm.DB) RecipeItemRepository {
	return &recipeItemRepository{db}
}

func (r *recipeItemRepository) Create(item *model.RecipeItems) error {
	return r.db.Create(item).Error
}

func (r *recipeItemRepository) Update(item *model.RecipeItems) error {
	return r.db.Save(item).Error
}

func (r *recipeItemRepository) Delete(id uint) error {
	return r.db.Delete(&model.RecipeItems{}, id).Error
}

func (r *recipeItemRepository) GetAll(recipeID uint) ([]model.RecipeItems, error) {
	var data []model.RecipeItems
	query := r.db.Preload("Recipe").
		Preload("Ingredient").
		Preload("Unit")

	if recipeID > 0 {
		query = query.Where("recipe_id = ?", recipeID)
	}

	err := query.Order("id_recipe_item DESC").Find(&data).Error
	return data, err
}

func (r *recipeItemRepository) GetByID(id uint) (*model.RecipeItems, error) {
	var data model.RecipeItems
	err := r.db.Preload("Recipe").
		Preload("Ingredient").
		Preload("Unit").
		First(&data, "id_recipe_item = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}
