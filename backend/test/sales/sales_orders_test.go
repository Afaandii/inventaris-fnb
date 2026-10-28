package sales_test

import (
	salesorders "backend/internal/modules/sales/sales_orders"
	"backend/internal/shared/model"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

func TestSalesOrders_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &MockSalesOrderService{
		Orders: []model.SalesOrders{
			{
				IDSalesOrder:  1,
				OutletRef:     1,
				CashierRef:    1,
				OrderNumber:   "SO-20261028-001",
				OrderType:     "dine_in",
				StatusOrders:  "confirmed",
				PaymentStatus: "unpaid",
				TotalAmount:   decimal.NewFromFloat(50000),
				OrderDate:     time.Now(),
			},
		},
	}
	handler := salesorders.NewHandler(mockService)

	router := gin.New()
	router.GET("/sales-orders", handler.GetAll)
	router.GET("/sales-orders/:id_sales_order", handler.GetByID)
	router.POST("/sales-orders", handler.Create)
	router.PUT("/sales-orders/:id_sales_order/status", handler.UpdateStatus)
	router.POST("/sales-orders/:id_sales_order/cancel", handler.CancelOrder)

	t.Run("GetAll Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/sales-orders?outlet_id=1&status=confirmed&order_type=dine_in", nil)
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

	t.Run("GetByID Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/sales-orders/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d", rec.Code)
		}
	})

	t.Run("GetByID Not Found", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/sales-orders/999", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("Expected HTTP 404, got %d", rec.Code)
		}
	})

	t.Run("Create Success", func(t *testing.T) {
		body := map[string]interface{}{
			"outlet_id":     1,
			"table_id":      1,
			"cashier_id":    1,
			"order_type":    "dine_in",
			"customer_name": "Budi",
			"items": []map[string]interface{}{
				{
					"product_variant_id": 1,
					"quantity":           2,
					"discount_amount":    0,
					"notes":              "Less sugar",
				},
			},
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/sales-orders", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusCreated {
			t.Fatalf("Expected HTTP 201 Created, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("Create Fail - Empty Items", func(t *testing.T) {
		body := map[string]interface{}{
			"outlet_id":     1,
			"cashier_id":    1,
			"order_type":    "takeaway",
			"customer_name": "Budi",
			"items":         []map[string]interface{}{},
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/sales-orders", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnprocessableEntity {
			t.Errorf("Expected HTTP 422, got %d", rec.Code)
		}
	})

	t.Run("UpdateStatus Success", func(t *testing.T) {
		body := map[string]interface{}{
			"status":  "processing",
			"user_id": 1,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPut, "/sales-orders/1/status", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200 OK, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("UpdateStatus Fail - Invalid Status", func(t *testing.T) {
		body := map[string]interface{}{
			"status":  "delivered",
			"user_id": 1,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPut, "/sales-orders/1/status", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnprocessableEntity {
			t.Errorf("Expected HTTP 422, got %d", rec.Code)
		}
	})

	t.Run("CancelOrder Success", func(t *testing.T) {
		body := map[string]interface{}{
			"user_id": 1,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/sales-orders/1/cancel", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200 OK, got %d: %s", rec.Code, rec.Body.String())
		}
	})
}
