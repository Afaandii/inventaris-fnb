package stoktransfers

import (
	"backend/internal/shared/model"
	"errors"
	"time"

	"gorm.io/gorm"
)

type StokTransferRepository interface {
	CreateWithTx(tx *gorm.DB, transfer *model.StokTransfers) error
	CreateItemWithTx(tx *gorm.DB, item *model.StokTransferItems) error
	UpdateWithTx(tx *gorm.DB, transfer *model.StokTransfers) error
	GetAll(warehouseFrom, warehouseTo uint, status string) ([]model.StokTransfers, error)
	GetByID(id uint) (*model.StokTransfers, error)
	GetByIDWithTx(tx *gorm.DB, id uint) (*model.StokTransfers, error)
	CountTodayTransfers() (int64, error)
}

type stokTransferRepository struct {
	db *gorm.DB
}

func NewStokTransferRepository(db *gorm.DB) StokTransferRepository {
	return &stokTransferRepository{db}
}

func (r *stokTransferRepository) CreateWithTx(tx *gorm.DB, transfer *model.StokTransfers) error {
	return tx.Create(transfer).Error
}

func (r *stokTransferRepository) CreateItemWithTx(tx *gorm.DB, item *model.StokTransferItems) error {
	return tx.Create(item).Error
}

func (r *stokTransferRepository) UpdateWithTx(tx *gorm.DB, transfer *model.StokTransfers) error {
	return tx.Save(transfer).Error
}

func (r *stokTransferRepository) GetAll(warehouseFrom, warehouseTo uint, status string) ([]model.StokTransfers, error) {
	var data []model.StokTransfers
	query := r.db.Preload("Outlet").
		Preload("WarehousesFrom").
		Preload("WarehousesTo").
		Preload("CreatedByUsr").
		Preload("ApprovedByUsr").
		Preload("StokTransferItem.Ingredient").
		Preload("StokTransferItem.Unit")

	if warehouseFrom > 0 {
		query = query.Where("warehouse_from = ?", warehouseFrom)
	}
	if warehouseTo > 0 {
		query = query.Where("warehouse_to = ?", warehouseTo)
	}
	if status != "" {
		query = query.Where("status_transfer = ?", status)
	}

	err := query.Order("transfer_date DESC").Find(&data).Error
	return data, err
}

func (r *stokTransferRepository) GetByID(id uint) (*model.StokTransfers, error) {
	return r.GetByIDWithTx(r.db, id)
}

func (r *stokTransferRepository) GetByIDWithTx(tx *gorm.DB, id uint) (*model.StokTransfers, error) {
	var data model.StokTransfers
	err := tx.Preload("Outlet").
		Preload("WarehousesFrom").
		Preload("WarehousesTo").
		Preload("CreatedByUsr").
		Preload("ApprovedByUsr").
		Preload("StokTransferItem.Ingredient").
		Preload("StokTransferItem.Unit").
		First(&data, "id_stok_transfer = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}

func (r *stokTransferRepository) CountTodayTransfers() (int64, error) {
	var count int64
	today := time.Now().Format("2006-01-02")
	err := r.db.Model(&model.StokTransfers{}).
		Where("DATE(transfer_date) = ?", today).
		Count(&count).Error
	return count, err
}
