package productions

import (
	stokbalances "backend/internal/modules/inventory/stok_balances"
	"backend/internal/shared/model"
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type CreateProductionInput struct {
	OutletID       uint      `json:"outlet_id" validate:"required,number,min=1"`
	WarehouseID    uint      `json:"warehouse_id" validate:"required,number,min=1"`
	UnitID         uint      `json:"unit_id" validate:"required,number,min=1"`
	CreatedBy      uint      `json:"created_by" validate:"required,number,min=1"`
	ProductID      uint      `json:"product_id" validate:"required,number,min=1"`
	Qty            float64   `json:"qty" validate:"required,numeric,gt=0"`
	ProductionDate time.Time `json:"production_date"`
	Notes          string    `json:"notes"`
}

type IngredientCheckDetail struct {
	IngredientID uint    `json:"ingredient_id"`
	IngreName    string  `json:"ingre_name"`
	UnitID       uint    `json:"unit_id"`
	UnitName     string  `json:"unit_name"`
	RequiredQty  float64 `json:"required_qty"`
	AvailableQty float64 `json:"available_qty"`
	ShortageQty  float64 `json:"shortage_qty"`
	IsSufficient bool    `json:"is_sufficient"`
}

type StockCheckResult struct {
	ProductionID uint                    `json:"production_id"`
	ProductID    uint                    `json:"product_id"`
	ProductName  string                  `json:"product_name"`
	ProdQty      float64                 `json:"prod_qty"`
	CanProduce   bool                    `json:"can_produce"`
	Ingredients  []IngredientCheckDetail `json:"ingredients"`
}

type ProductionService interface {
	GetAll(productID, warehouseID, outletID uint, status string) ([]model.Productions, error)
	GetByID(id uint) (*model.Productions, error)
	Create(input CreateProductionInput) (*model.Productions, error)
	UpdateStatus(id uint, status string, userID uint) (*model.Productions, error)
	CheckStockRequirement(id uint) (*StockCheckResult, error)
}

type productionService struct {
	db             *gorm.DB
	repo           ProductionRepository
	balanceService stokbalances.StokBalanceService
}

func NewProductionService(db *gorm.DB, repo ProductionRepository, balanceService stokbalances.StokBalanceService) ProductionService {
	return &productionService{db, repo, balanceService}
}

func (s *productionService) GetAll(productID, warehouseID, outletID uint, status string) ([]model.Productions, error) {
	return s.repo.GetAll(productID, warehouseID, outletID, status)
}

func (s *productionService) GetByID(id uint) (*model.Productions, error) {
	return s.repo.GetByID(id)
}

func (s *productionService) Create(input CreateProductionInput) (*model.Productions, error) {
	var product model.Products
	if err := s.db.First(&product, "id_product = ?", input.ProductID).Error; err != nil {
		return nil, errors.New("product tidak ditemukan")
	}

	recipe, err := s.repo.GetActiveRecipeByProductIDWithTx(s.db, input.ProductID)
	if err != nil {
		return nil, err
	}
	if recipe == nil {
		return nil, fmt.Errorf("produk '%s' tidak memiliki resep aktif. Silakan buat/aktifkan resep terlebih dahulu", product.ProdName)
	}

	var outlet model.Outlets
	if err := s.db.First(&outlet, "id_outlet = ?", input.OutletID).Error; err != nil {
		return nil, errors.New("outlet tidak ditemukan di master data")
	}

	var wirehouse model.Wirehouse
	if err := s.db.First(&wirehouse, "id_wirehouse = ?", input.WarehouseID).Error; err != nil {
		return nil, errors.New("warehouse tidak ditemukan di master data")
	}

	var unit model.Units
	if err := s.db.First(&unit, "id_unit = ?", input.UnitID).Error; err != nil {
		return nil, errors.New("unit tidak ditemukan di master data")
	}

	prodDate := input.ProductionDate
	if prodDate.IsZero() {
		prodDate = time.Now()
	}

	production := &model.Productions{
		OutletRef:        input.OutletID,
		WarehouseRef:     input.WarehouseID,
		UnitRef:          input.UnitID,
		CreatedBy:        input.CreatedBy,
		ProductRef:       input.ProductID,
		Qty:              decimal.NewFromFloat(input.Qty),
		StatusProduction: "draft",
		ProductionDate:   prodDate,
		Notes:            input.Notes,
	}

	if err := s.repo.Create(production); err != nil {
		return nil, err
	}

	return s.repo.GetByID(production.IDProduction)
}

func (s *productionService) CheckStockRequirement(id uint) (*StockCheckResult, error) {
	production, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if production == nil {
		return nil, errors.New("transaksi produksi tidak ditemukan")
	}

	recipe, err := s.repo.GetActiveRecipeByProductIDWithTx(s.db, production.ProductRef)
	if err != nil {
		return nil, err
	}
	if recipe == nil {
		return nil, fmt.Errorf("produk '%s' tidak memiliki resep aktif", production.Product.ProdName)
	}

	yieldQtyFloat, _ := recipe.YieldQty.Float64()
	if yieldQtyFloat <= 0 {
		yieldQtyFloat = 1.0
	}
	prodQtyFloat, _ := production.Qty.Float64()
	multiplier := prodQtyFloat / yieldQtyFloat

	canProduce := true
	var details []IngredientCheckDetail

	for _, item := range recipe.RecipeItem {
		itemQtyFloat, _ := item.Quantity.Float64()
		requiredQty := itemQtyFloat * multiplier

		availStock, err := s.repo.GetAvailableStockByIngredientAndWarehouseWithTx(s.db, item.IngredientRef, production.WarehouseRef)
		if err != nil {
			return nil, err
		}
		availStockFloat := float64(availStock)

		shortage := math.Max(0, requiredQty-availStockFloat)
		isSufficient := availStockFloat >= requiredQty

		if !isSufficient {
			canProduce = false
		}

		details = append(details, IngredientCheckDetail{
			IngredientID: item.IngredientRef,
			IngreName:    item.Ingredient.IngreName,
			UnitID:       item.UnitRef,
			UnitName:     item.Unit.UnitName,
			RequiredQty:  requiredQty,
			AvailableQty: availStockFloat,
			ShortageQty:  shortage,
			IsSufficient: isSufficient,
		})
	}

	return &StockCheckResult{
		ProductionID: production.IDProduction,
		ProductID:    production.ProductRef,
		ProductName:  production.Product.ProdName,
		ProdQty:      prodQtyFloat,
		CanProduce:   canProduce,
		Ingredients:  details,
	}, nil
}

func (s *productionService) UpdateStatus(id uint, status string, userID uint) (*model.Productions, error) {
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	production, err := s.repo.GetByIDWithTx(tx, id)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	if production == nil {
		tx.Rollback()
		return nil, errors.New("transaksi produksi tidak ditemukan")
	}

	currentStatus := production.StatusProduction
	if currentStatus == "completed" || currentStatus == "cancelled" {
		tx.Rollback()
		return nil, fmt.Errorf("status produksi %s tidak dapat diubah lagi", currentStatus)
	}

	switch status {
	case "in_progress":
		if currentStatus != "draft" {
			tx.Rollback()
			return nil, errors.New("hanya produksi berstatus draft yang dapat diubah ke in_progress")
		}
		production.StatusProduction = "in_progress"

	case "cancelled":
		production.StatusProduction = "cancelled"

	case "completed":
		// 1. Ambil active recipe
		recipe, err := s.repo.GetActiveRecipeByProductIDWithTx(tx, production.ProductRef)
		if err != nil {
			tx.Rollback()
			return nil, err
		}
		if recipe == nil {
			tx.Rollback()
			return nil, fmt.Errorf("produk '%s' tidak memiliki resep aktif", production.Product.ProdName)
		}

		yieldQtyFloat, _ := recipe.YieldQty.Float64()
		if yieldQtyFloat <= 0 {
			yieldQtyFloat = 1.0
		}
		prodQtyFloat, _ := production.Qty.Float64()
		multiplier := prodQtyFloat / yieldQtyFloat

		// 2. Loop Validasi ketersediaan stok seluruh bahan baku (Strict Mode)
		for _, item := range recipe.RecipeItem {
			itemQtyFloat, _ := item.Quantity.Float64()
			requiredQty := itemQtyFloat * multiplier
			requiredQtyUint := uint(math.Ceil(requiredQty))

			availStock, err := s.repo.GetAvailableStockByIngredientAndWarehouseWithTx(tx, item.IngredientRef, production.WarehouseRef)
			if err != nil {
				tx.Rollback()
				return nil, err
			}

			if availStock < requiredQtyUint {
				shortage := requiredQtyUint - availStock
				tx.Rollback()
				return nil, fmt.Errorf("stok bahan '%s' tidak mencukupi di gudang (Dibutuhkan: %d %s, Tersedia: %d %s, Kekurangan: %d %s)",
					item.Ingredient.IngreName, requiredQtyUint, item.Unit.UnitName, availStock, item.Unit.UnitName, shortage, item.Unit.UnitName)
			}
		}

		// 3. Loop Eksekusi Pemotongan Stok (FEFO) dan Pencatatan Log Mutasi
		for _, item := range recipe.RecipeItem {
			itemQtyFloat, _ := item.Quantity.Float64()
			requiredQty := itemQtyFloat * multiplier
			requiredQtyUint := uint(math.Ceil(requiredQty))

			if requiredQtyUint > 0 {
				err := s.balanceService.ReduceStock(
					tx,
					item.IngredientRef,
					production.WarehouseRef,
					requiredQtyUint,
					userID,
					production.IDProduction,
					"production",
					fmt.Sprintf("Konsumsi bahan produksi %s x %s (%s)", production.Product.ProdName, production.Qty.String(), item.Ingredient.IngreName),
				)
				if err != nil {
					tx.Rollback()
					return nil, err
				}
			}
		}

		production.StatusProduction = "completed"
		production.CompletedAt = time.Now()

	default:
		tx.Rollback()
		return nil, fmt.Errorf("status produksi tidak valid: %s", status)
	}

	if err := s.repo.UpdateWithTx(tx, production); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.repo.GetByID(production.IDProduction)
}
