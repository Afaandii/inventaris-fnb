package payments

import (
	"backend/internal/shared/model"
	"errors"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type PaymentRepository interface {
	CreateWithTx(tx *gorm.DB, payment *model.Payments) error
	GetAll(orderID uint, status, method, provider string) ([]model.Payments, error)
	GetByID(id uint) (*model.Payments, error)
	GetByIDWithTx(tx *gorm.DB, id uint) (*model.Payments, error)
	CountTodayPayments() (int64, error)
	GetTotalPaidByOrderIDWithTx(tx *gorm.DB, orderID uint) (decimal.Decimal, error)
}

type paymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) PaymentRepository {
	return &paymentRepository{db}
}

func (r *paymentRepository) CreateWithTx(tx *gorm.DB, payment *model.Payments) error {
	return tx.Create(payment).Error
}

func (r *paymentRepository) GetAll(orderID uint, status, method, provider string) ([]model.Payments, error) {
	var data []model.Payments
	query := r.db.Preload("SalesOrder")

	if orderID > 0 {
		query = query.Where("sales_order_id = ?", orderID)
	}
	if status != "" {
		query = query.Where("payment_status = ?", status)
	}
	if method != "" {
		query = query.Where("payment_method = ?", method)
	}
	if provider != "" {
		query = query.Where("payment_provider = ?", provider)
	}

	err := query.Order("id_payment DESC").Find(&data).Error
	return data, err
}

func (r *paymentRepository) GetByID(id uint) (*model.Payments, error) {
	return r.GetByIDWithTx(r.db, id)
}

func (r *paymentRepository) GetByIDWithTx(tx *gorm.DB, id uint) (*model.Payments, error) {
	var data model.Payments
	err := tx.Preload("SalesOrder").First(&data, "id_payment = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}

func (r *paymentRepository) CountTodayPayments() (int64, error) {
	var count int64
	today := time.Now().Format("2006-01-02")
	err := r.db.Model(&model.Payments{}).
		Where("DATE(created_at) = ?", today).
		Count(&count).Error
	return count, err
}

func (r *paymentRepository) GetTotalPaidByOrderIDWithTx(tx *gorm.DB, orderID uint) (decimal.Decimal, error) {
	var payments []model.Payments
	err := tx.Where("sales_order_id = ? AND payment_status = ?", orderID, "paid").Find(&payments).Error
	if err != nil {
		return decimal.Zero, err
	}

	totalPaid := decimal.Zero
	for _, p := range payments {
		totalPaid = totalPaid.Add(p.PaidAmount)
	}
	return totalPaid, nil
}
