package products

import (
	"backend/internal/shared/model"
	"backend/pkg/helper"
	"errors"
	"regexp"
	"strings"

	"gorm.io/gorm"
)

type CreateProductInput struct {
	CategoryID     uint   `json:"category_id" validate:"required,number,min=1"`
	ProdName       string `json:"prod_name" validate:"required,min=2"`
	Sku            string `json:"sku"`
	ProdType       string `json:"prod_type" validate:"required,oneof=raw prepared finished"`
	IsAvailable    *bool  `json:"is_available"`
	IsActive       *bool  `json:"is_active"`
	Description    string `json:"description"`
	ProdThumbnails string `json:"prod_thumbnail"`
}

type UpdateProductInput struct {
	CategoryID     uint   `json:"category_id" validate:"required,number,min=1"`
	ProdName       string `json:"prod_name" validate:"required,min=2"`
	Sku            string `json:"sku"`
	ProdType       string `json:"prod_type" validate:"required,oneof=raw prepared finished"`
	IsAvailable    *bool  `json:"is_available"`
	IsActive       *bool  `json:"is_active"`
	Description    string `json:"description"`
	ProdThumbnails string `json:"prod_thumbnail"`
}

type ProductService interface {
	GetAll(categoryID uint, prodType string, isActive *bool) ([]model.Products, error)
	GetByID(id uint) (*model.Products, error)
	Create(input CreateProductInput) (*model.Products, error)
	Update(id uint, input UpdateProductInput) (*model.Products, error)
	Delete(id uint) error
}

type productService struct {
	db   *gorm.DB
	repo ProductRepository
}

func NewProductService(db *gorm.DB, repo ProductRepository) ProductService {
	return &productService{db, repo}
}

func generateSlug(name string) string {
	slug := strings.ToLower(name)
	reg := regexp.MustCompile("[^a-z0-9]+")
	slug = reg.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	return slug
}

func (s *productService) GetAll(categoryID uint, prodType string, isActive *bool) ([]model.Products, error) {
	return s.repo.GetAll(categoryID, prodType, isActive)
}

func (s *productService) GetByID(id uint) (*model.Products, error) {
	return s.repo.GetByID(id)
}

func (s *productService) Create(input CreateProductInput) (*model.Products, error) {
	var category model.Category
	if err := s.db.First(&category, "id_category = ?", input.CategoryID).Error; err != nil {
		return nil, errors.New("category tidak ditemukan di master data")
	}

	count, err := s.repo.CountTodayProducts()
	if err != nil {
		return nil, err
	}
	prodCode := helper.GenerateCodeProduct(int(count))

	slug := generateSlug(input.ProdName)

	isAvailable := true
	if input.IsAvailable != nil {
		isAvailable = *input.IsAvailable
	}

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	product := &model.Products{
		CategoryRef:    input.CategoryID,
		ProdCode:       prodCode,
		ProdName:       input.ProdName,
		Slug:           slug,
		Sku:            input.Sku,
		ProdType:       input.ProdType,
		IsAvailable:    isAvailable,
		IsActive:       isActive,
		Description:    input.Description,
		ProdThumbnails: input.ProdThumbnails,
	}

	if err := s.repo.Create(product); err != nil {
		return nil, err
	}

	return s.repo.GetByID(product.IDProduct)
}

func (s *productService) Update(id uint, input UpdateProductInput) (*model.Products, error) {
	product, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, errors.New("produk tidak ditemukan")
	}

	var category model.Category
	if err := s.db.First(&category, "id_category = ?", input.CategoryID).Error; err != nil {
		return nil, errors.New("category tidak ditemukan di master data")
	}

	product.CategoryRef = input.CategoryID
	product.ProdName = input.ProdName
	product.Slug = generateSlug(input.ProdName)
	product.Sku = input.Sku
	product.ProdType = input.ProdType
	product.Description = input.Description
	product.ProdThumbnails = input.ProdThumbnails

	if input.IsAvailable != nil {
		product.IsAvailable = *input.IsAvailable
	}
	if input.IsActive != nil {
		product.IsActive = *input.IsActive
	}

	if err := s.repo.Update(product); err != nil {
		return nil, err
	}

	return s.repo.GetByID(product.IDProduct)
}

func (s *productService) Delete(id uint) error {
	product, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	if product == nil {
		return errors.New("produk tidak ditemukan")
	}

	return s.repo.Delete(id)
}
