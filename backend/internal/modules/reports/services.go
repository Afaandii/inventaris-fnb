package reports

import (
	"backend/internal/shared/model"

	"gorm.io/gorm"
)

type ReportService interface {
	GetDashboardMetrics(outletID uint) (map[string]interface{}, error)
	GetSalesSummary(outletID uint, startDate, endDate, orderType string) (map[string]interface{}, error)
	GetSalesDetails(outletID, cashierID, tableID uint, status, paymentStatus, orderType, startDate, endDate string) ([]model.SalesOrders, error)
	GetProductSales(outletID, categoryID uint, startDate, endDate string) ([]map[string]interface{}, error)
	GetPaymentSummary(outletID uint, startDate, endDate string) ([]map[string]interface{}, error)
	GetCurrentStock(warehouseID, categoryID uint, statusFilter string) ([]map[string]interface{}, error)
	GetLowStockAlerts(warehouseID uint) ([]map[string]interface{}, error)
	GetStockMovements(warehouseID, ingredientID uint, movementType, refType, startDate, endDate string) ([]model.StokMovements, error)
	GetStockOpnames(warehouseID uint, status, startDate, endDate string) ([]model.StokOpnames, error)
	GetStockAdjustments(warehouseID, ingredientID uint, startDate, endDate string) ([]model.StokAdjustments, error)
	GetStockTransfers(warehouseFrom, warehouseTo uint, status, startDate, endDate string) ([]model.StokTransfers, error)
	GetWasteReport(outletID, warehouseID, ingredientID uint, startDate, endDate string) ([]model.Wastes, error)
	GetPurchaseOrders(supplierID, warehouseID uint, status, startDate, endDate string) ([]model.PurchaseOrders, error)
	GetGoodReceipts(supplierID, warehouseID uint, status, startDate, endDate string) ([]model.GoodReceipts, error)
	GetProductionSummary(outletID, warehouseID, productID uint, status, startDate, endDate string) ([]model.Productions, error)
	GetReservationSummary(outletID, tableID uint, status, startDate, endDate string) ([]model.Reservations, error)
}

type reportService struct {
	db   *gorm.DB
	repo ReportRepository
}

func NewReportService(db *gorm.DB, repo ReportRepository) ReportService {
	return &reportService{db, repo}
}

func (s *reportService) GetDashboardMetrics(outletID uint) (map[string]interface{}, error) {
	return s.repo.GetDashboardMetrics(outletID)
}

func (s *reportService) GetSalesSummary(outletID uint, startDate, endDate, orderType string) (map[string]interface{}, error) {
	return s.repo.GetSalesSummary(outletID, startDate, endDate, orderType)
}

func (s *reportService) GetSalesDetails(outletID, cashierID, tableID uint, status, paymentStatus, orderType, startDate, endDate string) ([]model.SalesOrders, error) {
	return s.repo.GetSalesDetails(outletID, cashierID, tableID, status, paymentStatus, orderType, startDate, endDate)
}

func (s *reportService) GetProductSales(outletID, categoryID uint, startDate, endDate string) ([]map[string]interface{}, error) {
	return s.repo.GetProductSales(outletID, categoryID, startDate, endDate)
}

func (s *reportService) GetPaymentSummary(outletID uint, startDate, endDate string) ([]map[string]interface{}, error) {
	return s.repo.GetPaymentSummary(outletID, startDate, endDate)
}

func (s *reportService) GetCurrentStock(warehouseID, categoryID uint, statusFilter string) ([]map[string]interface{}, error) {
	return s.repo.GetCurrentStock(warehouseID, categoryID, statusFilter)
}

func (s *reportService) GetLowStockAlerts(warehouseID uint) ([]map[string]interface{}, error) {
	return s.repo.GetLowStockAlerts(warehouseID)
}

func (s *reportService) GetStockMovements(warehouseID, ingredientID uint, movementType, refType, startDate, endDate string) ([]model.StokMovements, error) {
	return s.repo.GetStockMovements(warehouseID, ingredientID, movementType, refType, startDate, endDate)
}

func (s *reportService) GetStockOpnames(warehouseID uint, status, startDate, endDate string) ([]model.StokOpnames, error) {
	return s.repo.GetStockOpnames(warehouseID, status, startDate, endDate)
}

func (s *reportService) GetStockAdjustments(warehouseID, ingredientID uint, startDate, endDate string) ([]model.StokAdjustments, error) {
	return s.repo.GetStockAdjustments(warehouseID, ingredientID, startDate, endDate)
}

func (s *reportService) GetStockTransfers(warehouseFrom, warehouseTo uint, status, startDate, endDate string) ([]model.StokTransfers, error) {
	return s.repo.GetStockTransfers(warehouseFrom, warehouseTo, status, startDate, endDate)
}

func (s *reportService) GetWasteReport(outletID, warehouseID, ingredientID uint, startDate, endDate string) ([]model.Wastes, error) {
	return s.repo.GetWasteReport(outletID, warehouseID, ingredientID, startDate, endDate)
}

func (s *reportService) GetPurchaseOrders(supplierID, warehouseID uint, status, startDate, endDate string) ([]model.PurchaseOrders, error) {
	return s.repo.GetPurchaseOrders(supplierID, warehouseID, status, startDate, endDate)
}

func (s *reportService) GetGoodReceipts(supplierID, warehouseID uint, status, startDate, endDate string) ([]model.GoodReceipts, error) {
	return s.repo.GetGoodReceipts(supplierID, warehouseID, status, startDate, endDate)
}

func (s *reportService) GetProductionSummary(outletID, warehouseID, productID uint, status, startDate, endDate string) ([]model.Productions, error) {
	return s.repo.GetProductionSummary(outletID, warehouseID, productID, status, startDate, endDate)
}

func (s *reportService) GetReservationSummary(outletID, tableID uint, status, startDate, endDate string) ([]model.Reservations, error) {
	return s.repo.GetReservationSummary(outletID, tableID, status, startDate, endDate)
}
