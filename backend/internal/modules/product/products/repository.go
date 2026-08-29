package products

import (
	"backend/internal/shared/model"
	"errors"
	"time"

	"gorm.io/gorm"
)

type ProductRepository interface {
	Create(product *model.Products) error
	Update(product *model.Products) error
	Delete(id uint) error
	GetAll(categoryID uint, prodType string, isActive *bool) ([]model.Products, error)
	GetByID(id uint) (*model.Products, error)
	CountTodayProducts() (int64, error)
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{db}
}

func (r *productRepository) Create(product *model.Products) error {
	return r.db.Create(product).Error
}

func (r *productRepository) Update(product *model.Products) error {
	return r.db.Save(product).Error
}

func (r *productRepository) Delete(id uint) error {
	return r.db.Delete(&model.Products{}, id).Error
}

func (r *productRepository) GetAll(categoryID uint, prodType string, isActive *bool) ([]model.Products, error) {
	var data []model.Products
	query := r.db.Preload("Category").
		Preload("ProductVariant").
		Preload("MenuItem.Outlet").
		Preload("Recipe")

	if categoryID > 0 {
		query = query.Where("category_id = ?", categoryID)
	}
	if prodType != "" {
		query = query.Where("prod_type = ?", prodType)
	}
	if isActive != nil {
		query = query.Where("is_active = ?", *isActive)
	}

	err := query.Order("id_product DESC").Find(&data).Error
	return data, err
}

func (r *productRepository) GetByID(id uint) (*model.Products, error) {
	var data model.Products
	err := r.db.Preload("Category").
		Preload("ProductVariant").
		Preload("MenuItem.Outlet").
		Preload("Recipe.RecipeItem.Ingredient").
		Preload("Recipe.RecipeItem.Unit").
		First(&data, "id_product = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}

func (r *productRepository) CountTodayProducts() (int64, error) {
	var count int64
	today := time.Now().Format("2006-01-02")
	err := r.db.Model(&model.Products{}).
		Where("DATE(created_at) = ?", today).
		Count(&count).Error
	return count, err
}
