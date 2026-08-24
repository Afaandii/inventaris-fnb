package purchaseorders

import (
	"backend/internal/shared/model"
	"errors"
	"time"

	"gorm.io/gorm"
)

type PurchaseOrderRepository interface {
	CreateWithTx(tx *gorm.DB, po *model.PurchaseOrders) error
	CreateItemWithTx(tx *gorm.DB, item *model.PurchaseItems) error
	UpdateWithTx(tx *gorm.DB, po *model.PurchaseOrders) error
	UpdateItemWithTx(tx *gorm.DB, item *model.PurchaseItems) error
	GetAll(supplierID, warehouseID uint, status string) ([]model.PurchaseOrders, error)
	GetByID(id uint) (*model.PurchaseOrders, error)
	GetByIDWithTx(tx *gorm.DB, id uint) (*model.PurchaseOrders, error)
	CountTodayPO() (int64, error)
}

type purchaseOrderRepository struct {
	db *gorm.DB
}

func NewPurchaseOrderRepository(db *gorm.DB) PurchaseOrderRepository {
	return &purchaseOrderRepository{db}
}

func (r *purchaseOrderRepository) CreateWithTx(tx *gorm.DB, po *model.PurchaseOrders) error {
	return tx.Create(po).Error
}

func (r *purchaseOrderRepository) CreateItemWithTx(tx *gorm.DB, item *model.PurchaseItems) error {
	return tx.Transaction(func(trans *gorm.DB) error {
		if err := trans.Create(item).Error; err != nil {
			return nil
		}

		return nil
	})
}

func (r *purchaseOrderRepository) UpdateWithTx(tx *gorm.DB, po *model.PurchaseOrders) error {
	// untuk update by status saja jadi menyesuaikan value dari json
	return tx.Model(po).Where("id_purchase = ?", po.IDPurchase).Updates(po).Error
}

func (r *purchaseOrderRepository) UpdateItemWithTx(tx *gorm.DB, item *model.PurchaseItems) error {
	return tx.Transaction(func(trans *gorm.DB) error {
		if err := trans.Save(item).Error; err != nil {
			return nil
		}

		return nil
	})
}

func (r *purchaseOrderRepository) GetAll(supplierID, warehouseID uint, status string) ([]model.PurchaseOrders, error) {
	var data []model.PurchaseOrders
	query := r.db.Preload("Oulet").
		Preload("Supplier").
		Preload("Warehouse").
		Preload("CreatedByUsr").
		Preload("ApprovedByUsr").
		Preload("PurchaseItem.Ingredient").
		Preload("PurchaseItem.Unit")

	if supplierID > 0 {
		query = query.Where("supplier_id = ?", supplierID)
	}
	if warehouseID > 0 {
		query = query.Where("warehouse_id = ?", warehouseID)
	}
	if status != "" {
		query = query.Where("status_purchase = ?", status)
	}

	err := query.Order("order_date DESC").Find(&data).Error
	return data, err
}

func (r *purchaseOrderRepository) GetByID(id uint) (*model.PurchaseOrders, error) {
	return r.GetByIDWithTx(r.db, id)
}

func (r *purchaseOrderRepository) GetByIDWithTx(tx *gorm.DB, id uint) (*model.PurchaseOrders, error) {
	var data model.PurchaseOrders
	err := tx.Preload("Oulet").
		Preload("Supplier").
		Preload("Warehouse").
		Preload("CreatedByUsr").
		Preload("ApprovedByUsr").
		Preload("PurchaseItem.Ingredient").
		Preload("PurchaseItem.Unit").
		First(&data, "id_purchase = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}

func (r *purchaseOrderRepository) CountTodayPO() (int64, error) {
	var count int64
	today := time.Now().Format("2006-01-02")
	err := r.db.Model(&model.PurchaseOrders{}).
		Where("DATE(order_date) = ?", today).
		Count(&count).Error
	return count, err
}
