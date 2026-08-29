package recipes

import (
	"backend/internal/shared/model"
	"errors"
	"fmt"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type CreateRecipeItemInput struct {
	IngredientID uint    `json:"ingredient_id" validate:"required,number,min=1"`
	UnitID       uint    `json:"unit_id" validate:"required,number,min=1"`
	Quantity     float64 `json:"quantity" validate:"required,numeric,gt=0"`
}

type CreateRecipeInput struct {
	ProductID     uint                    `json:"product_id" validate:"required,number,min=1"`
	OutletID      uint                    `json:"outlet_id" validate:"required,number,min=1"`
	YieldQty      float64                 `json:"yield_qty" validate:"required,numeric,gt=0"`
	YieldUnit     string                  `json:"yield_unit" validate:"required"`
	Instruction   string                  `json:"instruction"`
	RecipeVersion string                  `json:"recipe_version" validate:"required"`
	Notes         string                  `json:"notes"`
	IsActive      *bool                   `json:"is_active"`
	Items         []CreateRecipeItemInput `json:"items" validate:"dive"`
}

type UpdateRecipeInput struct {
	ProductID     uint    `json:"product_id" validate:"required,number,min=1"`
	OutletID      uint    `json:"outlet_id" validate:"required,number,min=1"`
	YieldQty      float64 `json:"yield_qty" validate:"required,numeric,gt=0"`
	YieldUnit     string  `json:"yield_unit" validate:"required"`
	Instruction   string  `json:"instruction"`
	RecipeVersion string  `json:"recipe_version" validate:"required"`
	Notes         string  `json:"notes"`
	IsActive      *bool   `json:"is_active"`
}

type RecipeService interface {
	GetAll(productID, outletID uint, isActive *bool) ([]model.Recipes, error)
	GetByID(id uint) (*model.Recipes, error)
	Create(input CreateRecipeInput) (*model.Recipes, error)
	Update(id uint, input UpdateRecipeInput) (*model.Recipes, error)
	Delete(id uint) error
}

type recipeService struct {
	db   *gorm.DB
	repo RecipeRepository
}

func NewRecipeService(db *gorm.DB, repo RecipeRepository) RecipeService {
	return &recipeService{db, repo}
}

func (s *recipeService) GetAll(productID, outletID uint, isActive *bool) ([]model.Recipes, error) {
	return s.repo.GetAll(productID, outletID, isActive)
}

func (s *recipeService) GetByID(id uint) (*model.Recipes, error) {
	return s.repo.GetByID(id)
}

func (s *recipeService) Create(input CreateRecipeInput) (*model.Recipes, error) {
	var product model.Products
	if err := s.db.First(&product, "id_product = ?", input.ProductID).Error; err != nil {
		return nil, errors.New("product tidak ditemukan")
	}

	var outlet model.Outlets
	if err := s.db.First(&outlet, "id_outlet = ?", input.OutletID).Error; err != nil {
		return nil, errors.New("outlet tidak ditemukan")
	}

	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	recipe := &model.Recipes{
		ProductRef:    input.ProductID,
		OutletRef:     input.OutletID,
		YieldQty:      decimal.NewFromFloat(input.YieldQty),
		YieldUnit:     input.YieldUnit,
		Instruction:   input.Instruction,
		RecipeVersion: input.RecipeVersion,
		Notes:         input.Notes,
		IsActive:      isActive,
	}

	if err := s.repo.CreateWithTx(tx, recipe); err != nil {
		tx.Rollback()
		return nil, err
	}

	for _, item := range input.Items {
		var ingredient model.Ingredients
		if err := tx.First(&ingredient, "id_ingredient = ?", item.IngredientID).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("ingredient ID %d tidak ditemukan di master data", item.IngredientID)
		}

		var unit model.Units
		if err := tx.First(&unit, "id_unit = ?", item.UnitID).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("unit ID %d tidak ditemukan di master data", item.UnitID)
		}

		recipeItem := &model.RecipeItems{
			RecipeRef:     recipe.IDRecipe,
			IngredientRef: item.IngredientID,
			UnitRef:       item.UnitID,
			Quantity:      decimal.NewFromFloat(item.Quantity),
		}

		if err := s.repo.CreateItemWithTx(tx, recipeItem); err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.repo.GetByID(recipe.IDRecipe)
}

func (s *recipeService) Update(id uint, input UpdateRecipeInput) (*model.Recipes, error) {
	recipe, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if recipe == nil {
		return nil, errors.New("resep tidak ditemukan")
	}

	var product model.Products
	if err := s.db.First(&product, "id_product = ?", input.ProductID).Error; err != nil {
		return nil, errors.New("product tidak ditemukan")
	}

	var outlet model.Outlets
	if err := s.db.First(&outlet, "id_outlet = ?", input.OutletID).Error; err != nil {
		return nil, errors.New("outlet tidak ditemukan")
	}

	recipe.ProductRef = input.ProductID
	recipe.OutletRef = input.OutletID
	recipe.YieldQty = decimal.NewFromFloat(input.YieldQty)
	recipe.YieldUnit = input.YieldUnit
	recipe.Instruction = input.Instruction
	recipe.RecipeVersion = input.RecipeVersion
	recipe.Notes = input.Notes

	if input.IsActive != nil {
		recipe.IsActive = *input.IsActive
	}

	if err := s.repo.Update(recipe); err != nil {
		return nil, err
	}

	return s.repo.GetByID(recipe.IDRecipe)
}

func (s *recipeService) Delete(id uint) error {
	recipe, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	if recipe == nil {
		return errors.New("resep tidak ditemukan")
	}

	return s.repo.Delete(id)
}
