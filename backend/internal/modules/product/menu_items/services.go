package menuitems

import (
	"backend/internal/shared/model"
	"errors"

	"gorm.io/gorm"
)

type CreateMenuItemInput struct {
	ProductID   uint  `json:"product_id" validate:"required,number,min=1"`
	OutletID    uint  `json:"outlet_id" validate:"required,number,min=1"`
	SortOrder   uint  `json:"sort_order"`
	IsAvailable *bool `json:"is_available"`
}

type UpdateMenuItemInput struct {
	ProductID   uint  `json:"product_id" validate:"required,number,min=1"`
	OutletID    uint  `json:"outlet_id" validate:"required,number,min=1"`
	SortOrder   uint  `json:"sort_order"`
	IsAvailable *bool `json:"is_available"`
}

type MenuItemService interface {
	GetAll(outletID, productID uint, isAvailable *bool) ([]model.MenuItems, error)
	GetByID(id uint) (*model.MenuItems, error)
	GetCatalogByOutlet(outletID uint) ([]model.MenuItems, error)
	Create(input CreateMenuItemInput) (*model.MenuItems, error)
	Update(id uint, input UpdateMenuItemInput) (*model.MenuItems, error)
	Delete(id uint) error
}

type menuItemService struct {
	db   *gorm.DB
	repo MenuItemRepository
}

func NewMenuItemService(db *gorm.DB, repo MenuItemRepository) MenuItemService {
	return &menuItemService{db, repo}
}

func (s *menuItemService) GetAll(outletID, productID uint, isAvailable *bool) ([]model.MenuItems, error) {
	return s.repo.GetAll(outletID, productID, isAvailable)
}

func (s *menuItemService) GetByID(id uint) (*model.MenuItems, error) {
	return s.repo.GetByID(id)
}

func (s *menuItemService) GetCatalogByOutlet(outletID uint) ([]model.MenuItems, error) {
	var outlet model.Outlets
	if err := s.db.First(&outlet, "id_outlet = ?", outletID).Error; err != nil {
		return nil, errors.New("outlet tidak ditemukan")
	}

	return s.repo.GetCatalogByOutlet(outletID)
}

func (s *menuItemService) Create(input CreateMenuItemInput) (*model.MenuItems, error) {
	var product model.Products
	if err := s.db.First(&product, "id_product = ?", input.ProductID).Error; err != nil {
		return nil, errors.New("product tidak ditemukan")
	}

	var outlet model.Outlets
	if err := s.db.First(&outlet, "id_outlet = ?", input.OutletID).Error; err != nil {
		return nil, errors.New("outlet tidak ditemukan di master data")
	}

	var existing model.MenuItems
	if err := s.db.Where("product_id = ? AND outlet_id = ?", input.ProductID, input.OutletID).First(&existing).Error; err == nil {
		return nil, errors.New("menu item untuk produk pada outlet ini sudah terdaftar")
	}

	isAvailable := true
	if input.IsAvailable != nil {
		isAvailable = *input.IsAvailable
	}

	menuItem := &model.MenuItems{
		ProductRef:  input.ProductID,
		OutletRef:   input.OutletID,
		SortOrder:   input.SortOrder,
		IsAvailable: isAvailable,
	}

	if err := s.repo.Create(menuItem); err != nil {
		return nil, err
	}

	return s.repo.GetByID(menuItem.IDMenuItem)
}

func (s *menuItemService) Update(id uint, input UpdateMenuItemInput) (*model.MenuItems, error) {
	menuItem, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if menuItem == nil {
		return nil, errors.New("menu item tidak ditemukan")
	}

	var product model.Products
	if err := s.db.First(&product, "id_product = ?", input.ProductID).Error; err != nil {
		return nil, errors.New("product tidak ditemukan")
	}

	var outlet model.Outlets
	if err := s.db.First(&outlet, "id_outlet = ?", input.OutletID).Error; err != nil {
		return nil, errors.New("outlet tidak ditemukan di master data")
	}

	menuItem.ProductRef = input.ProductID
	menuItem.OutletRef = input.OutletID
	menuItem.SortOrder = input.SortOrder

	if input.IsAvailable != nil {
		menuItem.IsAvailable = *input.IsAvailable
	}

	if err := s.repo.Update(menuItem); err != nil {
		return nil, err
	}

	return s.repo.GetByID(menuItem.IDMenuItem)
}

func (s *menuItemService) Delete(id uint) error {
	menuItem, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	if menuItem == nil {
		return errors.New("menu item tidak ditemukan")
	}

	return s.repo.Delete(id)
}
