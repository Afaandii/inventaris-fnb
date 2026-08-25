package stoktransfers

import (
	stokmovements "backend/internal/modules/inventory/stok_movements"
	"backend/internal/shared/model"
	"errors"
	"fmt"
	"time"

	"backend/pkg/helper"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type CreateItemInput struct {
	IngredientID uint    `json:"ingredient_id" validate:"required,number,min=1"`
	UnitID       uint    `json:"unit_id" validate:"required,number,min=1"`
	Qty          float64 `json:"qty" validate:"required,numeric,gt=0"`
	Remarks      string  `json:"remarks"`
}

type CreateTransferInput struct {
	WarehouseFrom uint              `json:"warehouse_from" validate:"required,number,min=1"`
	WarehouseTo   uint              `json:"warehouse_to" validate:"required,number,min=1"`
	CreatedBy     uint              `json:"created_by" validate:"required,number,min=1"`
	Notes         string            `json:"notes"`
	Items         []CreateItemInput `json:"items" validate:"required,dive"`
}

type StokTransferService interface {
	GetAll(warehouseFrom, warehouseTo uint, status string) ([]model.StokTransfers, error)
	GetByID(id uint) (*model.StokTransfers, error)
	Create(input CreateTransferInput) (*model.StokTransfers, error)
	UpdateStatus(id uint, status string, approvedBy uint) (*model.StokTransfers, error)
}

type stokTransferService struct {
	db              *gorm.DB
	repo            StokTransferRepository
	movementService stokmovements.StokMovementService
}

func NewStokTransferService(db *gorm.DB, repo StokTransferRepository, movementService stokmovements.StokMovementService) StokTransferService {
	return &stokTransferService{db, repo, movementService}
}

func (s *stokTransferService) GetAll(warehouseFrom, warehouseTo uint, status string) ([]model.StokTransfers, error) {
	return s.repo.GetAll(warehouseFrom, warehouseTo, status)
}

func (s *stokTransferService) GetByID(id uint) (*model.StokTransfers, error) {
	return s.repo.GetByID(id)
}

func (s *stokTransferService) Create(input CreateTransferInput) (*model.StokTransfers, error) {
	if input.WarehouseFrom == input.WarehouseTo {
		return nil, errors.New("gudang asal dan gudang tujuan tidak boleh sama")
	}

	// Hitung total transfer hari ini untuk generate kode unik
	count, err := s.repo.CountTodayTransfers()
	if err != nil {
		return nil, err
	}
	transferCode := helper.GenerateCodeTransfer(int(count))

	// Jalankan transaksi database
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Ambil data outlet dari warehouse asal
	var wirehouseFrom model.Wirehouse
	if err := tx.First(&wirehouseFrom, "id_wirehouse = ?", input.WarehouseFrom).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("gudang asal tidak ditemukan")
	}

	// 1. Buat Header StokTransfers
	transfer := &model.StokTransfers{
		OutletRef:      wirehouseFrom.OutletRef,
		WarehouseFrom:  input.WarehouseFrom,
		WarehouseTo:    input.WarehouseTo,
		CreatedBy:      input.CreatedBy,
		TransferCode:   transferCode,
		TransferDate:   time.Now(),
		StatusTransfer: "draft", // Status awal disetel ke draft
		Notes:          input.Notes,
	}

	if err := s.repo.CreateWithTx(tx, transfer); err != nil {
		tx.Rollback()
		return nil, err
	}

	// 2. Loop item dan lakukan penguncian stok (reserve) di gudang asal
	for _, item := range input.Items {
		qtyNeeded := uint(item.Qty)
		if qtyNeeded == 0 {
			tx.Rollback()
			return nil, errors.New("kuantitas transfer item tidak boleh 0")
		}

		// Ambil batch stok yang tersedia di gudang asal (FEFO)
		var balances []model.StokBalances
		err := tx.Where("ingredient_id = ? AND wirehouse_id = ? AND available_qty > 0", item.IngredientID, input.WarehouseFrom).
			Order("expire_date ASC NULLS LAST").
			Find(&balances).Error
		if err != nil {
			tx.Rollback()
			return nil, err
		}

		var totalAvailable uint = 0
		for _, b := range balances {
			totalAvailable += b.AvailableQty
		}

		// Kebijakan Strict: Tolak jika stok tersedia kurang dari kuantitas transfer
		if totalAvailable < qtyNeeded {
			tx.Rollback()
			return nil, fmt.Errorf("stok bahan (ID: %d) di gudang asal tidak mencukupi untuk transfer", item.IngredientID)
		}

		// Lakukan reservasi stok
		remaining := qtyNeeded
		for i := range balances {
			if remaining == 0 {
				break
			}
			balance := &balances[i]
			if balance.AvailableQty >= remaining {
				balance.AvailableQty -= remaining
				balance.ReservedQty += remaining
				remaining = 0
			} else {
				remaining -= balance.AvailableQty
				balance.ReservedQty += balance.AvailableQty
				balance.AvailableQty = 0
			}

			if err := tx.Save(balance).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		}

		// Simpan item detail StokTransferItems
		qtyDecimal := decimal.NewFromFloat(item.Qty)
		transferItem := &model.StokTransferItems{
			TransferStokRef: transfer.IDStokTransfer,
			IngredientRef:   item.IngredientID,
			UnitRef:         item.UnitID,
			Qty:             qtyDecimal,
			Remarks:         item.Remarks,
		}

		if err := s.repo.CreateItemWithTx(tx, transferItem); err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.repo.GetByID(transfer.IDStokTransfer)
}

func (s *stokTransferService) UpdateStatus(id uint, status string, approvedBy uint) (*model.StokTransfers, error) {
	// Jalankan transaksi database
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Ambil data transfer lama beserta detail item
	transfer, err := s.repo.GetByIDWithTx(tx, id)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	if transfer == nil {
		tx.Rollback()
		return nil, errors.New("data transfer tidak ditemukan")
	}

	// Validasi Transisi Status
	currentStatus := transfer.StatusTransfer
	if currentStatus == "completed" || currentStatus == "cancelled" {
		tx.Rollback()
		return nil, fmt.Errorf("status transfer sudah selesai atau dibatalkan, tidak bisa diubah lagi")
	}

	// Validasi transisi spesifik
	if status == "approved" {
		if currentStatus != "draft" {
			tx.Rollback()
			return nil, errors.New("hanya transfer berstatus draft yang dapat disetujui")
		}
		transfer.ApprovedBy = approvedBy
		transfer.Approved_at = time.Now()
		transfer.StatusTransfer = "approved"

	} else if status == "completed" {
		// Ubah status ke completed (diterima di tujuan)
		// Stok dikurangi dari reserved asal dan masuk ke available tujuan
		for _, item := range transfer.StokTransferItem {
			qtyNeeded := uint(item.Qty.IntPart())

			// Ambil data bahan untuk mendapatkan average cost terbaru
			var ingredient model.Ingredients
			if err := tx.First(&ingredient, "id_ingredient = ?", item.IngredientRef).Error; err != nil {
				tx.Rollback()
				return nil, err
			}

			// Ambil saldo yang memiliki reserved_qty di gudang asal (FEFO)
			var sourceBalances []model.StokBalances
			err := tx.Where("ingredient_id = ? AND wirehouse_id = ? AND reserved_qty > 0", item.IngredientRef, transfer.WarehouseFrom).
				Order("expire_date ASC NULLS LAST").
				Find(&sourceBalances).Error
			if err != nil {
				tx.Rollback()
				return nil, err
			}

			remaining := qtyNeeded
			for i := range sourceBalances {
				if remaining == 0 {
					break
				}
				sourceBatch := &sourceBalances[i]
				var takeQty uint = 0

				if sourceBatch.ReservedQty >= remaining {
					takeQty = remaining
					sourceBatch.ReservedQty -= remaining
					remaining = 0
				} else {
					takeQty = sourceBatch.ReservedQty
					remaining -= sourceBatch.ReservedQty
					sourceBatch.ReservedQty = 0
				}

				// Simpan perubahan gudang asal
				if err := tx.Save(sourceBatch).Error; err != nil {
					tx.Rollback()
					return nil, err
				}

				// Tambahkan ke gudang tujuan dengan batch & expire date yang sama
				var destBatch model.StokBalances
				err = tx.Where("ingredient_id = ? AND wirehouse_id = ? AND batch_no = ?", item.IngredientRef, transfer.WarehouseTo, sourceBatch.BatchNo).
					First(&destBatch).Error

				if err != nil {
					if errors.Is(err, gorm.ErrRecordNotFound) {
						// Buat balance baru di gudang tujuan
						newDestBatch := &model.StokBalances{
							IngredientRef: item.IngredientRef,
							WirehouseRef:  transfer.WarehouseTo,
							AvailableQty:  takeQty,
							ReservedQty:   0,
							BatchNo:       sourceBatch.BatchNo,
							ExpireDate:    sourceBatch.ExpireDate,
						}
						if err := tx.Create(newDestBatch).Error; err != nil {
							tx.Rollback()
							return nil, err
						}
					} else {
						tx.Rollback()
						return nil, err
					}
				} else {
					destBatch.AvailableQty += takeQty
					if err := tx.Save(&destBatch).Error; err != nil {
						tx.Rollback()
						return nil, err
					}
				}
			}

			// Catat log pergerakan stok riil (Type: transfer)
			err = s.movementService.LogMovement(
				tx,
				transfer.WarehouseFrom,
				transfer.WarehouseTo,
				item.IngredientRef,
				approvedBy,
				transfer.IDStokTransfer,
				"stok_transfer",
				"transfer",
				item.Qty,
				ingredient.AverageCost,
				transfer.Notes,
				item.Remarks,
			)
			if err != nil {
				tx.Rollback()
				return nil, err
			}
		}
		transfer.StatusTransfer = "completed"

	} else if status == "cancelled" {
		// Batalkan transfer: kembalikan reserved ke available di gudang asal
		for _, item := range transfer.StokTransferItem {
			qtyNeeded := uint(item.Qty.IntPart())

			// Ambil saldo yang memiliki reserved_qty di asal
			var sourceBalances []model.StokBalances
			err := tx.Where("ingredient_id = ? AND wirehouse_id = ? AND reserved_qty > 0", item.IngredientRef, transfer.WarehouseFrom).
				Order("expire_date ASC NULLS LAST").
				Find(&sourceBalances).Error
			if err != nil {
				tx.Rollback()
				return nil, err
			}

			remaining := qtyNeeded
			for i := range sourceBalances {
				if remaining == 0 {
					break
				}
				sourceBatch := &sourceBalances[i]
				if sourceBatch.ReservedQty >= remaining {
					sourceBatch.AvailableQty += remaining
					sourceBatch.ReservedQty -= remaining
					remaining = 0
				} else {
					sourceBatch.AvailableQty += sourceBatch.ReservedQty
					remaining -= sourceBatch.ReservedQty
					sourceBatch.ReservedQty = 0
				}

				if err := tx.Save(sourceBatch).Error; err != nil {
					tx.Rollback()
					return nil, err
				}
			}
		}
		transfer.StatusTransfer = "cancelled"
	} else {
		tx.Rollback()
		return nil, fmt.Errorf("status tujuan tidak valid: %s", status)
	}

	if err := s.repo.UpdateWithTx(tx, transfer); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.repo.GetByID(transfer.IDStokTransfer)
}
