package product_test

import (
	menuitems "backend/internal/modules/product/menu_items"
	productvariants "backend/internal/modules/product/product_variants"
	products "backend/internal/modules/product/products"
	recipeitems "backend/internal/modules/product/recipe_items"
	recipes "backend/internal/modules/product/recipes"
	"backend/internal/shared/model"
	"time"

	"github.com/shopspring/decimal"
)

// ========================
// MOCK PRODUCTS SERVICE
// ========================

type MockProductService struct {
	Products []model.Products
	Err      error
}

func (m *MockProductService) GetAll(categoryID uint, prodType string, isActive *bool) ([]model.Products, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	var res []model.Products
	for _, p := range m.Products {
		if categoryID > 0 && p.CategoryRef != categoryID {
			continue
		}
		if prodType != "" && p.ProdType != prodType {
			continue
		}
		if isActive != nil && p.IsActive != *isActive {
			continue
		}
		res = append(res, p)
	}
	return res, nil
}

func (m *MockProductService) GetByID(id uint) (*model.Products, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, p := range m.Products {
		if p.IDProduct == id {
			return &p, nil
		}
	}
	return nil, nil
}

func (m *MockProductService) Create(input products.CreateProductInput) (*model.Products, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	isAvail := true
	if input.IsAvailable != nil {
		isAvail = *input.IsAvailable
	}
	isAct := true
	if input.IsActive != nil {
		isAct = *input.IsActive
	}
	p := &model.Products{
		IDProduct:      1,
		CategoryRef:    input.CategoryID,
		ProdCode:       "PRD-20261025-001",
		ProdName:       input.ProdName,
		Slug:           "kopi-susu",
		Sku:            input.Sku,
		ProdType:       input.ProdType,
		IsAvailable:    isAvail,
		IsActive:       isAct,
		Description:    input.Description,
		ProdThumbnails: input.ProdThumbnails,
	}
	return p, nil
}

func (m *MockProductService) Update(id uint, input products.UpdateProductInput) (*model.Products, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for i, p := range m.Products {
		if p.IDProduct == id {
			m.Products[i].ProdName = input.ProdName
			m.Products[i].CategoryRef = input.CategoryID
			return &m.Products[i], nil
		}
	}
	return &model.Products{
		IDProduct:   id,
		CategoryRef: input.CategoryID,
		ProdName:    input.ProdName,
	}, nil
}

func (m *MockProductService) Delete(id uint) error {
	return m.Err
}

// ========================
// MOCK PRODUCT VARIANTS SERVICE
// ========================

type MockProductVariantService struct {
	Variants []model.ProductVariants
	Err      error
}

func (m *MockProductVariantService) GetAll(productID uint, isActive *bool) ([]model.ProductVariants, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	var res []model.ProductVariants
	for _, v := range m.Variants {
		if productID > 0 && v.ProductRef != productID {
			continue
		}
		if isActive != nil && v.IsActive != *isActive {
			continue
		}
		res = append(res, v)
	}
	return res, nil
}

func (m *MockProductVariantService) GetByID(id uint) (*model.ProductVariants, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, v := range m.Variants {
		if v.IDProductVariant == id {
			return &v, nil
		}
	}
	return nil, nil
}

func (m *MockProductVariantService) Create(input productvariants.CreateVariantInput) (*model.ProductVariants, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	v := &model.ProductVariants{
		IDProductVariant: 1,
		ProductRef:       input.ProductID,
		VariantCode:      "VAR-20261025-001",
		VariantName:      input.VariantName,
		SellPrice:        decimal.NewFromFloat(input.SellPrice),
		CostPrice:        decimal.NewFromFloat(input.CostPrice),
		Barcode:          input.Barcode,
		IsAvailable:      true,
		IsActive:         true,
	}
	return v, nil
}

func (m *MockProductVariantService) Update(id uint, input productvariants.UpdateVariantInput) (*model.ProductVariants, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for i, v := range m.Variants {
		if v.IDProductVariant == id {
			m.Variants[i].VariantName = input.VariantName
			m.Variants[i].SellPrice = decimal.NewFromFloat(input.SellPrice)
			return &m.Variants[i], nil
		}
	}
	return &model.ProductVariants{
		IDProductVariant: id,
		ProductRef:       input.ProductID,
		VariantName:      input.VariantName,
	}, nil
}

func (m *MockProductVariantService) Delete(id uint) error {
	return m.Err
}

// ========================
// MOCK MENU ITEMS SERVICE
// ========================

type MockMenuItemService struct {
	MenuItems []model.MenuItems
	Err       error
}

func (m *MockMenuItemService) GetAll(outletID, productID uint, isAvailable *bool) ([]model.MenuItems, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.MenuItems, nil
}

func (m *MockMenuItemService) GetByID(id uint) (*model.MenuItems, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, mi := range m.MenuItems {
		if mi.IDMenuItem == id {
			return &mi, nil
		}
	}
	return nil, nil
}

func (m *MockMenuItemService) GetCatalogByOutlet(outletID uint) ([]model.MenuItems, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.MenuItems, nil
}

func (m *MockMenuItemService) Create(input menuitems.CreateMenuItemInput) (*model.MenuItems, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	mi := &model.MenuItems{
		IDMenuItem:  1,
		ProductRef:  input.ProductID,
		OutletRef:   input.OutletID,
		SortOrder:   input.SortOrder,
		IsAvailable: true,
	}
	return mi, nil
}

func (m *MockMenuItemService) Update(id uint, input menuitems.UpdateMenuItemInput) (*model.MenuItems, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return &model.MenuItems{
		IDMenuItem:  id,
		ProductRef:  input.ProductID,
		OutletRef:   input.OutletID,
		SortOrder:   input.SortOrder,
		IsAvailable: true,
	}, nil
}

func (m *MockMenuItemService) Delete(id uint) error {
	return m.Err
}

// ========================
// MOCK RECIPES SERVICE
// ========================

type MockRecipeService struct {
	Recipes []model.Recipes
	Err     error
}

func (m *MockRecipeService) GetAll(productID, outletID uint, isActive *bool) ([]model.Recipes, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.Recipes, nil
}

func (m *MockRecipeService) GetByID(id uint) (*model.Recipes, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, r := range m.Recipes {
		if r.IDRecipe == id {
			return &r, nil
		}
	}
	return nil, nil
}

func (m *MockRecipeService) Create(input recipes.CreateRecipeInput) (*model.Recipes, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	r := &model.Recipes{
		IDRecipe:      1,
		ProductRef:    input.ProductID,
		OutletRef:     input.OutletID,
		YieldQty:      decimal.NewFromFloat(input.YieldQty),
		YieldUnit:     input.YieldUnit,
		Instruction:   input.Instruction,
		RecipeVersion: input.RecipeVersion,
		Notes:         input.Notes,
		IsActive:      true,
	}
	return r, nil
}

func (m *MockRecipeService) Update(id uint, input recipes.UpdateRecipeInput) (*model.Recipes, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return &model.Recipes{
		IDRecipe:      id,
		ProductRef:    input.ProductID,
		OutletRef:     input.OutletID,
		YieldQty:      decimal.NewFromFloat(input.YieldQty),
		YieldUnit:     input.YieldUnit,
		Instruction:   input.Instruction,
		RecipeVersion: input.RecipeVersion,
		Notes:         input.Notes,
		IsActive:      true,
	}, nil
}

func (m *MockRecipeService) Delete(id uint) error {
	return m.Err
}

// ========================
// MOCK RECIPE ITEMS SERVICE
// ========================

type MockRecipeItemService struct {
	Items []model.RecipeItems
	Err   error
}

func (m *MockRecipeItemService) GetAll(recipeID uint) ([]model.RecipeItems, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.Items, nil
}

func (m *MockRecipeItemService) GetByID(id uint) (*model.RecipeItems, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, it := range m.Items {
		if it.IDRecipeItems == id {
			return &it, nil
		}
	}
	return nil, nil
}

func (m *MockRecipeItemService) Create(input recipeitems.CreateRecipeItemDetailInput) (*model.RecipeItems, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	it := &model.RecipeItems{
		IDRecipeItems: 1,
		RecipeRef:     input.RecipeID,
		IngredientRef: input.IngredientID,
		UnitRef:       input.UnitID,
		Quantity:      decimal.NewFromFloat(input.Quantity),
		CreatedAt:     time.Now(),
	}
	return it, nil
}

func (m *MockRecipeItemService) Update(id uint, input recipeitems.UpdateRecipeItemDetailInput) (*model.RecipeItems, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return &model.RecipeItems{
		IDRecipeItems: id,
		IngredientRef: input.IngredientID,
		UnitRef:       input.UnitID,
		Quantity:      decimal.NewFromFloat(input.Quantity),
	}, nil
}

func (m *MockRecipeItemService) Delete(id uint) error {
	return m.Err
}
