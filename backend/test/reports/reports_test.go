package reports_test

import (
	"backend/internal/modules/reports"
	"backend/internal/shared/model"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

func setupTestRouter(service reports.ReportService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	handler := reports.NewHandler(service)

	group := r.Group("/api/v1/reports")
	{
		group.GET("/dashboard", handler.GetDashboardMetrics)

		// Sales Reports
		salesGroup := group.Group("/sales")
		{
			salesGroup.GET("/summary", handler.GetSalesSummary)
			salesGroup.GET("/details", handler.GetSalesDetails)
			salesGroup.GET("/products", handler.GetProductSales)
			salesGroup.GET("/payments", handler.GetPaymentSummary)
		}

		// Inventory Reports
		inventoryGroup := group.Group("/inventory")
		{
			inventoryGroup.GET("/current-stock", handler.GetCurrentStock)
			inventoryGroup.GET("/low-stock", handler.GetLowStockAlerts)
			inventoryGroup.GET("/movements", handler.GetStockMovements)
			inventoryGroup.GET("/opnames", handler.GetStockOpnames)
			inventoryGroup.GET("/adjustments", handler.GetStockAdjustments)
			inventoryGroup.GET("/transfers", handler.GetStockTransfers)
			inventoryGroup.GET("/wastes", handler.GetWasteReport)
		}

		// Purchasing Reports
		purchasingGroup := group.Group("/purchasing")
		{
			purchasingGroup.GET("/orders", handler.GetPurchaseOrders)
			purchasingGroup.GET("/receipts", handler.GetGoodReceipts)
		}

		// Production Reports
		productionGroup := group.Group("/production")
		{
			productionGroup.GET("/summary", handler.GetProductionSummary)
		}

		// Reservation Reports
		reservationGroup := group.Group("/reservations")
		{
			reservationGroup.GET("/summary", handler.GetReservationSummary)
		}
	}

	return r
}

func TestReports_DashboardAndSales(t *testing.T) {
	mockService := &MockReportService{
		DashboardMetricsData: map[string]interface{}{
			"total_sales":        1500000.0,
			"total_orders":       45,
			"low_stock_count":    3,
			"pending_reservations": 2,
		},
		SalesSummaryData: map[string]interface{}{
			"total_revenue": 5000000.0,
			"total_orders":  120,
		},
		SalesDetailsData: []model.SalesOrders{
			{
				IDSalesOrder: 1,
				OrderNumber:  "SO-20261030-001",
				TotalAmount:  decimal.NewFromFloat(75000),
				StatusOrders: "completed",
			},
		},
		ProductSalesData: []map[string]interface{}{
			{
				"product_name": "Kopi Susu Aren",
				"total_qty":    50,
				"total_sales":  900000.0,
			},
		},
		PaymentSummaryData: []map[string]interface{}{
			{
				"payment_method": "qris",
				"total_amount":   2500000.0,
				"total_count":    60,
			},
		},
	}

	router := setupTestRouter(mockService)

	t.Run("GetDashboardMetrics Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/reports/dashboard?outlet_id=1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}

		var resp map[string]interface{}
		_ = json.Unmarshal(rec.Body.Bytes(), &resp)
		if resp["status"] != "success" {
			t.Errorf("Expected status success, got %v", resp["status"])
		}
	})

	t.Run("GetSalesSummary Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/reports/sales/summary?outlet_id=1&start_date=2026-10-01&end_date=2026-10-30&order_type=dine_in", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetSalesDetails Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/reports/sales/details?outlet_id=1&status=completed", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetProductSales Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/reports/sales/products?outlet_id=1&category_id=1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetPaymentSummary Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/reports/sales/payments?outlet_id=1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetDashboardMetrics Error", func(t *testing.T) {
		errService := &MockReportService{
			Err: errors.New("database connection failed"),
		}
		errRouter := setupTestRouter(errService)

		req, _ := http.NewRequest(http.MethodGet, "/api/v1/reports/dashboard", nil)
		rec := httptest.NewRecorder()
		errRouter.ServeHTTP(rec, req)

		if rec.Code != http.StatusInternalServerError {
			t.Errorf("Expected HTTP 500, got %d", rec.Code)
		}
	})
}

func TestReports_Inventory(t *testing.T) {
	mockService := &MockReportService{
		CurrentStockData: []map[string]interface{}{
			{
				"ingredient_name": "Susu UHT",
				"available_qty":   24.0,
				"unit_name":       "Liter",
			},
		},
		LowStockAlertsData: []map[string]interface{}{
			{
				"ingredient_name": "Sirup Vanila",
				"available_qty":   1.0,
				"min_stock":       5.0,
			},
		},
		StockMovementsData: []model.StokMovements{
			{
				IDStokMovement: 1,
				MovementType:   "in",
				Qty:            decimal.NewFromFloat(50),
				MovementDate:   time.Now(),
			},
		},
		StockOpnamesData: []model.StokOpnames{
			{
				IDStokOpname: 1,
				OpnameCode:   "OPN-20261030-001",
				StatusOpname: "completed",
			},
		},
		StockAdjustmentsData: []model.StokAdjustments{
			{
				IDStokAdjustment: 1,
				Reason:           "Spillage",
				Qty:              decimal.NewFromFloat(2),
			},
		},
		StockTransfersData: []model.StokTransfers{
			{
				IDStokTransfer: 1,
				TransferCode:   "TRF-20261030-001",
				StatusTransfer: "completed",
			},
		},
		WasteReportData: []model.Wastes{
			{
				IDWaste: 1,
				Reason:  "Expired",
				Qty:     decimal.NewFromFloat(1.5),
			},
		},
	}

	router := setupTestRouter(mockService)

	t.Run("GetCurrentStock Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/reports/inventory/current-stock?warehouse_id=1&category_id=1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetLowStockAlerts Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/reports/inventory/low-stock?warehouse_id=1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetStockMovements Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/reports/inventory/movements?warehouse_id=1&movement_type=in", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetStockOpnames Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/reports/inventory/opnames?warehouse_id=1&status=completed", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetStockAdjustments Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/reports/inventory/adjustments?warehouse_id=1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetStockTransfers Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/reports/inventory/transfers?warehouse_from_id=1&warehouse_to_id=2", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetWasteReport Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/reports/inventory/wastes?outlet_id=1&warehouse_id=1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})
}

func TestReports_PurchasingProductionReservation(t *testing.T) {
	mockService := &MockReportService{
		PurchaseOrdersData: []model.PurchaseOrders{
			{
				IDPurchase:     1,
				PONumber:       "PO-20261030-001",
				StatusPurchase: "approved",
			},
		},
		GoodReceiptsData: []model.GoodReceipts{
			{
				IDGoodReceipt: 1,
				ReceiptNumber: "GR-20261030-001",
				StatusReceipt: "completed",
			},
		},
		ProductionSummaryData: []model.Productions{
			{
				IDProduction:     1,
				StatusProduction: "completed",
				Qty:              decimal.NewFromFloat(20),
			},
		},
		ReservationSummaryData: []model.Reservations{
			{
				IDReservation:     1,
				ReservationCode:   "RSV-20261030-001",
				StatusReservation: "confirmed",
			},
		},
	}

	router := setupTestRouter(mockService)

	t.Run("GetPurchaseOrders Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/reports/purchasing/orders?supplier_id=1&status=approved", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetGoodReceipts Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/reports/purchasing/receipts?warehouse_id=1&status=completed", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetProductionSummary Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/reports/production/summary?outlet_id=1&status=completed", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetReservationSummary Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/reports/reservations/summary?outlet_id=1&status=confirmed", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})
}
