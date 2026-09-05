package salesorderitems

import (
	"backend/internal/shared/model"

	"gorm.io/gorm"
)

type SalesOrderItemService interface {
	GetAll(orderID uint) ([]model.SalesOrderItems, error)
	GetByID(id uint) (*model.SalesOrderItems, error)
}

type salesOrderItemService struct {
	db   *gorm.DB
	repo SalesOrderItemRepository
}

func NewSalesOrderItemService(db *gorm.DB, repo SalesOrderItemRepository) SalesOrderItemService {
	return &salesOrderItemService{db, repo}
}

func (s *salesOrderItemService) GetAll(orderID uint) ([]model.SalesOrderItems, error) {
	return s.repo.GetAll(orderID)
}

func (s *salesOrderItemService) GetByID(id uint) (*model.SalesOrderItems, error) {
	return s.repo.GetByID(id)
}
