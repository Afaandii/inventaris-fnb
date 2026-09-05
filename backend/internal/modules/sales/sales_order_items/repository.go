package salesorderitems

import (
	"backend/internal/shared/model"
	"errors"

	"gorm.io/gorm"
)

type SalesOrderItemRepository interface {
	GetAll(orderID uint) ([]model.SalesOrderItems, error)
	GetByID(id uint) (*model.SalesOrderItems, error)
}

type salesOrderItemRepository struct {
	db *gorm.DB
}

func NewSalesOrderItemRepository(db *gorm.DB) SalesOrderItemRepository {
	return &salesOrderItemRepository{db}
}

func (r *salesOrderItemRepository) GetAll(orderID uint) ([]model.SalesOrderItems, error) {
	var data []model.SalesOrderItems
	query := r.db.Preload("ProductVariant.Product")

	if orderID > 0 {
		query = query.Where("sales_order_id = ?", orderID)
	}

	err := query.Order("id_sales_order_item ASC").Find(&data).Error
	return data, err
}

func (r *salesOrderItemRepository) GetByID(id uint) (*model.SalesOrderItems, error) {
	var data model.SalesOrderItems
	err := r.db.Preload("ProductVariant.Product").First(&data, "id_sales_order_item = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}
