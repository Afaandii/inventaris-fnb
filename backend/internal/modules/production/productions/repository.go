package productions

import (
	"backend/internal/shared/model"
	"errors"

	"gorm.io/gorm"
)

type ProductionRepository interface {
	Create(production *model.Productions) error
	UpdateWithTx(tx *gorm.DB, production *model.Productions) error
	Delete(id uint) error
	GetAll(productID, warehouseID, outletID uint, status string) ([]model.Productions, error)
	GetByID(id uint) (*model.Productions, error)
	GetByIDWithTx(tx *gorm.DB, id uint) (*model.Productions, error)
	GetActiveRecipeByProductIDWithTx(tx *gorm.DB, productID uint) (*model.Recipes, error)
	GetAvailableStockByIngredientAndWarehouseWithTx(tx *gorm.DB, ingredientID, warehouseID uint) (uint, error)
}

type productionRepository struct {
	db *gorm.DB
}

func NewProductionRepository(db *gorm.DB) ProductionRepository {
	return &productionRepository{db}
}

func (r *productionRepository) Create(production *model.Productions) error {
	return r.db.Create(production).Error
}

func (r *productionRepository) UpdateWithTx(tx *gorm.DB, production *model.Productions) error {
	return tx.Save(production).Error
}

func (r *productionRepository) Delete(id uint) error {
	return r.db.Delete(&model.Productions{}, id).Error
}

func (r *productionRepository) GetAll(productID, warehouseID, outletID uint, status string) ([]model.Productions, error) {
	var data []model.Productions
	query := r.db.Preload("Outlet").
		Preload("Warehouse").
		Preload("Unit").
		Preload("CreatedByUsr").
		Preload("Product.Category")

	if productID > 0 {
		query = query.Where("product_id = ?", productID)
	}
	if warehouseID > 0 {
		query = query.Where("warehouse_id = ?", warehouseID)
	}
	if outletID > 0 {
		query = query.Where("outlet_id = ?", outletID)
	}
	if status != "" {
		query = query.Where("status_production = ?", status)
	}

	err := query.Order("production_date DESC, id_production DESC").Find(&data).Error
	return data, err
}

func (r *productionRepository) GetByID(id uint) (*model.Productions, error) {
	return r.GetByIDWithTx(r.db, id)
}

func (r *productionRepository) GetByIDWithTx(tx *gorm.DB, id uint) (*model.Productions, error) {
	var data model.Productions
	err := tx.Preload("Outlet").
		Preload("Warehouse").
		Preload("Unit").
		Preload("CreatedByUsr").
		Preload("Product.Category").
		First(&data, "id_production = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}

func (r *productionRepository) GetActiveRecipeByProductIDWithTx(tx *gorm.DB, productID uint) (*model.Recipes, error) {
	var recipe model.Recipes
	err := tx.Preload("RecipeItem.Ingredient").
		Preload("RecipeItem.Unit").
		Where("product_id = ? AND is_active = ?", productID, true).
		First(&recipe).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &recipe, nil
}

func (r *productionRepository) GetAvailableStockByIngredientAndWarehouseWithTx(tx *gorm.DB, ingredientID, warehouseID uint) (uint, error) {
	var balances []model.StokBalances
	err := tx.Where("ingredient_id = ? AND wirehouse_id = ?", ingredientID, warehouseID).Find(&balances).Error
	if err != nil {
		return 0, err
	}

	var totalAvailable uint = 0
	for _, b := range balances {
		totalAvailable += b.AvailableQty
	}
	return totalAvailable, nil
}
