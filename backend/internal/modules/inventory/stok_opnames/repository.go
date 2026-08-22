package stokopnames

import (
	"backend/internal/shared/model"
	"errors"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type WarehouseStockSummary struct {
	IngredientID uint            `json:"ingredient_id"`
	IngreName    string          `json:"ingre_name"`
	IngreCode    string          `json:"ingre_code"`
	UnitID       uint            `json:"unit_id"`
	UnitName     string          `json:"unit_name"`
	SystemQty    decimal.Decimal `json:"system_qty"`
}

type StokOpnameRepository interface {
	CreateWithTx(tx *gorm.DB, opname *model.StokOpnames) error
	CreateItemWithTx(tx *gorm.DB, item *model.StokOpnameItems) error
	UpdateWithTx(tx *gorm.DB, opname *model.StokOpnames) error
	GetAll(warehouseID uint, status string) ([]model.StokOpnames, error)
	GetByID(id uint) (*model.StokOpnames, error)
	GetByIDWithTx(tx *gorm.DB, id uint) (*model.StokOpnames, error)
	CountTodayOpnames() (int64, error)
	GetWarehouseStockSummary(warehouseID uint) ([]WarehouseStockSummary, error)
}

type stokOpnameRepository struct {
	db *gorm.DB
}

func NewStokOpnameRepository(db *gorm.DB) StokOpnameRepository {
	return &stokOpnameRepository{db}
}

func (r *stokOpnameRepository) CreateWithTx(tx *gorm.DB, opname *model.StokOpnames) error {
	return tx.Create(opname).Error
}

func (r *stokOpnameRepository) CreateItemWithTx(tx *gorm.DB, item *model.StokOpnameItems) error {
	return tx.Create(item).Error
}

func (r *stokOpnameRepository) UpdateWithTx(tx *gorm.DB, opname *model.StokOpnames) error {
	return tx.Save(opname).Error
}

func (r *stokOpnameRepository) GetAll(warehouseID uint, status string) ([]model.StokOpnames, error) {
	var data []model.StokOpnames
	query := r.db.Preload("Outlet").
		Preload("Wirehouse").
		Preload("CreatedByOpnm").
		Preload("ApprovedByOpnm").
		Preload("StokOpnameItem.Ingredient").
		Preload("StokOpnameItem.Unit")

	if warehouseID > 0 {
		query = query.Where("wirehouse_id = ?", warehouseID)
	}
	if status != "" {
		query = query.Where("status_opname = ?", status)
	}

	err := query.Order("opname_date DESC").Find(&data).Error
	return data, err
}

func (r *stokOpnameRepository) GetByID(id uint) (*model.StokOpnames, error) {
	return r.GetByIDWithTx(r.db, id)
}

func (r *stokOpnameRepository) GetByIDWithTx(tx *gorm.DB, id uint) (*model.StokOpnames, error) {
	var data model.StokOpnames
	err := tx.Preload("Outlet").
		Preload("Wirehouse").
		Preload("CreatedByOpnm").
		Preload("ApprovedByOpnm").
		Preload("StokOpnameItem.Ingredient").
		Preload("StokOpnameItem.Unit").
		First(&data, "id_stok_opname = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}

func (r *stokOpnameRepository) CountTodayOpnames() (int64, error) {
	var count int64
	today := time.Now().Format("2006-01-02")
	err := r.db.Model(&model.StokOpnames{}).
		Where("DATE(opname_date) = ?", today).
		Count(&count).Error
	return count, err
}

func (r *stokOpnameRepository) GetWarehouseStockSummary(warehouseID uint) ([]WarehouseStockSummary, error) {
	var ingredients []model.Ingredients
	if err := r.db.Preload("Unit").Where("is_active = ?", true).Find(&ingredients).Error; err != nil {
		return nil, err
	}

	var results []WarehouseStockSummary
	for _, ingre := range ingredients {
		var balances []model.StokBalances
		err := r.db.Where("ingredient_id = ? AND wirehouse_id = ?", ingre.IDIngredient, warehouseID).Find(&balances).Error
		if err != nil {
			return nil, err
		}

		var totalAvailable uint = 0
		for _, b := range balances {
			totalAvailable += b.AvailableQty
		}

		results = append(results, WarehouseStockSummary{
			IngredientID: ingre.IDIngredient,
			IngreName:    ingre.IngreName,
			IngreCode:    ingre.IngreCode,
			UnitID:       ingre.UnitRef,
			UnitName:     ingre.Unit.UnitName,
			SystemQty:    decimal.NewFromInt(int64(totalAvailable)),
		})
	}

	return results, nil
}
