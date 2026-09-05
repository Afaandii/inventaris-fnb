package payments

import (
	"backend/internal/shared/model"
	"backend/pkg/helper"
	"errors"
	"fmt"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type CreatePaymentInput struct {
	OrderID          uint    `json:"sales_order_id" validate:"required,number,min=1"`
	PaymentMethod    string  `json:"payment_method" validate:"required,oneof=cash card qris bank_transfer debit_card credit_card e_wallet"`
	PaidAmount       float64 `json:"paid_amount" validate:"required,numeric,gt=0"`
	CashReceived     float64 `json:"cash_received" validate:"omitempty,numeric,min=0"`
	ReferenceNumber  string  `json:"reference_number"`
	PaymentReference string  `json:"payment_reference"`
	PaymentProvider  string  `json:"payment_provider" validate:"omitempty,oneof=midtrans xendit tripay doku manual"`
	PaymentStatus    string  `json:"payment_status" validate:"omitempty,oneof=pending paid failed cancelled refunded"`
}

type PaymentService interface {
	GetAll(orderID uint, status, method, provider string) ([]model.Payments, error)
	GetByID(id uint) (*model.Payments, error)
	Create(input CreatePaymentInput) (*model.Payments, error)
}

type paymentService struct {
	db   *gorm.DB
	repo PaymentRepository
}

func NewPaymentService(db *gorm.DB, repo PaymentRepository) PaymentService {
	return &paymentService{db, repo}
}

func (s *paymentService) GetAll(orderID uint, status, method, provider string) ([]model.Payments, error) {
	return s.repo.GetAll(orderID, status, method, provider)
}

func (s *paymentService) GetByID(id uint) (*model.Payments, error) {
	return s.repo.GetByID(id)
}

func (s *paymentService) Create(input CreatePaymentInput) (*model.Payments, error) {
	var order model.SalesOrders
	if err := s.db.First(&order, "id_sales_order = ?", input.OrderID).Error; err != nil {
		return nil, errors.New("sales order tidak ditemukan")
	}

	if order.StatusOrders == "cancelled" {
		return nil, errors.New("tidak dapat melakukan pembayaran untuk sales order yang sudah dibatalkan")
	}

	paidAmountDec := decimal.NewFromFloat(input.PaidAmount)
	cashReceivedDec := decimal.Zero
	changeAmountDec := decimal.Zero

	if input.PaymentMethod == "cash" {
		cashReceivedDec = decimal.NewFromFloat(input.CashReceived)
		if cashReceivedDec.IsZero() {
			cashReceivedDec = paidAmountDec
		}
		if cashReceivedDec.LessThan(paidAmountDec) {
			return nil, fmt.Errorf("uang tunai yang diterima (%s) kurang dari jumlah yang harus dibayar (%s)", cashReceivedDec.String(), paidAmountDec.String())
		}
		changeAmountDec = cashReceivedDec.Sub(paidAmountDec)
	}

	paymentProvider := input.PaymentProvider
	if paymentProvider == "" {
		paymentProvider = "manual"
	}

	paymentStatus := input.PaymentStatus
	if paymentStatus == "" {
		paymentStatus = "paid"
	}

	count, err := s.repo.CountTodayPayments()
	if err != nil {
		return nil, err
	}
	paymentCode := helper.GenerateCodePayment(int(count))

	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	payment := &model.Payments{
		OrderRef:         input.OrderID,
		PaymentCode:      paymentCode,
		PaymentMethod:    input.PaymentMethod,
		PaidAmount:       paidAmountDec,
		CashReceived:     cashReceivedDec,
		ReferenceNumber:  input.ReferenceNumber,
		PaymentReference: input.PaymentReference,
		ChangeAmount:     changeAmountDec,
		PaymentProvider:  paymentProvider,
		PaymentStatus:    paymentStatus,
		CreatedAt:        time.Now(),
	}

	if err := s.repo.CreateWithTx(tx, payment); err != nil {
		tx.Rollback()
		return nil, err
	}

	// Cek akumulasi total pembayaran yang berhasil di payments
	if paymentStatus == "paid" {
		totalPaid, err := s.repo.GetTotalPaidByOrderIDWithTx(tx, input.OrderID)
		if err != nil {
			tx.Rollback()
			return nil, err
		}

		if totalPaid.GreaterThanOrEqual(order.TotalAmount) {
			order.PaymentStatus = "paid"
			if err := tx.Save(&order).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.repo.GetByID(payment.IDPayment)
}
