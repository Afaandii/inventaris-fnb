package recipes

import (
	"backend/internal/shared/model"
	"errors"

	"gorm.io/gorm"
)

type RecipeRepository interface {
	CreateWithTx(tx *gorm.DB, recipe *model.Recipes) error
	CreateItemWithTx(tx *gorm.DB, item *model.RecipeItems) error
	Update(recipe *model.Recipes) error
	Delete(id uint) error
	GetAll(productID, outletID uint, isActive *bool) ([]model.Recipes, error)
	GetByID(id uint) (*model.Recipes, error)
	GetByIDWithTx(tx *gorm.DB, id uint) (*model.Recipes, error)
}

type recipeRepository struct {
	db *gorm.DB
}

func NewRecipeRepository(db *gorm.DB) RecipeRepository {
	return &recipeRepository{db}
}

func (r *recipeRepository) CreateWithTx(tx *gorm.DB, recipe *model.Recipes) error {
	return tx.Create(recipe).Error
}

func (r *recipeRepository) CreateItemWithTx(tx *gorm.DB, item *model.RecipeItems) error {
	return tx.Create(item).Error
}

func (r *recipeRepository) Update(recipe *model.Recipes) error {
	return r.db.Save(recipe).Error
}

func (r *recipeRepository) Delete(id uint) error {
	return r.db.Delete(&model.Recipes{}, id).Error
}

func (r *recipeRepository) GetAll(productID, outletID uint, isActive *bool) ([]model.Recipes, error) {
	var data []model.Recipes
	query := r.db.Preload("Product").
		Preload("Outlet").
		Preload("RecipeItem.Ingredient").
		Preload("RecipeItem.Unit")

	if productID > 0 {
		query = query.Where("product_id = ?", productID)
	}
	if outletID > 0 {
		query = query.Where("outlet_id = ?", outletID)
	}
	if isActive != nil {
		query = query.Where("is_active = ?", *isActive)
	}

	err := query.Order("id_recipe DESC").Find(&data).Error
	return data, err
}

func (r *recipeRepository) GetByID(id uint) (*model.Recipes, error) {
	return r.GetByIDWithTx(r.db, id)
}

func (r *recipeRepository) GetByIDWithTx(tx *gorm.DB, id uint) (*model.Recipes, error) {
	var data model.Recipes
	err := tx.Preload("Product").
		Preload("Outlet").
		Preload("RecipeItem.Ingredient").
		Preload("RecipeItem.Unit").
		First(&data, "id_recipe = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}
