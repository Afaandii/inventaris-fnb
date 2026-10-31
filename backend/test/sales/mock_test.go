package sales_test

import (
	payments "backend/internal/modules/sales/payments"
	salesorders "backend/internal/modules/sales/sales_orders"
	"backend/internal/shared/model"
	"time"

	"github.com/shopspring/decimal"
)

// ========================
// MOCK SALES ORDERS SERVICE
// ========================

type MockSalesOrderService struct {
	Orders []model.SalesOrders
	Err    error
}

func (m *MockSalesOrderService) GetAll(outletID, cashierID, tableID uint, status, paymentStatus, orderType, startDate, endDate string) ([]model.SalesOrders, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	var res []model.SalesOrders
	for _, o := range m.Orders {
		if outletID > 0 && o.OutletRef != outletID {
			continue
		}
		if cashierID > 0 && o.CashierRef != cashierID {
			continue
		}
		if status != "" && o.StatusOrders != status {
			continue
		}
		res = append(res, o)
	}
	return res, nil
}

func (m *MockSalesOrderService) GetByID(id uint) (*model.SalesOrders, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, o := range m.Orders {
		if o.IDSalesOrder == id {
			return &o, nil
		}
	}
	return nil, nil
}

func (m *MockSalesOrderService) Create(input salesorders.CreateSalesOrderInput) (*model.SalesOrders, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	custName := input.CustomerName
	if custName == "" {
		custName = "Guest"
	}
	order := &model.SalesOrders{
		IDSalesOrder:  1,
		OutletRef:     input.OutletID,
		TableRef:      input.TableID,
		CashierRef:    input.CashierID,
		OrderNumber:   "SO-20261028-001",
		OrderType:     input.OrderType,
		CustomerName:  custName,
		QueueNumber:   "A-001",
		StatusOrders:  "confirmed",
		PaymentStatus: "unpaid",
		TotalAmount:   decimal.NewFromFloat(50000),
		Notes:         input.Notes,
		OrderDate:     time.Now(),
	}
	return order, nil
}

func (m *MockSalesOrderService) UpdateStatus(id uint, status string, userID uint) (*model.SalesOrders, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for i, o := range m.Orders {
		if o.IDSalesOrder == id {
			m.Orders[i].StatusOrders = status
			return &m.Orders[i], nil
		}
	}
	return &model.SalesOrders{
		IDSalesOrder: id,
		StatusOrders: status,
	}, nil
}

func (m *MockSalesOrderService) CancelOrder(id uint, userID uint) (*model.SalesOrders, error) {
	return m.UpdateStatus(id, "cancelled", userID)
}

// ========================
// MOCK SALES ORDER ITEMS SERVICE
// ========================

type MockSalesOrderItemService struct {
	Items []model.SalesOrderItems
	Err   error
}

func (m *MockSalesOrderItemService) GetAll(orderID uint) ([]model.SalesOrderItems, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	var res []model.SalesOrderItems
	for _, it := range m.Items {
		if orderID > 0 && it.OrderRef != orderID {
			continue
		}
		res = append(res, it)
	}
	return res, nil
}

func (m *MockSalesOrderItemService) GetByID(id uint) (*model.SalesOrderItems, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, it := range m.Items {
		if it.IDSalesOrderItem == id {
			return &it, nil
		}
	}
	return nil, nil
}

// ========================
// MOCK PAYMENTS SERVICE
// ========================

type MockPaymentService struct {
	Payments []model.Payments
	Err      error
}

func (m *MockPaymentService) GetAll(orderID uint, status, method, provider string) ([]model.Payments, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	var res []model.Payments
	for _, p := range m.Payments {
		if orderID > 0 && p.OrderRef != orderID {
			continue
		}
		if status != "" && p.PaymentStatus != status {
			continue
		}
		if method != "" && p.PaymentMethod != method {
			continue
		}
		res = append(res, p)
	}
	return res, nil
}

func (m *MockPaymentService) GetByID(id uint) (*model.Payments, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, p := range m.Payments {
		if p.IDPayment == id {
			return &p, nil
		}
	}
	return nil, nil
}

func (m *MockPaymentService) Create(input payments.CreatePaymentInput) (*model.Payments, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	provider := input.PaymentProvider
	if provider == "" {
		provider = "manual"
	}
	status := input.PaymentStatus
	if status == "" {
		status = "paid"
	}
	paidAmount := decimal.NewFromFloat(input.PaidAmount)
	cashReceived := decimal.NewFromFloat(input.CashReceived)
	changeAmount := decimal.Zero
	if input.PaymentMethod == "cash" && cashReceived.GreaterThan(paidAmount) {
		changeAmount = cashReceived.Sub(paidAmount)
	}
	p := &model.Payments{
		IDPayment:        1,
		OrderRef:         input.OrderID,
		PaymentCode:      "PAY-20261028-001",
		PaymentMethod:    input.PaymentMethod,
		PaidAmount:       paidAmount,
		CashReceived:     cashReceived,
		ChangeAmount:     changeAmount,
		PaymentProvider:  provider,
		PaymentStatus:    status,
		ReferenceNumber:  input.ReferenceNumber,
		PaymentReference: input.PaymentReference,
		CreatedAt:        time.Now(),
	}
	return p, nil
}
