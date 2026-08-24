package purchaseorders

import (
	"backend/internal/shared/model"
	"backend/pkg/helper"
	"errors"
	"fmt"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type CreatePOItemInput struct {
	IngredientID uint    `json:"ingredient_id" validate:"required,number,min=1"`
	UnitID       uint    `json:"unit_id" validate:"required,number,min=1"`
	Qty          uint    `json:"qty" validate:"required,number,min=1"`
	UnitPrice    float64 `json:"unit_price" validate:"required,numeric,gte=0"`
}

type CreatePOInput struct {
	SupplierID   uint                `json:"supplier_id" validate:"required,number,min=1"`
	WarehouseID  uint                `json:"warehouse_id" validate:"required,number,min=1"`
	CreatedBy    uint                `json:"created_by" validate:"required,number,min=1"`
	ExpectedDate time.Time           `json:"expected_date"`
	Notes        string              `json:"notes"`
	Items        []CreatePOItemInput `json:"items" validate:"required,dive"`
}

type PurchaseOrderService interface {
	GetAll(supplierID, warehouseID uint, status string) ([]model.PurchaseOrders, error)
	GetByID(id uint) (*model.PurchaseOrders, error)
	Create(input CreatePOInput) (*model.PurchaseOrders, error)
	UpdateStatus(id uint, status string, userID uint) (*model.PurchaseOrders, error)
}

type purchaseOrderService struct {
	db   *gorm.DB
	repo PurchaseOrderRepository
}

func NewPurchaseOrderService(db *gorm.DB, repo PurchaseOrderRepository) PurchaseOrderService {
	return &purchaseOrderService{db, repo}
}

func (s *purchaseOrderService) GetAll(supplierID, warehouseID uint, status string) ([]model.PurchaseOrders, error) {
	return s.repo.GetAll(supplierID, warehouseID, status)
}

func (s *purchaseOrderService) GetByID(id uint) (*model.PurchaseOrders, error) {
	return s.repo.GetByID(id)
}

func (s *purchaseOrderService) Create(input CreatePOInput) (*model.PurchaseOrders, error) {
	if len(input.Items) == 0 {
		return nil, errors.New("item purchase order tidak boleh kosong")
	}

	count, err := s.repo.CountTodayPO()
	if err != nil {
		return nil, err
	}
	poCode := helper.GenerateCodePO(int(count))

	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var wirehouse model.Wirehouse
	if err := tx.First(&wirehouse, "id_wirehouse = ?", input.WarehouseID).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("warehouse tidak ditemukan")
	}

	var totalAmount decimal.Decimal = decimal.Zero
	for _, item := range input.Items {
		itemTotal := decimal.NewFromFloat(item.UnitPrice).Mul(decimal.NewFromInt(int64(item.Qty)))
		totalAmount = totalAmount.Add(itemTotal)
	}

	po := &model.PurchaseOrders{
		OutletRef:      wirehouse.OutletRef,
		SupplierRef:    input.SupplierID,
		WarehouseRef:   input.WarehouseID,
		CreatedBy:      input.CreatedBy,
		PurchaseCode:   poCode,
		PONumber:       poCode,
		TotalAmount:    totalAmount,
		ExpectedDate:   input.ExpectedDate,
		Notes:          input.Notes,
		StatusPurchase: "draft",
		OrderDate:      time.Now(),
	}

	if err := s.repo.CreateWithTx(tx, po); err != nil {
		tx.Rollback()
		return nil, err
	}

	for _, item := range input.Items {
		unitPriceDec := decimal.NewFromFloat(item.UnitPrice)
		itemTotal := unitPriceDec.Mul(decimal.NewFromInt(int64(item.Qty)))

		poItem := &model.PurchaseItems{
			PurchaseRef:   po.IDPurchase,
			IngredientRef: item.IngredientID,
			UnitRef:       item.UnitID,
			Qty:           item.Qty,
			UnitPrice:     unitPriceDec,
			TotalPrice:    itemTotal,
		}

		if err := s.repo.CreateItemWithTx(tx, poItem); err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.repo.GetByID(po.IDPurchase)
}

func (s *purchaseOrderService) UpdateStatus(id uint, status string, userID uint) (*model.PurchaseOrders, error) {
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	po, err := s.repo.GetByIDWithTx(tx, id)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	if po == nil {
		tx.Rollback()
		return nil, errors.New("data purchase order tidak ditemukan")
	}

	currentStatus := po.StatusPurchase
	if currentStatus == "completed" || currentStatus == "cancelled" || currentStatus == "rejected" {
		tx.Rollback()
		return nil, fmt.Errorf("status PO %s tidak dapat diubah lagi", currentStatus)
	}

	switch status {
	case "pending":
		if currentStatus != "draft" {
			tx.Rollback()
			return nil, errors.New("hanya PO berstatus draft yang dapat diajukan")
		}
		po.StatusPurchase = "pending"

	case "approved":
		if currentStatus != "pending" && currentStatus != "draft" {
			tx.Rollback()
			return nil, errors.New("hanya PO berstatus draft/pending yang dapat disetujui")
		}
		po.StatusPurchase = "approved"
		po.ApprovedBy = userID
		po.ApprovedAt = time.Now()

	case "partially_received":
		if currentStatus != "approved" && currentStatus != "partially_received" {
			tx.Rollback()
			return nil, errors.New("hanya PO berstatus approved atau partially_received yang dapat diproses parsial")
		}
		po.StatusPurchase = "partially_received"

	case "completed":
		if currentStatus != "approved" && currentStatus != "partially_received" {
			tx.Rollback()
			return nil, errors.New("hanya PO berstatus approved atau partially_received yang dapat diselesaikan")
		}
		po.StatusPurchase = "completed"

	case "rejected":
		if currentStatus != "pending" && currentStatus != "draft" {
			tx.Rollback()
			return nil, errors.New("hanya PO berstatus draft/pending yang dapat ditolak")
		}
		po.StatusPurchase = "rejected"

	case "cancelled":
		po.StatusPurchase = "cancelled"

	default:
		tx.Rollback()
		return nil, fmt.Errorf("status PO tidak valid: %s", status)
	}

	if err := s.repo.UpdateWithTx(tx, po); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.repo.GetByID(po.IDPurchase)
}
