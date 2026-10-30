package reports_test

import (
	"backend/internal/shared/model"
)

// MockReportService implements reports.ReportService
type MockReportService struct {
	DashboardMetricsData   map[string]interface{}
	SalesSummaryData       map[string]interface{}
	SalesDetailsData       []model.SalesOrders
	ProductSalesData       []map[string]interface{}
	PaymentSummaryData     []map[string]interface{}
	CurrentStockData       []map[string]interface{}
	LowStockAlertsData     []map[string]interface{}
	StockMovementsData     []model.StokMovements
	StockOpnamesData       []model.StokOpnames
	StockAdjustmentsData   []model.StokAdjustments
	StockTransfersData     []model.StokTransfers
	WasteReportData        []model.Wastes
	PurchaseOrdersData     []model.PurchaseOrders
	GoodReceiptsData       []model.GoodReceipts
	ProductionSummaryData  []model.Productions
	ReservationSummaryData []model.Reservations
	Err                    error
}

func (m *MockReportService) GetDashboardMetrics(outletID uint) (map[string]interface{}, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.DashboardMetricsData, nil
}

func (m *MockReportService) GetSalesSummary(outletID uint, startDate, endDate, orderType string) (map[string]interface{}, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.SalesSummaryData, nil
}

func (m *MockReportService) GetSalesDetails(outletID, cashierID, tableID uint, status, paymentStatus, orderType, startDate, endDate string) ([]model.SalesOrders, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.SalesDetailsData, nil
}

func (m *MockReportService) GetProductSales(outletID, categoryID uint, startDate, endDate string) ([]map[string]interface{}, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.ProductSalesData, nil
}

func (m *MockReportService) GetPaymentSummary(outletID uint, startDate, endDate string) ([]map[string]interface{}, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.PaymentSummaryData, nil
}

func (m *MockReportService) GetCurrentStock(warehouseID, categoryID uint, statusFilter string) ([]map[string]interface{}, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.CurrentStockData, nil
}

func (m *MockReportService) GetLowStockAlerts(warehouseID uint) ([]map[string]interface{}, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.LowStockAlertsData, nil
}

func (m *MockReportService) GetStockMovements(warehouseID, ingredientID uint, movementType, refType, startDate, endDate string) ([]model.StokMovements, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.StockMovementsData, nil
}

func (m *MockReportService) GetStockOpnames(warehouseID uint, status, startDate, endDate string) ([]model.StokOpnames, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.StockOpnamesData, nil
}

func (m *MockReportService) GetStockAdjustments(warehouseID, ingredientID uint, startDate, endDate string) ([]model.StokAdjustments, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.StockAdjustmentsData, nil
}

func (m *MockReportService) GetStockTransfers(warehouseFrom, warehouseTo uint, status, startDate, endDate string) ([]model.StokTransfers, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.StockTransfersData, nil
}

func (m *MockReportService) GetWasteReport(outletID, warehouseID, ingredientID uint, startDate, endDate string) ([]model.Wastes, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.WasteReportData, nil
}

func (m *MockReportService) GetPurchaseOrders(supplierID, warehouseID uint, status, startDate, endDate string) ([]model.PurchaseOrders, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.PurchaseOrdersData, nil
}

func (m *MockReportService) GetGoodReceipts(supplierID, warehouseID uint, status, startDate, endDate string) ([]model.GoodReceipts, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.GoodReceiptsData, nil
}

func (m *MockReportService) GetProductionSummary(outletID, warehouseID, productID uint, status, startDate, endDate string) ([]model.Productions, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.ProductionSummaryData, nil
}

func (m *MockReportService) GetReservationSummary(outletID, tableID uint, status, startDate, endDate string) ([]model.Reservations, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.ReservationSummaryData, nil
}
