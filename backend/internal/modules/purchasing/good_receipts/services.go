package goodreceipts

import (
	stokbalances "backend/internal/modules/inventory/stok_balances"
	"backend/internal/shared/model"
	"backend/pkg/helper"
	"errors"
	"fmt"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type CreateGRItemInput struct {
	PurchaseItemID uint      `json:"purchase_item_id" validate:"required,number,min=1"`
	IngredientID   uint      `json:"ingredient_id" validate:"required,number,min=1"`
	UnitID         uint      `json:"unit_id" validate:"required,number,min=1"`
	ReceivedQty    float64   `json:"received_qty" validate:"required,numeric,gte=0"`
	AcceptedQty    float64   `json:"accepted_qty" validate:"required,numeric,gte=0"`
	RejectedQty    float64   `json:"rejected_qty" validate:"numeric,gte=0"`
	UnitCost       float64   `json:"unit_cost" validate:"required,numeric,gte=0"`
	BatchNo        string    `json:"batch_no"`
	ExpiryDate     time.Time `json:"expiry_date"`
	Notes          string    `json:"notes"`
}

type CreateGRInput struct {
	PurchaseID      uint                `json:"purchase_id" validate:"required,number,min=1"`
	WarehouseID     uint                `json:"warehouse_id" validate:"required,number,min=1"`
	ReceivedBy      uint                `json:"received_by" validate:"required,number,min=1"`
	CheckedBy       uint                `json:"checked_by" validate:"required,number,min=1"`
	SupplierInvoice string              `json:"supplier_invoice"`
	Notes           string              `json:"notes"`
	Items           []CreateGRItemInput `json:"items" validate:"required,dive"`
}

type GoodReceiptService interface {
	GetAll(purchaseID, warehouseID uint, status string) ([]model.GoodReceipts, error)
	GetByID(id uint) (*model.GoodReceipts, error)
	Create(input CreateGRInput) (*model.GoodReceipts, error)
	UpdateStatus(id uint, status string, checkedBy uint) (*model.GoodReceipts, error)
}

type goodReceiptService struct {
	db             *gorm.DB
	repo           GoodReceiptRepository
	balanceService stokbalances.StokBalanceService
}

func NewGoodReceiptService(db *gorm.DB, repo GoodReceiptRepository, balanceService stokbalances.StokBalanceService) GoodReceiptService {
	return &goodReceiptService{db, repo, balanceService}
}

func (s *goodReceiptService) GetAll(purchaseID, warehouseID uint, status string) ([]model.GoodReceipts, error) {
	return s.repo.GetAll(purchaseID, warehouseID, status)
}

func (s *goodReceiptService) GetByID(id uint) (*model.GoodReceipts, error) {
	return s.repo.GetByID(id)
}

func (s *goodReceiptService) Create(input CreateGRInput) (*model.GoodReceipts, error) {
	if len(input.Items) == 0 {
		return nil, errors.New("item good receipt tidak boleh kosong")
	}

	count, err := s.repo.CountTodayGoodReceipts()
	if err != nil {
		return nil, err
	}
	receiptNumber := helper.GenerateCodeGoodReceipt(int(count))

	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 1. Ambil data Purchase Order dan cek status
	var po model.PurchaseOrders
	if err := tx.First(&po, "id_purchase = ?", input.PurchaseID).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("purchase order tidak ditemukan")
	}

	if po.StatusPurchase != "approved" && po.StatusPurchase != "partially_received" {
		tx.Rollback()
		return nil, fmt.Errorf("penerimaan barang hanya dapat dilakukan untuk PO berstatus approved atau partially_received (status saat ini: %s)", po.StatusPurchase)
	}

	// 2. Buat Header GoodReceipts
	gr := &model.GoodReceipts{
		PurchaseRef:     input.PurchaseID,
		WarehouseRef:    input.WarehouseID,
		ReceivedBy:      input.ReceivedBy,
		CheckedBy:       input.CheckedBy,
		ReceiptNumber:   receiptNumber,
		ReceivedDate:    time.Now(),
		SupplierInvoice: input.SupplierInvoice,
		StatusReceipt:   "draft",
		Notes:           input.Notes,
	}

	if err := s.repo.CreateWithTx(tx, gr); err != nil {
		tx.Rollback()
		return nil, err
	}

	// 3. Validasi kuantitas item dan buat GoodReceiptItems
	for _, item := range input.Items {
		var poItem model.PurchaseItems
		if err := tx.First(&poItem, "id_purchase_item = ?", item.PurchaseItemID).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("item PO (ID: %d) tidak ditemukan", item.PurchaseItemID)
		}

		// Hitung total accepted_qty yang sudah diterima dari GR sebelumnya
		prevAccepted, err := s.repo.GetTotalAcceptedQtyForPOItemWithTx(tx, item.PurchaseItemID)
		if err != nil {
			tx.Rollback()
			return nil, err
		}

		newAcceptedDec := decimal.NewFromFloat(item.AcceptedQty)
		totalAcceptedAfter := prevAccepted.Add(newAcceptedDec)
		orderedQtyDec := decimal.NewFromInt(int64(poItem.Qty))

		// Rule 8: Total Received Quantity <= Ordered Quantity
		if totalAcceptedAfter.GreaterThan(orderedQtyDec) {
			tx.Rollback()
			return nil, fmt.Errorf("total kuantitas diterima (%s) melebihi kuantitas yang dipesan (%s) untuk item PO ID %d", totalAcceptedAfter.String(), orderedQtyDec.String(), item.PurchaseItemID)
		}

		grItem := &model.GoodReceiptItems{
			GoodReceiptRef:  gr.IDGoodReceipt,
			PurchaseItemRef: item.PurchaseItemID,
			IngredientRef:   item.IngredientID,
			UnitRef:         item.UnitID,
			OrderedQty:      orderedQtyDec,
			ReceivedQty:     decimal.NewFromFloat(item.ReceivedQty),
			AcceptedQty:     newAcceptedDec,
			RejectedQty:     decimal.NewFromFloat(item.RejectedQty),
			UnitCost:        decimal.NewFromFloat(item.UnitCost),
			BatchNo:         item.BatchNo,
			ExpiryDate:      item.ExpiryDate,
			Notes:           item.Notes,
		}

		if err := s.repo.CreateItemWithTx(tx, grItem); err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.repo.GetByID(gr.IDGoodReceipt)
}

func (s *goodReceiptService) UpdateStatus(id uint, status string, checkedBy uint) (*model.GoodReceipts, error) {
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	gr, err := s.repo.GetByIDWithTx(tx, id)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	if gr == nil {
		tx.Rollback()
		return nil, errors.New("data good receipt tidak ditemukan")
	}

	currentStatus := gr.StatusReceipt
	if currentStatus == "completed" || currentStatus == "cancelled" {
		tx.Rollback()
		return nil, fmt.Errorf("status Good Receipt %s tidak dapat diubah lagi", currentStatus)
	}

	switch status {
	case "received", "partial":
		gr.StatusReceipt = status

	case "completed":
		// Eksekusi atomik penerimaan barang ke Inventory
		for _, item := range gr.GoodReceiptItem {
			acceptedUint := uint(item.AcceptedQty.IntPart())
			if acceptedUint > 0 {
				// Tambahkan stok ke stok_balances dan log stok_movements
				err := s.balanceService.AddStock(
					tx,
					item.IngredientRef,
					gr.WarehouseRef,
					acceptedUint,
					item.BatchNo,
					item.ExpiryDate,
					item.UnitCost,
					checkedBy,
					gr.IDGoodReceipt,
					"good_receipt",
					fmt.Sprintf("Penerimaan barang dari GR #%s", gr.ReceiptNumber),
				)
				if err != nil {
					tx.Rollback()
					return nil, err
				}
			}
		}

		gr.StatusReceipt = "completed"

		// Update akumulasi status Purchase Order terkait
		var po model.PurchaseOrders
		if err := tx.Preload("PurchaseItem").First(&po, "id_purchase = ?", gr.PurchaseRef).Error; err == nil {
			var totalOrdered uint = 0
			var totalAccepted uint = 0

			for _, pItem := range po.PurchaseItem {
				totalOrdered += pItem.Qty
				acceptedDec, err := s.repo.GetTotalAcceptedQtyForPOItemWithTx(tx, pItem.IDPurchaseItem)
				if err == nil {
					totalAccepted += uint(acceptedDec.IntPart())
				}
			}

			if totalAccepted >= totalOrdered && totalOrdered > 0 {
				po.StatusPurchase = "completed"
				po.ReceivedDate = time.Now()
			} else if totalAccepted > 0 {
				po.StatusPurchase = "partially_received"
			}

			if err := tx.Save(&po).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		}

	case "cancelled":
		gr.StatusReceipt = "cancelled"

	default:
		tx.Rollback()
		return nil, fmt.Errorf("status receipt tidak valid: %s", status)
	}

	if err := s.repo.UpdateWithTx(tx, gr); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.repo.GetByID(gr.IDGoodReceipt)
}
