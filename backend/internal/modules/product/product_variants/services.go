package productvariants

import (
	"backend/internal/shared/model"
	"backend/pkg/helper"
	"errors"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type CreateVariantInput struct {
	ProductID   uint    `json:"product_id" validate:"required,number,min=1"`
	VariantName string  `json:"variant_name" validate:"required,min=1"`
	SellPrice   float64 `json:"sell_price" validate:"required,numeric,gte=0"`
	CostPrice   float64 `json:"cost_price" validate:"required,numeric,gte=0"`
	Barcode     string  `json:"barcode"`
	IsAvailable *bool   `json:"is_available"`
	IsActive    *bool   `json:"is_active"`
}

type UpdateVariantInput struct {
	ProductID   uint    `json:"product_id" validate:"required,number,min=1"`
	VariantName string  `json:"variant_name" validate:"required,min=1"`
	SellPrice   float64 `json:"sell_price" validate:"required,numeric,gte=0"`
	CostPrice   float64 `json:"cost_price" validate:"required,numeric,gte=0"`
	Barcode     string  `json:"barcode"`
	IsAvailable *bool   `json:"is_available"`
	IsActive    *bool   `json:"is_active"`
}

type ProductVariantService interface {
	GetAll(productID uint, isActive *bool) ([]model.ProductVariants, error)
	GetByID(id uint) (*model.ProductVariants, error)
	Create(input CreateVariantInput) (*model.ProductVariants, error)
	Update(id uint, input UpdateVariantInput) (*model.ProductVariants, error)
	Delete(id uint) error
}

type productVariantService struct {
	db   *gorm.DB
	repo ProductVariantRepository
}

func NewProductVariantService(db *gorm.DB, repo ProductVariantRepository) ProductVariantService {
	return &productVariantService{db, repo}
}

func (s *productVariantService) GetAll(productID uint, isActive *bool) ([]model.ProductVariants, error) {
	return s.repo.GetAll(productID, isActive)
}

func (s *productVariantService) GetByID(id uint) (*model.ProductVariants, error) {
	return s.repo.GetByID(id)
}

func (s *productVariantService) Create(input CreateVariantInput) (*model.ProductVariants, error) {
	var product model.Products
	if err := s.db.First(&product, "id_product = ?", input.ProductID).Error; err != nil {
		return nil, errors.New("product tidak ditemukan")
	}

	count, err := s.repo.CountTodayVariants()
	if err != nil {
		return nil, err
	}
	variantCode := helper.GenerateCodeVariant(int(count))

	isAvailable := true
	if input.IsAvailable != nil {
		isAvailable = *input.IsAvailable
	}

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	variant := &model.ProductVariants{
		ProductRef:  input.ProductID,
		VariantCode: variantCode,
		VariantName: input.VariantName,
		SellPrice:   decimal.NewFromFloat(input.SellPrice),
		CostPrice:   decimal.NewFromFloat(input.CostPrice),
		Barcode:     input.Barcode,
		IsAvailable: isAvailable,
		IsActive:    isActive,
	}

	if err := s.repo.Create(variant); err != nil {
		return nil, err
	}

	return s.repo.GetByID(variant.IDProductVariant)
}

func (s *productVariantService) Update(id uint, input UpdateVariantInput) (*model.ProductVariants, error) {
	variant, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if variant == nil {
		return nil, errors.New("varian produk tidak ditemukan")
	}

	var product model.Products
	if err := s.db.First(&product, "id_product = ?", input.ProductID).Error; err != nil {
		return nil, errors.New("product tidak ditemukan")
	}

	variant.ProductRef = input.ProductID
	variant.VariantName = input.VariantName
	variant.SellPrice = decimal.NewFromFloat(input.SellPrice)
	variant.CostPrice = decimal.NewFromFloat(input.CostPrice)
	variant.Barcode = input.Barcode

	if input.IsAvailable != nil {
		variant.IsAvailable = *input.IsAvailable
	}
	if input.IsActive != nil {
		variant.IsActive = *input.IsActive
	}

	if err := s.repo.Update(variant); err != nil {
		return nil, err
	}

	return s.repo.GetByID(variant.IDProductVariant)
}

func (s *productVariantService) Delete(id uint) error {
	variant, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	if variant == nil {
		return errors.New("varian produk tidak ditemukan")
	}

	return s.repo.Delete(id)
}
