package recipeitems

import (
	"backend/internal/shared/model"
	"errors"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type CreateRecipeItemDetailInput struct {
	RecipeID     uint    `json:"recipe_id" validate:"required,number,min=1"`
	IngredientID uint    `json:"ingredient_id" validate:"required,number,min=1"`
	UnitID       uint    `json:"unit_id" validate:"required,number,min=1"`
	Quantity     float64 `json:"quantity" validate:"required,numeric,gt=0"`
}

type UpdateRecipeItemDetailInput struct {
	IngredientID uint    `json:"ingredient_id" validate:"required,number,min=1"`
	UnitID       uint    `json:"unit_id" validate:"required,number,min=1"`
	Quantity     float64 `json:"quantity" validate:"required,numeric,gt=0"`
}

type RecipeItemService interface {
	GetAll(recipeID uint) ([]model.RecipeItems, error)
	GetByID(id uint) (*model.RecipeItems, error)
	Create(input CreateRecipeItemDetailInput) (*model.RecipeItems, error)
	Update(id uint, input UpdateRecipeItemDetailInput) (*model.RecipeItems, error)
	Delete(id uint) error
}

type recipeItemService struct {
	db   *gorm.DB
	repo RecipeItemRepository
}

func NewRecipeItemService(db *gorm.DB, repo RecipeItemRepository) RecipeItemService {
	return &recipeItemService{db, repo}
}

func (s *recipeItemService) GetAll(recipeID uint) ([]model.RecipeItems, error) {
	return s.repo.GetAll(recipeID)
}

func (s *recipeItemService) GetByID(id uint) (*model.RecipeItems, error) {
	return s.repo.GetByID(id)
}

func (s *recipeItemService) Create(input CreateRecipeItemDetailInput) (*model.RecipeItems, error) {
	var recipe model.Recipes
	if err := s.db.First(&recipe, "id_recipe = ?", input.RecipeID).Error; err != nil {
		return nil, errors.New("recipe tidak ditemukan")
	}

	var ingredient model.Ingredients
	if err := s.db.First(&ingredient, "id_ingredient = ?", input.IngredientID).Error; err != nil {
		return nil, errors.New("ingredient tidak ditemukan di master data")
	}

	var unit model.Units
	if err := s.db.First(&unit, "id_unit = ?", input.UnitID).Error; err != nil {
		return nil, errors.New("unit tidak ditemukan di master data")
	}

	item := &model.RecipeItems{
		RecipeRef:     input.RecipeID,
		IngredientRef: input.IngredientID,
		UnitRef:       input.UnitID,
		Quantity:      decimal.NewFromFloat(input.Quantity),
	}

	if err := s.repo.Create(item); err != nil {
		return nil, err
	}

	return s.repo.GetByID(item.IDRecipeItems)
}

func (s *recipeItemService) Update(id uint, input UpdateRecipeItemDetailInput) (*model.RecipeItems, error) {
	item, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if item == nil {
		return nil, errors.New("recipe item tidak ditemukan")
	}

	var ingredient model.Ingredients
	if err := s.db.First(&ingredient, "id_ingredient = ?", input.IngredientID).Error; err != nil {
		return nil, errors.New("ingredient tidak ditemukan di master data")
	}

	var unit model.Units
	if err := s.db.First(&unit, "id_unit = ?", input.UnitID).Error; err != nil {
		return nil, errors.New("unit tidak ditemukan di master data")
	}

	item.IngredientRef = input.IngredientID
	item.UnitRef = input.UnitID
	item.Quantity = decimal.NewFromFloat(input.Quantity)

	if err := s.repo.Update(item); err != nil {
		return nil, err
	}

	return s.repo.GetByID(item.IDRecipeItems)
}

func (s *recipeItemService) Delete(id uint) error {
	item, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	if item == nil {
		return errors.New("recipe item tidak ditemukan")
	}

	return s.repo.Delete(id)
}
