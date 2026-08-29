package productvariants

import (
	"backend/internal/shared/model"
	"errors"
	"time"

	"gorm.io/gorm"
)

type ProductVariantRepository interface {
	Create(variant *model.ProductVariants) error
	Update(variant *model.ProductVariants) error
	Delete(id uint) error
	GetAll(productID uint, isActive *bool) ([]model.ProductVariants, error)
	GetByID(id uint) (*model.ProductVariants, error)
	CountTodayVariants() (int64, error)
}

type productVariantRepository struct {
	db *gorm.DB
}

func NewProductVariantRepository(db *gorm.DB) ProductVariantRepository {
	return &productVariantRepository{db}
}

func (r *productVariantRepository) Create(variant *model.ProductVariants) error {
	return r.db.Create(variant).Error
}

func (r *productVariantRepository) Update(variant *model.ProductVariants) error {
	return r.db.Save(variant).Error
}

func (r *productVariantRepository) Delete(id uint) error {
	return r.db.Delete(&model.ProductVariants{}, id).Error
}

func (r *productVariantRepository) GetAll(productID uint, isActive *bool) ([]model.ProductVariants, error) {
	var data []model.ProductVariants
	query := r.db.Preload("Product")

	if productID > 0 {
		query = query.Where("product_id = ?", productID)
	}
	if isActive != nil {
		query = query.Where("is_active = ?", *isActive)
	}

	err := query.Order("id_product_variant DESC").Find(&data).Error
	return data, err
}

func (r *productVariantRepository) GetByID(id uint) (*model.ProductVariants, error) {
	var data model.ProductVariants
	err := r.db.Preload("Product").First(&data, "id_product_variant = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}

func (r *productVariantRepository) CountTodayVariants() (int64, error) {
	var count int64
	today := time.Now().Format("2006-01-02")
	err := r.db.Model(&model.ProductVariants{}).
		Where("DATE(created_at) = ?", today).
		Count(&count).Error
	return count, err
}
