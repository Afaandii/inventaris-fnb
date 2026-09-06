package reports

import (
	"backend/internal/shared/model"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type ReportRepository interface {
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

type reportRepository struct {
	db *gorm.DB
}

func NewReportRepository(db *gorm.DB) ReportRepository {
	return &reportRepository{db}
}

func (r *reportRepository) GetDashboardMetrics(outletID uint) (map[string]interface{}, error) {
	today := time.Now().Format("2006-01-02")
	metrics := make(map[string]interface{})

	// 1. Today's Sales & Transactions Count
	var todaySales struct {
		TotalAmount decimal.Decimal
		TotalCount  int64
	}
	salesQuery := r.db.Model(&model.SalesOrders{}).
		Where("status_order != ? AND DATE(order_date) = ?", "cancelled", today)
	if outletID > 0 {
		salesQuery = salesQuery.Where("outlet_id = ?", outletID)
	}

	var sumTotal decimal.Decimal
	_ = salesQuery.Select("COALESCE(SUM(total_amount), 0)").Scan(&sumTotal).Error
	var countSales int64
	_ = salesQuery.Count(&countSales).Error

	todaySales.TotalAmount = sumTotal
	todaySales.TotalCount = countSales
	metrics["today_sales"] = todaySales

	// 2. Low Stock Items Count
	var lowStockCount int64
	_ = r.db.Raw(`
		SELECT COUNT(*) FROM (
			SELECT i.id_ingredient, i.min_stock, COALESCE(SUM(b.available_qty), 0) as total_avail
			FROM ingredients i
			LEFT JOIN stok_balances b ON i.id_ingredient = b.ingredient_id
			WHERE i.status_ingredient = 'active'
			GROUP BY i.id_ingredient, i.min_stock
			HAVING COALESCE(SUM(b.available_qty), 0) <= i.min_stock
		) as low_items
	`).Scan(&lowStockCount).Error
	metrics["low_stock_count"] = lowStockCount

	// 3. Today's Reservations Count
	var reservationQuery = r.db.Model(&model.Reservations{}).Where("DATE(reservation_date) = ?", today)
	if outletID > 0 {
		reservationQuery = reservationQuery.Where("outlet_id = ?", outletID)
	}
	var rsvCount int64
	_ = reservationQuery.Count(&rsvCount).Error
	metrics["today_reservations_count"] = rsvCount

	// 4. Today's Production Qty
	var prodQuery = r.db.Model(&model.Productions{}).Where("status_production = ? AND DATE(production_date) = ?", "completed", today)
	if outletID > 0 {
		prodQuery = prodQuery.Where("outlet_id = ?", outletID)
	}
	var sumProdQty decimal.Decimal
	_ = prodQuery.Select("COALESCE(SUM(qty), 0)").Scan(&sumProdQty).Error
	metrics["today_production_qty"] = sumProdQty

	// 5. Recent 5 Sales Orders
	var recentSales []model.SalesOrders
	rSalesQuery := r.db.Preload("Outlet").Preload("Cashier").Order("id_sales_order DESC").Limit(5)
	if outletID > 0 {
		rSalesQuery = rSalesQuery.Where("outlet_id = ?", outletID)
	}
	_ = rSalesQuery.Find(&recentSales).Error
	metrics["recent_sales_orders"] = recentSales

	// 6. Recent 5 Purchase Orders
	var recentPOs []model.PurchaseOrders
	_ = r.db.Preload("Supplier").Preload("Warehouse").Order("id_purchase_order DESC").Limit(5).Find(&recentPOs).Error
	metrics["recent_purchase_orders"] = recentPOs

	// 7. Recent 5 Good Receipts
	var recentGRs []model.GoodReceipts
	_ = r.db.Preload("Supplier").Preload("Warehouse").Order("id_good_receipt DESC").Limit(5).Find(&recentGRs).Error
	metrics["recent_good_receipts"] = recentGRs

	// 8. Top 5 Selling Products
	var topProducts []map[string]interface{}
	_ = r.db.Raw(`
		SELECT p.id_product, p.prod_name, pv.variant_name, SUM(soi.qty) as total_qty, SUM(soi.total_amount) as total_revenue
		FROM sales_order_items soi
		JOIN sales_orders so ON soi.sales_order_id = so.id_sales_order
		JOIN product_variants pv ON soi.product_variant_id = pv.id_product_variant
		JOIN products p ON pv.product_id = p.id_product
		WHERE so.status_order != 'cancelled'
		GROUP BY p.id_product, p.prod_name, pv.variant_name
		ORDER BY total_qty DESC
		LIMIT 5
	`).Scan(&topProducts).Error
	metrics["top_selling_products"] = topProducts

	return metrics, nil
}

func (r *reportRepository) GetSalesSummary(outletID uint, startDate, endDate, orderType string) (map[string]interface{}, error) {
	query := r.db.Model(&model.SalesOrders{}).Where("status_order != ?", "cancelled")

	if outletID > 0 {
		query = query.Where("outlet_id = ?", outletID)
	}
	if orderType != "" {
		query = query.Where("order_type = ?", orderType)
	}
	if startDate != "" {
		query = query.Where("DATE(order_date) >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("DATE(order_date) <= ?", endDate)
	}

	var result struct {
		TotalCount     int64
		Subtotal       decimal.Decimal
		DiscountAmount decimal.Decimal
		TaxAmount      decimal.Decimal
		ServiceCharge  decimal.Decimal
		TotalAmount    decimal.Decimal
	}

	err := query.Select(`
		COUNT(id_sales_order) as total_count,
		COALESCE(SUM(subtotal), 0) as subtotal,
		COALESCE(SUM(discount_amount), 0) as discount_amount,
		COALESCE(SUM(tax_amount), 0) as tax_amount,
		COALESCE(SUM(service_charge), 0) as service_charge,
		COALESCE(SUM(total_amount), 0) as total_amount
	`).Scan(&result).Error

	if err != nil {
		return nil, err
	}

	summary := map[string]interface{}{
		"total_transactions": result.TotalCount,
		"subtotal":           result.Subtotal,
		"discount_amount":    result.DiscountAmount,
		"tax_amount":         result.TaxAmount,
		"service_charge":     result.ServiceCharge,
		"net_sales":          result.TotalAmount,
	}

	return summary, nil
}

func (r *reportRepository) GetSalesDetails(outletID, cashierID, tableID uint, status, paymentStatus, orderType, startDate, endDate string) ([]model.SalesOrders, error) {
	var data []model.SalesOrders
	query := r.db.Preload("Outlet").
		Preload("Table").
		Preload("Cashier").
		Preload("Payment").
		Preload("SalesOrderItem.ProductVariant.Product")

	if outletID > 0 {
		query = query.Where("outlet_id = ?", outletID)
	}
	if cashierID > 0 {
		query = query.Where("cashier_id = ?", cashierID)
	}
	if tableID > 0 {
		query = query.Where("table_id = ?", tableID)
	}
	if status != "" {
		query = query.Where("status_order = ?", status)
	}
	if paymentStatus != "" {
		query = query.Where("payment_status = ?", paymentStatus)
	}
	if orderType != "" {
		query = query.Where("order_type = ?", orderType)
	}
	if startDate != "" {
		query = query.Where("DATE(order_date) >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("DATE(order_date) <= ?", endDate)
	}

	err := query.Order("id_sales_order DESC").Find(&data).Error
	return data, err
}

func (r *reportRepository) GetProductSales(outletID, categoryID uint, startDate, endDate string) ([]map[string]interface{}, error) {
	var results []map[string]interface{}
	query := r.db.Table("sales_order_items soi").
		Select("p.id_product, p.prod_name, pv.variant_name, c.category_name, SUM(soi.qty) as total_qty, SUM(soi.total_amount) as total_revenue").
		Joins("JOIN sales_orders so ON soi.sales_order_id = so.id_sales_order").
		Joins("JOIN product_variants pv ON soi.product_variant_id = pv.id_product_variant").
		Joins("JOIN products p ON pv.product_id = p.id_product").
		Joins("LEFT JOIN categories c ON p.category_id = c.id_category").
		Where("so.status_order != ?", "cancelled")

	if outletID > 0 {
		query = query.Where("so.outlet_id = ?", outletID)
	}
	if categoryID > 0 {
		query = query.Where("p.category_id = ?", categoryID)
	}
	if startDate != "" {
		query = query.Where("DATE(so.order_date) >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("DATE(so.order_date) <= ?", endDate)
	}

	err := query.Group("p.id_product, p.prod_name, pv.variant_name, c.category_name").
		Order("total_qty DESC").
		Scan(&results).Error

	return results, err
}

func (r *reportRepository) GetPaymentSummary(outletID uint, startDate, endDate string) ([]map[string]interface{}, error) {
	var results []map[string]interface{}
	query := r.db.Table("payments p").
		Select("p.payment_method, p.payment_provider, p.payment_status, COUNT(p.id_payment) as transaction_count, SUM(p.paid_amount) as total_paid, SUM(p.change_amount) as total_change").
		Joins("JOIN sales_orders so ON p.sales_order_id = so.id_sales_order")

	if outletID > 0 {
		query = query.Where("so.outlet_id = ?", outletID)
	}
	if startDate != "" {
		query = query.Where("DATE(p.created_at) >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("DATE(p.created_at) <= ?", endDate)
	}

	err := query.Group("p.payment_method, p.payment_provider, p.payment_status").
		Order("total_paid DESC").
		Scan(&results).Error

	return results, err
}

func (r *reportRepository) GetCurrentStock(warehouseID, categoryID uint, statusFilter string) ([]map[string]interface{}, error) {
	var results []map[string]interface{}
	query := r.db.Table("ingredients i").
		Select("i.id_ingredient, i.ingre_name, c.category_name, u.name as unit_name, w.wirehouse_name, i.min_stock, i.max_stock, COALESCE(SUM(b.available_qty), 0) as current_stock").
		Joins("LEFT JOIN categories c ON i.category_id = c.id_category").
		Joins("LEFT JOIN units u ON i.unit_id = u.id_unit").
		Joins("LEFT JOIN stok_balances b ON i.id_ingredient = b.ingredient_id").
		Joins("LEFT JOIN wirehouses w ON b.wirehouse_id = w.id_wirehouse").
		Where("i.status_ingredient = ?", "active")

	if warehouseID > 0 {
		query = query.Where("b.wirehouse_id = ?", warehouseID)
	}
	if categoryID > 0 {
		query = query.Where("i.category_id = ?", categoryID)
	}

	err := query.Group("i.id_ingredient, i.ingre_name, c.category_name, u.name, w.wirehouse_name, i.min_stock, i.max_stock").
		Order("i.ingre_name ASC").
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	var formatted []map[string]interface{}
	for _, item := range results {
		currentStock := item["current_stock"].(int64)
		minStock := item["min_stock"].(int64)

		stockStatus := "NORMAL"
		if currentStock <= 0 {
			stockStatus = "OUT_OF_STOCK"
		} else if currentStock <= minStock {
			stockStatus = "LOW"
		}

		if statusFilter != "" && statusFilter != stockStatus {
			continue
		}

		item["stock_status"] = stockStatus
		formatted = append(formatted, item)
	}

	return formatted, nil
}

func (r *reportRepository) GetLowStockAlerts(warehouseID uint) ([]map[string]interface{}, error) {
	return r.GetCurrentStock(warehouseID, 0, "LOW")
}

func (r *reportRepository) GetStockMovements(warehouseID, ingredientID uint, movementType, refType, startDate, endDate string) ([]model.StokMovements, error) {
	var data []model.StokMovements
	query := r.db.Preload("Ingredient").
		Preload("WirehouseFrom").
		Preload("WirehouseTo").
		Preload("User")

	if warehouseID > 0 {
		query = query.Where("wirehouse_from_id = ? OR wirehouse_to_id = ?", warehouseID, warehouseID)
	}
	if ingredientID > 0 {
		query = query.Where("ingredient_id = ?", ingredientID)
	}
	if movementType != "" {
		query = query.Where("movement_type = ?", movementType)
	}
	if refType != "" {
		query = query.Where("reference_type = ?", refType)
	}
	if startDate != "" {
		query = query.Where("DATE(created_at) >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("DATE(created_at) <= ?", endDate)
	}

	err := query.Order("id_stok_movement DESC").Find(&data).Error
	return data, err
}

func (r *reportRepository) GetStockOpnames(warehouseID uint, status, startDate, endDate string) ([]model.StokOpnames, error) {
	var data []model.StokOpnames
	query := r.db.Preload("Wirehouse").
		Preload("User").
		Preload("StokOpnameItem.Ingredient").
		Preload("StokOpnameItem.Unit")

	if warehouseID > 0 {
		query = query.Where("wirehouse_id = ?", warehouseID)
	}
	if status != "" {
		query = query.Where("status_opname = ?", status)
	}
	if startDate != "" {
		query = query.Where("DATE(opname_date) >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("DATE(opname_date) <= ?", endDate)
	}

	err := query.Order("id_stok_opname DESC").Find(&data).Error
	return data, err
}

func (r *reportRepository) GetStockAdjustments(warehouseID, ingredientID uint, startDate, endDate string) ([]model.StokAdjustments, error) {
	var data []model.StokAdjustments
	query := r.db.Preload("Wirehouse").
		Preload("Ingredient").
		Preload("User")

	if warehouseID > 0 {
		query = query.Where("wirehouse_id = ?", warehouseID)
	}
	if ingredientID > 0 {
		query = query.Where("ingredient_id = ?", ingredientID)
	}
	if startDate != "" {
		query = query.Where("DATE(adjustment_date) >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("DATE(adjustment_date) <= ?", endDate)
	}

	err := query.Order("id_stok_adjustment DESC").Find(&data).Error
	return data, err
}

func (r *reportRepository) GetStockTransfers(warehouseFrom, warehouseTo uint, status, startDate, endDate string) ([]model.StokTransfers, error) {
	var data []model.StokTransfers
	query := r.db.Preload("WarehouseFrom").
		Preload("WarehouseTo").
		Preload("User").
		Preload("StokTransferItem.Ingredient").
		Preload("StokTransferItem.Unit")

	if warehouseFrom > 0 {
		query = query.Where("warehouse_from_id = ?", warehouseFrom)
	}
	if warehouseTo > 0 {
		query = query.Where("warehouse_to_id = ?", warehouseTo)
	}
	if status != "" {
		query = query.Where("status_transfer = ?", status)
	}
	if startDate != "" {
		query = query.Where("DATE(transfer_date) >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("DATE(transfer_date) <= ?", endDate)
	}

	err := query.Order("id_stok_transfer DESC").Find(&data).Error
	return data, err
}

func (r *reportRepository) GetWasteReport(outletID, warehouseID, ingredientID uint, startDate, endDate string) ([]model.Wastes, error) {
	var data []model.Wastes
	query := r.db.Preload("Outlet").
		Preload("Wirehouse").
		Preload("Ingredient").
		Preload("Unit").
		Preload("User")

	if outletID > 0 {
		query = query.Where("outlet_id = ?", outletID)
	}
	if warehouseID > 0 {
		query = query.Where("wirehouse_id = ?", warehouseID)
	}
	if ingredientID > 0 {
		query = query.Where("ingredient_id = ?", ingredientID)
	}
	if startDate != "" {
		query = query.Where("DATE(waste_date) >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("DATE(waste_date) <= ?", endDate)
	}

	err := query.Order("id_waste DESC").Find(&data).Error
	return data, err
}

func (r *reportRepository) GetPurchaseOrders(supplierID, warehouseID uint, status, startDate, endDate string) ([]model.PurchaseOrders, error) {
	var data []model.PurchaseOrders
	query := r.db.Preload("Supplier").
		Preload("Warehouse").
		Preload("User").
		Preload("PurchaseItem.Ingredient").
		Preload("PurchaseItem.Unit")

	if supplierID > 0 {
		query = query.Where("supplier_id = ?", supplierID)
	}
	if warehouseID > 0 {
		query = query.Where("warehouse_id = ?", warehouseID)
	}
	if status != "" {
		query = query.Where("status_purchase = ?", status)
	}
	if startDate != "" {
		query = query.Where("DATE(po_date) >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("DATE(po_date) <= ?", endDate)
	}

	err := query.Order("id_purchase_order DESC").Find(&data).Error
	return data, err
}

func (r *reportRepository) GetGoodReceipts(supplierID, warehouseID uint, status, startDate, endDate string) ([]model.GoodReceipts, error) {
	var data []model.GoodReceipts
	query := r.db.Preload("Supplier").
		Preload("Warehouse").
		Preload("User").
		Preload("GoodReceiptItem.Ingredient").
		Preload("GoodReceiptItem.Unit")

	if supplierID > 0 {
		query = query.Where("supplier_id = ?", supplierID)
	}
	if warehouseID > 0 {
		query = query.Where("warehouse_id = ?", warehouseID)
	}
	if status != "" {
		query = query.Where("status_receipt = ?", status)
	}
	if startDate != "" {
		query = query.Where("DATE(receipt_date) >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("DATE(receipt_date) <= ?", endDate)
	}

	err := query.Order("id_good_receipt DESC").Find(&data).Error
	return data, err
}

func (r *reportRepository) GetProductionSummary(outletID, warehouseID, productID uint, status, startDate, endDate string) ([]model.Productions, error) {
	var data []model.Productions
	query := r.db.Preload("Outlet").
		Preload("Warehouse").
		Preload("Unit").
		Preload("CreatedByUsr").
		Preload("Product")

	if outletID > 0 {
		query = query.Where("outlet_id = ?", outletID)
	}
	if warehouseID > 0 {
		query = query.Where("warehouse_id = ?", warehouseID)
	}
	if productID > 0 {
		query = query.Where("product_id = ?", productID)
	}
	if status != "" {
		query = query.Where("status_production = ?", status)
	}
	if startDate != "" {
		query = query.Where("DATE(production_date) >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("DATE(production_date) <= ?", endDate)
	}

	err := query.Order("id_production DESC").Find(&data).Error
	return data, err
}

func (r *reportRepository) GetReservationSummary(outletID, tableID uint, status, startDate, endDate string) ([]model.Reservations, error) {
	var data []model.Reservations
	query := r.db.Preload("Outlet").
		Preload("DiningTable").
		Preload("CreatedByUsr")

	if outletID > 0 {
		query = query.Where("outlet_id = ?", outletID)
	}
	if tableID > 0 {
		query = query.Where("table_id = ?", tableID)
	}
	if status != "" {
		query = query.Where("status_reservation = ?", status)
	}
	if startDate != "" {
		query = query.Where("DATE(reservation_date) >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("DATE(reservation_date) <= ?", endDate)
	}

	err := query.Order("id_reservation DESC").Find(&data).Error
	return data, err
}
