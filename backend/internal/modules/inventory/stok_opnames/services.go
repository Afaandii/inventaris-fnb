package stokopnames

import (
	"backend/internal/modules/inventory/stok_balances"
	"backend/internal/shared/model"
	"backend/pkg/helper"
	"errors"
	"fmt"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type CreateOpnameItemInput struct {
	IngredientID uint    `json:"ingredient_id" validate:"required,number,min=1"`
	UnitID       uint    `json:"unit_id" validate:"required,number,min=1"`
	PhysicalQty  float64 `json:"physical_qty" validate:"required,numeric,gte=0"`
	Remarks      string  `json:"remarks"`
}

type CreateOpnameInput struct {
	WarehouseID uint                    `json:"warehouse_id" validate:"required,number,min=1"`
	CreatedBy   uint                    `json:"created_by" validate:"required,number,min=1"`
	Notes       string                  `json:"notes"`
	Items       []CreateOpnameItemInput `json:"items" validate:"required,dive"`
}

type StokOpnameService interface {
	GetAll(warehouseID uint, status string) ([]model.StokOpnames, error)
	GetByID(id uint) (*model.StokOpnames, error)
	GetStockSummary(warehouseID uint) ([]WarehouseStockSummary, error)
	Create(input CreateOpnameInput) (*model.StokOpnames, error)
	UpdateStatus(id uint, status string, userID uint) (*model.StokOpnames, error)
}

type stokOpnameService struct {
	db             *gorm.DB
	repo           StokOpnameRepository
	balanceService stokbalances.StokBalanceService
}

func NewStokOpnameService(db *gorm.DB, repo StokOpnameRepository, balanceService stokbalances.StokBalanceService) StokOpnameService {
	return &stokOpnameService{db, repo, balanceService}
}

func (s *stokOpnameService) GetAll(warehouseID uint, status string) ([]model.StokOpnames, error) {
	return s.repo.GetAll(warehouseID, status)
}

func (s *stokOpnameService) GetByID(id uint) (*model.StokOpnames, error) {
	return s.repo.GetByID(id)
}

func (s *stokOpnameService) GetStockSummary(warehouseID uint) ([]WarehouseStockSummary, error) {
	return s.repo.GetWarehouseStockSummary(warehouseID)
}

func (s *stokOpnameService) Create(input CreateOpnameInput) (*model.StokOpnames, error) {
	if len(input.Items) == 0 {
		return nil, errors.New("daftar item opname tidak boleh kosong")
	}

	count, err := s.repo.CountTodayOpnames()
	if err != nil {
		return nil, err
	}
	opnameCode := helper.GenerateCodeOpname(int(count))

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

	opname := &model.StokOpnames{
		OutletRef:    wirehouse.OutletRef,
		WirehouseRef: input.WarehouseID,
		CreatedBy:    input.CreatedBy,
		OpnameCode:   opnameCode,
		OpnameDate:   time.Now(),
		StatusOpname: "draft",
		Notes:        input.Notes,
	}

	if err := s.repo.CreateWithTx(tx, opname); err != nil {
		tx.Rollback()
		return nil, err
	}

	for _, item := range input.Items {
		// Ambil stok sistem saat ini
		var balances []model.StokBalances
		err := tx.Where("ingredient_id = ? AND wirehouse_id = ?", item.IngredientID, input.WarehouseID).Find(&balances).Error
		if err != nil {
			tx.Rollback()
			return nil, err
		}

		var totalAvailable uint = 0
		for _, b := range balances {
			totalAvailable += b.AvailableQty
		}

		systemQtyDec := decimal.NewFromInt(int64(totalAvailable))
		physicalQtyDec := decimal.NewFromFloat(item.PhysicalQty)
		differenceQtyDec := physicalQtyDec.Sub(systemQtyDec)

		opnameItem := &model.StokOpnameItems{
			OpnameRef:     opname.IDStokOpname,
			IngredientRef: item.IngredientID,
			UnitRef:       item.UnitID,
			SystemQty:     systemQtyDec,
			PhysicalQty:   physicalQtyDec,
			DifferenceQty: differenceQtyDec,
			Remarks:       item.Remarks,
		}

		if err := s.repo.CreateItemWithTx(tx, opnameItem); err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.repo.GetByID(opname.IDStokOpname)
}

func (s *stokOpnameService) UpdateStatus(id uint, status string, userID uint) (*model.StokOpnames, error) {
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	opname, err := s.repo.GetByIDWithTx(tx, id)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	if opname == nil {
		tx.Rollback()
		return nil, errors.New("data stok opname tidak ditemukan")
	}

	if opname.StatusOpname == "completed" {
		tx.Rollback()
		return nil, errors.New("stok opname sudah selesai, tidak dapat diubah lagi")
	}

	if status == "approved" {
		opname.StatusOpname = "approved"
		opname.ApprovedBy = userID
		opname.ApprovedAt = time.Now()

	} else if status == "completed" {
		// Eksekusi penyesuaian stok untuk setiap item yang memiliki selisih
		for _, item := range opname.StokOpnameItem {
			diff := int(item.DifferenceQty.IntPart())
			if diff == 0 {
				continue
			}

			var ingredient model.Ingredients
			if err := tx.First(&ingredient, "id_ingredient = ?", item.IngredientRef).Error; err != nil {
				tx.Rollback()
				return nil, err
			}

			if diff > 0 {
				// Kelebihan stok fisik: Tambah stok
				err := s.balanceService.AddStock(
					tx,
					item.IngredientRef,
					opname.WirehouseRef,
					uint(diff),
					"",
					time.Time{},
					ingredient.AverageCost,
					userID,
					opname.IDStokOpname,
					"stok_opname",
					fmt.Sprintf("Koreksi Opname (+%d): %s", diff, item.Remarks),
				)
				if err != nil {
					tx.Rollback()
					return nil, err
				}
			} else if diff < 0 {
				// Kekurangan stok fisik: Kurangi stok (FEFO)
				err := s.balanceService.ReduceStock(
					tx,
					item.IngredientRef,
					opname.WirehouseRef,
					uint(-diff),
					userID,
					opname.IDStokOpname,
					"stok_opname",
					fmt.Sprintf("Koreksi Opname (%d): %s", diff, item.Remarks),
				)
				if err != nil {
					tx.Rollback()
					return nil, err
				}
			}
		}

		opname.StatusOpname = "completed"
		opname.ApprovedBy = userID
		opname.ApprovedAt = time.Now()
	} else {
		tx.Rollback()
		return nil, fmt.Errorf("status opname tidak valid: %s", status)
	}

	if err := s.repo.UpdateWithTx(tx, opname); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.repo.GetByID(opname.IDStokOpname)
}
