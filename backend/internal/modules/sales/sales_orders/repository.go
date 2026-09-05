package salesorders

import (
	"backend/internal/shared/model"
	"errors"
	"time"

	"gorm.io/gorm"
)

type SalesOrderRepository interface {
	CreateWithTx(tx *gorm.DB, order *model.SalesOrders) error
	UpdateWithTx(tx *gorm.DB, order *model.SalesOrders) error
	GetAll(outletID, cashierID, tableID uint, status, paymentStatus, orderType, startDate, endDate string) ([]model.SalesOrders, error)
	GetByID(id uint) (*model.SalesOrders, error)
	GetByIDWithTx(tx *gorm.DB, id uint) (*model.SalesOrders, error)
	CountTodayOrders() (int64, error)
	GetActiveRecipeByProductIDWithTx(tx *gorm.DB, productID, outletID uint) (*model.Recipes, error)
	GetActiveWarehouseByOutletWithTx(tx *gorm.DB, outletID uint) (*model.Wirehouse, error)
}

type salesOrderRepository struct {
	db *gorm.DB
}

func NewSalesOrderRepository(db *gorm.DB) SalesOrderRepository {
	return &salesOrderRepository{db}
}

func (r *salesOrderRepository) CreateWithTx(tx *gorm.DB, order *model.SalesOrders) error {
	return tx.Create(order).Error
}

func (r *salesOrderRepository) UpdateWithTx(tx *gorm.DB, order *model.SalesOrders) error {
	return tx.Save(order).Error
}

func (r *salesOrderRepository) GetAll(outletID, cashierID, tableID uint, status, paymentStatus, orderType, startDate, endDate string) ([]model.SalesOrders, error) {
	var data []model.SalesOrders
	query := r.db.Preload("Outlet").
		Preload("Table").
		Preload("Cashier").
		Preload("Payment").
		Preload("SalesOrderItem.ProductVariant.Product")

	if outletID > 0 {
		query = query.Where("outlet_id = ?", outletID)
	}
	if cashierID > 0 {
		query = query.Where("cashier_id = ?", cashierID)
	}
	if tableID > 0 {
		query = query.Where("table_id = ?", tableID)
	}
	if status != "" {
		query = query.Where("status_order = ?", status)
	}
	if paymentStatus != "" {
		query = query.Where("payment_status = ?", paymentStatus)
	}
	if orderType != "" {
		query = query.Where("order_type = ?", orderType)
	}
	if startDate != "" {
		query = query.Where("DATE(order_date) >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("DATE(order_date) <= ?", endDate)
	}

	err := query.Order("id_sales_order DESC").Find(&data).Error
	return data, err
}

func (r *salesOrderRepository) GetByID(id uint) (*model.SalesOrders, error) {
	return r.GetByIDWithTx(r.db, id)
}

func (r *salesOrderRepository) GetByIDWithTx(tx *gorm.DB, id uint) (*model.SalesOrders, error) {
	var data model.SalesOrders
	err := tx.Preload("Outlet").
		Preload("Table").
		Preload("Cashier").
		Preload("Payment").
		Preload("SalesOrderItem.ProductVariant.Product").
		First(&data, "id_sales_order = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}

func (r *salesOrderRepository) CountTodayOrders() (int64, error) {
	var count int64
	today := time.Now().Format("2006-01-02")
	err := r.db.Model(&model.SalesOrders{}).
		Where("DATE(created_at) = ?", today).
		Count(&count).Error
	return count, err
}

func (r *salesOrderRepository) GetActiveRecipeByProductIDWithTx(tx *gorm.DB, productID, outletID uint) (*model.Recipes, error) {
	var recipe model.Recipes
	query := tx.Preload("RecipeItem.Ingredient").
		Preload("RecipeItem.Unit").
		Where("product_id = ? AND is_active = ?", productID, true)

	if outletID > 0 {
		query = query.Where("outlet_id = ? OR outlet_id = 0", outletID).Order("outlet_id DESC")
	}

	err := query.First(&recipe).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &recipe, nil
}

func (r *salesOrderRepository) GetActiveWarehouseByOutletWithTx(tx *gorm.DB, outletID uint) (*model.Wirehouse, error) {
	var wrh model.Wirehouse
	err := tx.Where("outlet_id = ? AND status = ?", outletID, "active").
		Order("id_wirehouse ASC").
		First(&wrh).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Fallback: gudang pertama yang aktif
			var defaultWrh model.Wirehouse
			if errDefault := tx.Where("status = ?", "active").First(&defaultWrh).Error; errDefault == nil {
				return &defaultWrh, nil
			}
			return nil, nil
		}
		return nil, err
	}
	return &wrh, nil
}
