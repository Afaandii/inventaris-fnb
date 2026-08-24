package goodreceipts

import (
	"backend/internal/shared/model"
	"errors"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type GoodReceiptRepository interface {
	CreateWithTx(tx *gorm.DB, gr *model.GoodReceipts) error
	CreateItemWithTx(tx *gorm.DB, item *model.GoodReceiptItems) error
	UpdateWithTx(tx *gorm.DB, gr *model.GoodReceipts) error
	GetAll(purchaseID, warehouseID uint, status string) ([]model.GoodReceipts, error)
	GetByID(id uint) (*model.GoodReceipts, error)
	GetByIDWithTx(tx *gorm.DB, id uint) (*model.GoodReceipts, error)
	CountTodayGoodReceipts() (int64, error)
	GetTotalAcceptedQtyForPOItemWithTx(tx *gorm.DB, purchaseItemID uint) (decimal.Decimal, error)
}

type goodReceiptRepository struct {
	db *gorm.DB
}

func NewGoodReceiptRepository(db *gorm.DB) GoodReceiptRepository {
	return &goodReceiptRepository{db}
}

func (r *goodReceiptRepository) CreateWithTx(tx *gorm.DB, gr *model.GoodReceipts) error {
	return tx.Transaction(func(trans *gorm.DB) error {
		err := trans.Create(gr).Error
		if err != nil {
			return nil
		}

		return nil
	})
}

func (r *goodReceiptRepository) CreateItemWithTx(tx *gorm.DB, item *model.GoodReceiptItems) error {
	return tx.Transaction(func(trans *gorm.DB) error {
		err := trans.Create(item).Error
		if err != nil {
			return nil
		}

		return nil
	})
}

func (r *goodReceiptRepository) UpdateWithTx(tx *gorm.DB, gr *model.GoodReceipts) error {
	return tx.Transaction(func(trans *gorm.DB) error {
		if err := trans.Save(gr).Error; err != nil {
			return nil
		}

		return nil
	})
}

func (r *goodReceiptRepository) GetAll(purchaseID, warehouseID uint, status string) ([]model.GoodReceipts, error) {
	var data []model.GoodReceipts
	query := r.db.Preload("Purchase").
		Preload("Warehouse").
		Preload("ReceivedByUsr").
		Preload("CheckedByUsr").
		Preload("GoodReceiptItem.Ingredient").
		Preload("GoodReceiptItem.Unit").
		Preload("GoodReceiptItem.PurchaseItem")

	if purchaseID > 0 {
		query = query.Where("purchase_id = ?", purchaseID)
	}
	if warehouseID > 0 {
		query = query.Where("warehouse_id = ?", warehouseID)
	}
	if status != "" {
		query = query.Where("status_receipt = ?", status)
	}

	err := query.Order("received_date DESC").Find(&data).Error
	return data, err
}

func (r *goodReceiptRepository) GetByID(id uint) (*model.GoodReceipts, error) {
	return r.GetByIDWithTx(r.db, id)
}

func (r *goodReceiptRepository) GetByIDWithTx(tx *gorm.DB, id uint) (*model.GoodReceipts, error) {
	var data model.GoodReceipts
	err := tx.Preload("Purchase").
		Preload("Warehouse").
		Preload("ReceivedByUsr").
		Preload("CheckedByUsr").
		Preload("GoodReceiptItem.Ingredient").
		Preload("GoodReceiptItem.Unit").
		Preload("GoodReceiptItem.PurchaseItem").
		First(&data, "id_good_receipt = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}

func (r *goodReceiptRepository) CountTodayGoodReceipts() (int64, error) {
	var count int64
	today := time.Now().Format("2006-01-02")
	err := r.db.Model(&model.GoodReceipts{}).
		Where("DATE(received_date) = ?", today).
		Count(&count).Error
	return count, err
}

func (r *goodReceiptRepository) GetTotalAcceptedQtyForPOItemWithTx(tx *gorm.DB, purchaseItemID uint) (decimal.Decimal, error) {
	var total decimal.Decimal
	err := tx.Model(&model.GoodReceiptItems{}).
		Joins("JOIN good_receipt ON good_receipt.id_good_receipt = good_receipt_items.good_receipt_id").
		Where("good_receipt_items.purchase_item_id = ? AND good_receipt.status_receipt IN ?", purchaseItemID, []string{"received", "partial", "completed"}).
		Select("COALESCE(SUM(good_receipt_items.accepted_qty), 0)").
		Scan(&total).Error
	return total, err
}
