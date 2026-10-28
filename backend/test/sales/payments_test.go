package sales_test

import (
	payments "backend/internal/modules/sales/payments"
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

func TestPayments_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &MockPaymentService{
		Payments: []model.Payments{
			{
				IDPayment:       1,
				OrderRef:        1,
				PaymentCode:     "PAY-20261028-001",
				PaymentMethod:   "qris",
				PaidAmount:      decimal.NewFromFloat(50000),
				CashReceived:    decimal.NewFromFloat(50000),
				PaymentProvider: "midtrans",
				PaymentStatus:   "paid",
				CreatedAt:       time.Now(),
			},
		},
	}
	handler := payments.NewHandler(mockService)

	router := gin.New()
	router.GET("/payments", handler.GetAll)
	router.GET("/payments/:id_payment", handler.GetByID)
	router.POST("/payments", handler.Create)

	t.Run("GetAll Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/payments?sales_order_id=1&status=paid&method=qris", nil)
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
		req, _ := http.NewRequest(http.MethodGet, "/payments/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d", rec.Code)
		}
	})

	t.Run("GetByID Not Found", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/payments/999", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("Expected HTTP 404, got %d", rec.Code)
		}
	})

	t.Run("Create Success - Cash", func(t *testing.T) {
		body := map[string]interface{}{
			"sales_order_id": 1,
			"payment_method": "cash",
			"paid_amount":    50000,
			"cash_received":  100000,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/payments", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusCreated {
			t.Fatalf("Expected HTTP 201 Created, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("Create Fail - Invalid Payment Method", func(t *testing.T) {
		body := map[string]interface{}{
			"sales_order_id": 1,
			"payment_method": "bitcoin",
			"paid_amount":    50000,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/payments", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnprocessableEntity {
			t.Errorf("Expected HTTP 422, got %d", rec.Code)
		}
	})
}
