package inventory_test

import (
	stokopnames "backend/internal/modules/inventory/stok_opnames"
	stoktransfers "backend/internal/modules/inventory/stok_transfers"
	"backend/internal/shared/model"
	"errors"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// ========================
// MOCK STOK BALANCES
// ========================

type MockStokBalanceRepo struct {
	balances []model.StokBalances
	nextID   uint
}

func NewMockStokBalanceRepo() *MockStokBalanceRepo {
	return &MockStokBalanceRepo{
		balances: make([]model.StokBalances, 0),
		nextID:   1,
	}
}

func (m *MockStokBalanceRepo) GetAll(wirehouseID, ingredientID uint) ([]model.StokBalances, error) {
	var res []model.StokBalances
	for _, b := range m.balances {
		matchWh := (wirehouseID == 0 || b.WirehouseRef == wirehouseID)
		matchIng := (ingredientID == 0 || b.IngredientRef == ingredientID)
		if matchWh && matchIng {
			res = append(res, b)
		}
	}
	return res, nil
}

func (m *MockStokBalanceRepo) GetByID(id uint) (*model.StokBalances, error) {
	for _, b := range m.balances {
		if b.IDStokBalance == id {
			return &b, nil
		}
	}
	return nil, nil
}

func (m *MockStokBalanceRepo) GetByIngredientAndWarehouse(ingredientID, wirehouseID uint) ([]model.StokBalances, error) {
	return m.GetAll(wirehouseID, ingredientID)
}

func (m *MockStokBalanceRepo) GetByIngredientAndWarehouseAndBatch(ingredientID, wirehouseID uint, batchNo string) (*model.StokBalances, error) {
	return m.GetByIngredientAndWarehouseAndBatchWithTx(nil, ingredientID, wirehouseID, batchNo)
}

func (m *MockStokBalanceRepo) GetByIngredientAndWarehouseAndBatchWithTx(tx *gorm.DB, ingredientID, wirehouseID uint, batchNo string) (*model.StokBalances, error) {
	for _, b := range m.balances {
		if b.IngredientRef == ingredientID && b.WirehouseRef == wirehouseID && b.BatchNo == batchNo {
			return &b, nil
		}
	}
	return nil, nil
}

func (m *MockStokBalanceRepo) Create(stok *model.StokBalances) error {
	return m.CreateWithTx(nil, stok)
}

func (m *MockStokBalanceRepo) CreateWithTx(tx *gorm.DB, stok *model.StokBalances) error {
	stok.IDStokBalance = m.nextID
	m.nextID++
	m.balances = append(m.balances, *stok)
	return nil
}

func (m *MockStokBalanceRepo) Update(stok *model.StokBalances) error {
	return m.UpdateWithTx(nil, stok)
}

func (m *MockStokBalanceRepo) UpdateWithTx(tx *gorm.DB, stok *model.StokBalances) error {
	for i, b := range m.balances {
		if b.IDStokBalance == stok.IDStokBalance {
			m.balances[i] = *stok
			return nil
		}
	}
	return errors.New("balance not found")
}

func (m *MockStokBalanceRepo) Delete(id uint) error {
	for i, b := range m.balances {
		if b.IDStokBalance == id {
			m.balances = append(m.balances[:i], m.balances[i+1:]...)
			return nil
		}
	}
	return errors.New("balance not found")
}

func (m *MockStokBalanceRepo) GetAvailableBatchesFEFO(ingredientID, wirehouseID uint) ([]model.StokBalances, error) {
	return m.GetAvailableBatchesFEFOWithTx(nil, ingredientID, wirehouseID)
}

func (m *MockStokBalanceRepo) GetAvailableBatchesFEFOWithTx(tx *gorm.DB, ingredientID, wirehouseID uint) ([]model.StokBalances, error) {
	var res []model.StokBalances
	for _, b := range m.balances {
		if b.IngredientRef == ingredientID && b.WirehouseRef == wirehouseID && b.AvailableQty > 0 {
			res = append(res, b)
		}
	}
	return res, nil
}

// Mock StokBalanceService (for handlers/direct service dependencies)
type MockStokBalanceService struct {
	Balances []model.StokBalances
	Err      error
}

func (m *MockStokBalanceService) GetAll(wirehouseID, ingredientID uint) ([]model.StokBalances, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.Balances, nil
}

func (m *MockStokBalanceService) GetByID(id uint) (*model.StokBalances, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, b := range m.Balances {
		if b.IDStokBalance == id {
			return &b, nil
		}
	}
	return nil, nil
}

func (m *MockStokBalanceService) AddStock(tx *gorm.DB, ingredientID, wirehouseID uint, qty uint, batchNo string, expireDate time.Time, unitCost decimal.Decimal, userID uint, refID uint, refType, remarks string) error {
	return m.Err
}

func (m *MockStokBalanceService) ReduceStock(tx *gorm.DB, ingredientID, wirehouseID uint, qty uint, userID uint, refID uint, refType, remarks string) error {
	return m.Err
}

func (m *MockStokBalanceService) TransferStock(tx *gorm.DB, ingredientID, wrehouseFromID, wirehouseToID uint, qty uint, userID uint, refID uint, remarks string) error {
	return m.Err
}

// ========================
// MOCK STOK MOVEMENTS
// ========================

type MockStokMovementRepo struct {
	movements []model.StokMovements
	nextID    uint
}

func NewMockStokMovementRepo() *MockStokMovementRepo {
	return &MockStokMovementRepo{
		movements: make([]model.StokMovements, 0),
		nextID:    1,
	}
}

func (m *MockStokMovementRepo) GetAll(wirehouseID, ingredientID uint, movementType string, startDate, endDate string) ([]model.StokMovements, error) {
	var res []model.StokMovements
	for _, mov := range m.movements {
		if movementType != "" && mov.MovementType != movementType {
			continue
		}
		if ingredientID != 0 && mov.IngredientRef != ingredientID {
			continue
		}
		res = append(res, mov)
	}
	return res, nil
}

func (m *MockStokMovementRepo) GetByID(id uint) (*model.StokMovements, error) {
	for _, mov := range m.movements {
		if mov.IDStokMovement == id {
			return &mov, nil
		}
	}
	return nil, nil
}

func (m *MockStokMovementRepo) CreateWithTx(tx *gorm.DB, movement *model.StokMovements) error {
	movement.IDStokMovement = m.nextID
	m.nextID++
	m.movements = append(m.movements, *movement)
	return nil
}

// Mock StokMovementService
type MockStokMovementService struct {
	Movements []model.StokMovements
	Err       error
}

func (m *MockStokMovementService) GetAll(wirehouseID, ingredientID uint, movementType string, startDate, endDate string) ([]model.StokMovements, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.Movements, nil
}

func (m *MockStokMovementService) GetByID(id uint) (*model.StokMovements, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, mov := range m.Movements {
		if mov.IDStokMovement == id {
			return &mov, nil
		}
	}
	return nil, nil
}

func (m *MockStokMovementService) LogMovement(tx *gorm.DB, warehouseFrom, warehouseTo, ingredientID, userID, refID uint, refType, movementType string, qty, unitCost decimal.Decimal, remarks, notes string) error {
	return m.Err
}

// ========================
// MOCK STOK ADJUSTMENTS
// ========================

type MockStokAdjustmentService struct {
	Adjustments []model.StokAdjustments
	Err         error
}

func (m *MockStokAdjustmentService) GetAll(warehouseID, ingredientID uint) ([]model.StokAdjustments, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.Adjustments, nil
}

func (m *MockStokAdjustmentService) GetByID(id uint) (*model.StokAdjustments, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, adj := range m.Adjustments {
		if adj.IDStokAdjustment == id {
			return &adj, nil
		}
	}
	return nil, nil
}

func (m *MockStokAdjustmentService) Create(warehouseID, ingredientID, createdBy uint, qty uint, reason string) (*model.StokAdjustments, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	adj := &model.StokAdjustments{
		IDStokAdjustment: 1,
		WirehouseRef:     warehouseID,
		IngredientRef:    ingredientID,
		CreatedBy:        createdBy,
		Qty:              decimal.NewFromInt(int64(qty)),
		Reason:           reason,
		AdjustmentDate:   time.Now(),
	}
	return adj, nil
}

// ========================
// MOCK STOK OPNAMES
// ========================

type MockStokOpnameService struct {
	Opnames []model.StokOpnames
	Summary []stokopnames.WarehouseStockSummary
	Err     error
}

func (m *MockStokOpnameService) GetAll(warehouseID uint, status string) ([]model.StokOpnames, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.Opnames, nil
}

func (m *MockStokOpnameService) GetByID(id uint) (*model.StokOpnames, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, op := range m.Opnames {
		if op.IDStokOpname == id {
			return &op, nil
		}
	}
	return nil, nil
}

func (m *MockStokOpnameService) GetStockSummary(warehouseID uint) ([]stokopnames.WarehouseStockSummary, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.Summary, nil
}

func (m *MockStokOpnameService) Create(input stokopnames.CreateOpnameInput) (*model.StokOpnames, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	op := &model.StokOpnames{
		IDStokOpname: 1,
		WirehouseRef: input.WarehouseID,
		CreatedBy:    input.CreatedBy,
		OpnameCode:   "OPN-20261025-001",
		StatusOpname: "draft",
		Notes:        input.Notes,
	}
	return op, nil
}

func (m *MockStokOpnameService) UpdateStatus(id uint, status string, approvedBy uint) (*model.StokOpnames, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for i, op := range m.Opnames {
		if op.IDStokOpname == id {
			m.Opnames[i].StatusOpname = status
			m.Opnames[i].ApprovedBy = approvedBy
			return &m.Opnames[i], nil
		}
	}
	return &model.StokOpnames{
		IDStokOpname: id,
		StatusOpname: status,
		ApprovedBy:   approvedBy,
	}, nil
}

// ========================
// MOCK STOK TRANSFERS
// ========================

type MockStokTransferService struct {
	Transfers []model.StokTransfers
	Err       error
}

func (m *MockStokTransferService) GetAll(warehouseFrom, warehouseTo uint, status string) ([]model.StokTransfers, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.Transfers, nil
}

func (m *MockStokTransferService) GetByID(id uint) (*model.StokTransfers, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, t := range m.Transfers {
		if t.IDStokTransfer == id {
			return &t, nil
		}
	}
	return nil, nil
}

func (m *MockStokTransferService) Create(input stoktransfers.CreateTransferInput) (*model.StokTransfers, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	t := &model.StokTransfers{
		IDStokTransfer: 1,
		WarehouseFrom:  input.WarehouseFrom,
		WarehouseTo:    input.WarehouseTo,
		CreatedBy:      input.CreatedBy,
		TransferCode:   "TRF-20261025-001",
		StatusTransfer: "draft",
		Notes:          input.Notes,
	}
	return t, nil
}

func (m *MockStokTransferService) UpdateStatus(id uint, status string, approvedBy uint) (*model.StokTransfers, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for i, t := range m.Transfers {
		if t.IDStokTransfer == id {
			m.Transfers[i].StatusTransfer = status
			m.Transfers[i].ApprovedBy = approvedBy
			return &m.Transfers[i], nil
		}
	}
	return &model.StokTransfers{
		IDStokTransfer: id,
		StatusTransfer: status,
		ApprovedBy:     approvedBy,
	}, nil
}

// ========================
// MOCK WASTES
// ========================

type MockWasteService struct {
	Wastes []model.Wastes
	Err    error
}

func (m *MockWasteService) GetAll(warehouseID, ingredientID uint) ([]model.Wastes, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.Wastes, nil
}

func (m *MockWasteService) GetByID(id uint) (*model.Wastes, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, w := range m.Wastes {
		if w.IDWaste == id {
			return &w, nil
		}
	}
	return nil, nil
}

func (m *MockWasteService) Create(warehouseID, ingredientID, createdBy uint, qty float64, reason string) (*model.Wastes, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	w := &model.Wastes{
		IDWaste:       1,
		WirehouseRef:  warehouseID,
		IngredientRef: ingredientID,
		CreatedBy:     createdBy,
		Qty:           decimal.NewFromFloat(qty),
		Reason:        reason,
		WasteDate:     time.Now(),
	}
	return w, nil
}
