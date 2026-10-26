package production_test

import (
	productions "backend/internal/modules/production/productions"
	"backend/internal/shared/model"
	"time"

	"github.com/shopspring/decimal"
)

// MockProductionService
type MockProductionService struct {
	Productions []model.Productions
	CheckResult *productions.StockCheckResult
	Err         error
}

func (m *MockProductionService) GetAll(productID, warehouseID, outletID uint, status string) ([]model.Productions, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	var res []model.Productions
	for _, p := range m.Productions {
		if productID > 0 && p.ProductRef != productID {
			continue
		}
		if warehouseID > 0 && p.WarehouseRef != warehouseID {
			continue
		}
		if outletID > 0 && p.OutletRef != outletID {
			continue
		}
		if status != "" && p.StatusProduction != status {
			continue
		}
		res = append(res, p)
	}
	return res, nil
}

func (m *MockProductionService) GetByID(id uint) (*model.Productions, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, p := range m.Productions {
		if p.IDProduction == id {
			return &p, nil
		}
	}
	return nil, nil
}

func (m *MockProductionService) Create(input productions.CreateProductionInput) (*model.Productions, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	prodDate := input.ProductionDate
	if prodDate.IsZero() {
		prodDate = time.Now()
	}
	prod := &model.Productions{
		IDProduction:     1,
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
	return prod, nil
}

func (m *MockProductionService) UpdateStatus(id uint, status string, userID uint) (*model.Productions, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for i, p := range m.Productions {
		if p.IDProduction == id {
			m.Productions[i].StatusProduction = status
			return &m.Productions[i], nil
		}
	}
	return &model.Productions{
		IDProduction:     id,
		StatusProduction: status,
	}, nil
}

func (m *MockProductionService) CheckStockRequirement(id uint) (*productions.StockCheckResult, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	if m.CheckResult != nil {
		return m.CheckResult, nil
	}
	return &productions.StockCheckResult{
		ProductionID: id,
		ProductID:    1,
		ProductName:  "Kopi Susu Literan",
		ProdQty:      10.0,
		CanProduce:   true,
		Ingredients: []productions.IngredientCheckDetail{
			{
				IngredientID: 1,
				IngreName:    "Espresso Base",
				UnitID:       1,
				UnitName:     "Liter",
				RequiredQty:  3.0,
				AvailableQty: 5.0,
				ShortageQty:  0.0,
				IsSufficient: true,
			},
		},
	}, nil
}
