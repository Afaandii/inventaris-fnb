package sales_test

import (
	salesorderitems "backend/internal/modules/sales/sales_order_items"
	"backend/internal/shared/model"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

func TestSalesOrderItems_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &MockSalesOrderItemService{
		Items: []model.SalesOrderItems{
			{
				IDSalesOrderItem: 1,
				OrderRef:         1,
				ProdVarRef:       1,
				Qty:              2,
				UnitPrice:        decimal.NewFromFloat(25000),
				TotalAmount:      decimal.NewFromFloat(50000),
				Notes:            "Dingin",
			},
		},
	}
	handler := salesorderitems.NewHandler(mockService)

	router := gin.New()
	router.GET("/sales-order-items", handler.GetAll)
	router.GET("/sales-order-items/:id_sales_order_item", handler.GetByID)

	t.Run("GetAll Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/sales-order-items?sales_order_id=1", nil)
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
		req, _ := http.NewRequest(http.MethodGet, "/sales-order-items/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d", rec.Code)
		}
	})

	t.Run("GetByID Not Found", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/sales-order-items/999", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("Expected HTTP 404, got %d", rec.Code)
		}
	})

	t.Run("GetByID Invalid ID", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/sales-order-items/invalid", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Errorf("Expected HTTP 400, got %d", rec.Code)
		}
	})
}
