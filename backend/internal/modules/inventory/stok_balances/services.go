package stokbalances

import (
	stokmovements "backend/internal/modules/inventory/stok_movements"
	"backend/internal/shared/model"
	"errors"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type StokBalanceService interface {
	GetAll(wirehouseID, ingredientID uint) ([]model.StokBalances, error)
	GetByID(id uint) (*model.StokBalances, error)

	// Fungsi mutasi stok internal (direct call)
	AddStock(tx *gorm.DB, ingredientID, wirehouseID uint, qty uint, batchNo string, expireDate time.Time, unitCost decimal.Decimal, userID uint, refID uint, refType, remarks string) error
	ReduceStock(tx *gorm.DB, ingredientID, wirehouseID uint, qty uint, userID uint, refID uint, refType, remarks string) error
	TransferStock(tx *gorm.DB, ingredientID, wrehouseFromID, wirehouseToID uint, qty uint, userID uint, refID uint, remarks string) error
}

type stokBalanceService struct {
	repo            StokBalanceRepository
	movementService stokmovements.StokMovementService
}

func NewStokBalanceService(repo StokBalanceRepository, movementService stokmovements.StokMovementService) StokBalanceService {
	return &stokBalanceService{repo, movementService}
}

func (s *stokBalanceService) GetAll(wirehouseID, ingredientID uint) ([]model.StokBalances, error) {
	return s.repo.GetAll(wirehouseID, ingredientID)
}

func (s *stokBalanceService) GetByID(id uint) (*model.StokBalances, error) {
	return s.repo.GetByID(id)
}

func (s *stokBalanceService) AddStock(tx *gorm.DB, ingredientID, wirehouseID uint, qty uint, batchNo string, expireDate time.Time, unitCost decimal.Decimal, userID uint, refID uint, refType, remarks string) error {
	if qty == 0 {
		return nil
	}

	// 1. Cari atau buat stok balance berdasarkan batch
	existing, err := s.repo.GetByIngredientAndWarehouseAndBatchWithTx(tx, ingredientID, wirehouseID, batchNo)
	if err != nil {
		return err
	}

	if existing != nil {
		existing.AvailableQty += qty
		err = s.repo.UpdateWithTx(tx, existing)
		if err != nil {
			return err
		}
	} else {
		var expDate *time.Time
		if !expireDate.IsZero() {
			expDate = &expireDate
		}
		newStok := &model.StokBalances{
			IngredientRef: ingredientID,
			WirehouseRef:  wirehouseID,
			AvailableQty:  qty,
			ReservedQty:   0,
			BatchNo:       batchNo,
			ExpireDate:    expDate,
		}
		err = s.repo.CreateWithTx(tx, newStok)
		if err != nil {
			return err
		}
	}

	// 2. Catat stok movement
	qtyDecimal := decimal.NewFromInt(int64(qty))
	err = s.movementService.LogMovement(tx, 0, wirehouseID, ingredientID, userID, refID, refType, "in", qtyDecimal, unitCost, remarks, "")
	if err != nil {
		return err
	}

	return nil
}

func (s *stokBalanceService) ReduceStock(tx *gorm.DB, ingredientID, wirehouseID uint, qty uint, userID uint, refID uint, refType, remarks string) error {
	if qty == 0 {
		return nil
	}

	// 1. Ambil ketersediaan batch berdasarkan FEFO
	batches, err := s.repo.GetAvailableBatchesFEFOWithTx(tx, ingredientID, wirehouseID)
	if err != nil {
		return err
	}

	// Hitung total stok tersedia
	var totalAvailable uint = 0
	for _, b := range batches {
		totalAvailable += b.AvailableQty
	}

	// Kebijakan Strict: Jika stok kurang dari yang diinginkan, transaksi langsung ditolak
	if totalAvailable < qty {
		return errors.New("stok tidak mencukupi untuk melakukan transaksi")
	}

	// 2. Lakukan pemotongan stok dengan strategi FEFO
	remainingToReduce := qty
	for i := range batches {
		if remainingToReduce == 0 {
			break
		}

		batch := &batches[i]
		if batch.AvailableQty >= remainingToReduce {
			batch.AvailableQty -= remainingToReduce
			remainingToReduce = 0
		} else {
			remainingToReduce -= batch.AvailableQty
			batch.AvailableQty = 0
		}

		err = s.repo.UpdateWithTx(tx, batch)
		if err != nil {
			return err
		}
	}

	// 3. Catat stok movement
	qtyDecimal := decimal.NewFromInt(int64(qty))
	err = s.movementService.LogMovement(tx, wirehouseID, 0, ingredientID, userID, refID, refType, "out", qtyDecimal, decimal.Zero, remarks, "")
	if err != nil {
		return err
	}

	return nil
}

func (s *stokBalanceService) TransferStock(tx *gorm.DB, ingredientID, wirehouseFromID, wirehouseToID uint, qty uint, userID uint, refID uint, remarks string) error {
	if qty == 0 {
		return nil
	}

	// 1. Ambil ketersediaan batch dari gudang asal dengan FEFO
	sourceBatches, err := s.repo.GetAvailableBatchesFEFOWithTx(tx, ingredientID, wirehouseFromID)
	if err != nil {
		return err
	}

	// Hitung total stok tersedia di gudang asal
	var totalAvailable uint = 0
	for _, b := range sourceBatches {
		totalAvailable += b.AvailableQty
	}

	// Kebijakan Strict: Tolak transaksi jika tidak cukup
	if totalAvailable < qty {
		return errors.New("stok di gudang asal tidak mencukupi untuk ditransfer")
	}

	// 2. Kurangi dari gudang asal dan tambahkan ke gudang tujuan per batch
	remainingToTransfer := qty
	for i := range sourceBatches {
		if remainingToTransfer == 0 {
			break
		}

		sourceBatch := &sourceBatches[i]
		var transferQty uint = 0

		if sourceBatch.AvailableQty >= remainingToTransfer {
			transferQty = remainingToTransfer
			sourceBatch.AvailableQty -= remainingToTransfer
			remainingToTransfer = 0
		} else {
			transferQty = sourceBatch.AvailableQty
			remainingToTransfer -= sourceBatch.AvailableQty
			sourceBatch.AvailableQty = 0
		}

		// Update gudang asal
		err = s.repo.UpdateWithTx(tx, sourceBatch)
		if err != nil {
			return err
		}

		// Update gudang tujuan dengan batch yang sama
		destBatch, err := s.repo.GetByIngredientAndWarehouseAndBatchWithTx(tx, ingredientID, wirehouseToID, sourceBatch.BatchNo)
		if err != nil {
			return err
		}

		if destBatch != nil {
			destBatch.AvailableQty += transferQty
			err = s.repo.UpdateWithTx(tx, destBatch)
			if err != nil {
				return err
			}
		} else {
			newDestBatch := &model.StokBalances{
				IngredientRef: ingredientID,
				WirehouseRef:  wirehouseToID,
				AvailableQty:  transferQty,
				ReservedQty:   0,
				BatchNo:       sourceBatch.BatchNo,
				ExpireDate:    sourceBatch.ExpireDate,
			}
			err = s.repo.CreateWithTx(tx, newDestBatch)
			if err != nil {
				return err
			}
		}
	}

	// 3. Catat stok movement transfer
	qtyDecimal := decimal.NewFromInt(int64(qty))
	err = s.movementService.LogMovement(tx, wirehouseFromID, wirehouseToID, ingredientID, userID, refID, "stok_transfer", "transfer", qtyDecimal, decimal.Zero, remarks, "")
	if err != nil {
		return err
	}

	return nil
}
