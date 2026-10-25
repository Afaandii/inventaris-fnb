package inventory_test

import (
	stokopnames "backend/internal/modules/inventory/stok_opnames"
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

func TestStokOpnames_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &MockStokOpnameService{
		Opnames: []model.StokOpnames{
			{
				IDStokOpname: 1,
				WirehouseRef: 1,
				CreatedBy:    1,
				OpnameCode:   "OPN-20261025-001",
				OpnameDate:   time.Now(),
				StatusOpname: "draft",
			},
		},
		Summary: []stokopnames.WarehouseStockSummary{
			{
				IngredientID: 1,
				IngreName:    "Gula Pasir",
				IngreCode:    "ING-001",
				UnitID:       1,
				UnitName:     "KG",
				SystemQty:    decimal.NewFromInt(100),
			},
		},
	}
	handler := stokopnames.NewHandler(mockService)

	router := gin.New()
	router.GET("/inventory/stok-opnames", handler.GetAll)
	router.GET("/inventory/stok-opnames/:id_stok_opname", handler.GetByID)
	router.GET("/inventory/stok-opnames/summary", handler.GetStockSummary)
	router.POST("/inventory/stok-opnames", handler.Create)
	router.PUT("/inventory/stok-opnames/:id_stok_opname/status", handler.UpdateStatus)

	t.Run("GetAll Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/inventory/stok-opnames?warehouse_id=1&status=draft", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetByID Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/inventory/stok-opnames/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d", rec.Code)
		}
	})

	t.Run("GetStockSummary Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/inventory/stok-opnames/summary?warehouse_id=1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d", rec.Code)
		}
	})

	t.Run("Create Success", func(t *testing.T) {
		body := map[string]interface{}{
			"warehouse_id": 1,
			"created_by":   1,
			"notes":        "Opname bulanan",
			"items": []map[string]interface{}{
				{
					"ingredient_id": 1,
					"unit_id":       1,
					"physical_qty":  95.5,
					"remarks":       "Kekurangan 4.5kg",
				},
			},
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/inventory/stok-opnames", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusCreated {
			t.Fatalf("Expected HTTP 201 Created, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("UpdateStatus Success - Approved", func(t *testing.T) {
		body := map[string]interface{}{
			"status":      "approved",
			"approved_by": 2,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPut, "/inventory/stok-opnames/1/status", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200 OK, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("UpdateStatus Fail - Invalid Status", func(t *testing.T) {
		body := map[string]interface{}{
			"status":      "rejected",
			"approved_by": 2,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPut, "/inventory/stok-opnames/1/status", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnprocessableEntity {
			t.Errorf("Expected HTTP 422, got %d", rec.Code)
		}
	})
}
