package inventory_test

import (
	stokadjustments "backend/internal/modules/inventory/stok_adjustments"
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

func TestStokAdjustments_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &MockStokAdjustmentService{
		Adjustments: []model.StokAdjustments{
			{
				IDStokAdjustment: 1,
				WirehouseRef:     1,
				IngredientRef:    1,
				CreatedBy:        1,
				Qty:              decimal.NewFromInt(10),
				Reason:           "Koreksi berkala",
				AdjustmentDate:   time.Now(),
			},
		},
	}
	handler := stokadjustments.NewHandler(mockService)

	router := gin.New()
	router.GET("/inventory/stok-adjustments", handler.GetAll)
	router.GET("/inventory/stok-adjustments/:id_stok_adjustment", handler.GetByID)
	router.POST("/inventory/stok-adjustments", handler.Create)

	t.Run("GetAll Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/inventory/stok-adjustments?warehouse_id=1&ingredient_id=1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetByID Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/inventory/stok-adjustments/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d", rec.Code)
		}
	})

	t.Run("GetByID Not Found", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/inventory/stok-adjustments/999", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("Expected HTTP 404, got %d", rec.Code)
		}
	})

	t.Run("Create Success", func(t *testing.T) {
		body := map[string]interface{}{
			"warehouse_id":  1,
			"ingredient_id": 1,
			"created_by":    1,
			"qty":           15,
			"reason":        "Perhitungan ulang fisik",
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/inventory/stok-adjustments", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusCreated {
			t.Fatalf("Expected HTTP 201 Created, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("Create Validation Fail - Missing Reason", func(t *testing.T) {
		body := map[string]interface{}{
			"warehouse_id":  1,
			"ingredient_id": 1,
			"created_by":    1,
			"qty":           15,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/inventory/stok-adjustments", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnprocessableEntity {
			t.Errorf("Expected HTTP 422, got %d", rec.Code)
		}
	})
}
