package stokmovements

import (
	"backend/internal/shared/model"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type StokMovementService interface {
	GetAll(wirehouseID, ingredientID uint, movementType string, startDate, endDate string) ([]model.StokMovements, error)
	GetByID(id uint) (*model.StokMovements, error)
	LogMovement(tx *gorm.DB, warehouseFrom, warehouseTo, ingredientID, userID, refID uint, refType, movementType string, qty, unitCost decimal.Decimal, remarks, notes string) error
}

type stokMovementservice struct {
	repo StokMovementRepository
}

func NewStokMovementService(repo StokMovementRepository) StokMovementService {
	return &stokMovementservice{repo}
}

func (s *stokMovementservice) GetAll(wirehouseID, ingredientID uint, movementType string, startDate, endDate string) ([]model.StokMovements, error) {
	return s.repo.GetAll(wirehouseID, ingredientID, movementType, startDate, endDate)
}

func (s *stokMovementservice) GetByID(id uint) (*model.StokMovements, error) {
	return s.repo.GetByID(id)
}

func (s *stokMovementservice) LogMovement(tx *gorm.DB, wirehouseFrom, wirehouseTo, ingredientID, userID, refID uint, refType, movementType string, qty, unitCost decimal.Decimal, remarks, notes string) error {
	var whFrom *uint
	if wirehouseFrom > 0 {
		whFrom = &wirehouseFrom
	}

	var whTo *uint
	if wirehouseTo > 0 {
		whTo = &wirehouseTo
	}

	var rID *uint
	if refID > 0 {
		rID = &refID
	}

	movement := &model.StokMovements{
		WirehouseFrom: whFrom,
		WirehouseTo:   whTo,
		IngredientRef: ingredientID,
		CreatedBy:     userID,
		RefenceId:     rID,
		ReferenceType: refType,
		MovementType:  movementType,
		MovementDate:  time.Now(),
		Qty:           qty,
		UnitCost:      unitCost,
		Remarks:       remarks,
		Notes:         notes,
	}

	return s.repo.CreateWithTx(tx, movement)
}
