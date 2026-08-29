package menuitems

import (
	"backend/internal/shared/model"
	"errors"

	"gorm.io/gorm"
)

type MenuItemRepository interface {
	Create(menuItem *model.MenuItems) error
	Update(menuItem *model.MenuItems) error
	Delete(id uint) error
	GetAll(outletID, productID uint, isAvailable *bool) ([]model.MenuItems, error)
	GetByID(id uint) (*model.MenuItems, error)
	GetCatalogByOutlet(outletID uint) ([]model.MenuItems, error)
}

type menuItemRepository struct {
	db *gorm.DB
}

func NewMenuItemRepository(db *gorm.DB) MenuItemRepository {
	return &menuItemRepository{db}
}

func (r *menuItemRepository) Create(menuItem *model.MenuItems) error {
	return r.db.Create(menuItem).Error
}

func (r *menuItemRepository) Update(menuItem *model.MenuItems) error {
	return r.db.Save(menuItem).Error
}

func (r *menuItemRepository) Delete(id uint) error {
	return r.db.Delete(&model.MenuItems{}, id).Error
}

func (r *menuItemRepository) GetAll(outletID, productID uint, isAvailable *bool) ([]model.MenuItems, error) {
	var data []model.MenuItems
	query := r.db.Preload("Product.Category").
		Preload("Product.ProductVariant").
		Preload("Outlet")

	if outletID > 0 {
		query = query.Where("outlet_id = ?", outletID)
	}
	if productID > 0 {
		query = query.Where("product_id = ?", productID)
	}
	if isAvailable != nil {
		query = query.Where("is_available = ?", *isAvailable)
	}

	err := query.Order("sort_order ASC, id_menu_item DESC").Find(&data).Error
	return data, err
}

func (r *menuItemRepository) GetByID(id uint) (*model.MenuItems, error) {
	var data model.MenuItems
	err := r.db.Preload("Product.Category").
		Preload("Product.ProductVariant").
		Preload("Outlet").
		First(&data, "id_menu_item = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}

func (r *menuItemRepository) GetCatalogByOutlet(outletID uint) ([]model.MenuItems, error) {
	var data []model.MenuItems
	err := r.db.Preload("Product.Category").
		Preload("Product.ProductVariant", "is_active = ? AND is_available = ?", true, true).
		Preload("Outlet").
		Where("outlet_id = ? AND is_available = ?", outletID, true).
		Order("sort_order ASC").
		Find(&data).Error
	return data, err
}
