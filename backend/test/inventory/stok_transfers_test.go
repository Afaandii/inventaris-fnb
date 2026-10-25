package inventory_test

import (
	stoktransfers "backend/internal/modules/inventory/stok_transfers"
	"backend/internal/shared/model"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func TestStokTransfers_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &MockStokTransferService{
		Transfers: []model.StokTransfers{
			{
				IDStokTransfer: 1,
				WarehouseFrom:  1,
				WarehouseTo:    2,
				CreatedBy:      1,
				TransferCode:   "TRF-20261025-001",
				TransferDate:   time.Now(),
				StatusTransfer: "draft",
			},
		},
	}
	handler := stoktransfers.NewHandler(mockService)

	router := gin.New()
	router.GET("/inventory/stok-transfers", handler.GetAll)
	router.GET("/inventory/stok-transfers/:id_stok_transfer", handler.GetByID)
	router.POST("/inventory/stok-transfers", handler.Create)
	router.PUT("/inventory/stok-transfers/:id_stok_transfer/status", handler.UpdateStatus)

	t.Run("GetAll Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/inventory/stok-transfers?warehouse_from=1&status=draft", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetByID Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/inventory/stok-transfers/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d", rec.Code)
		}
	})

	t.Run("Create Success", func(t *testing.T) {
		body := map[string]interface{}{
			"warehouse_from": 1,
			"warehouse_to":   2,
			"created_by":     1,
			"notes":          "Transfer stok bahan baku",
			"items": []map[string]interface{}{
				{
					"ingredient_id": 1,
					"unit_id":       1,
					"qty":           20.0,
					"remarks":       "Kebutuhan operasional cabang",
				},
			},
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/inventory/stok-transfers", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusCreated {
			t.Fatalf("Expected HTTP 201 Created, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("UpdateStatus Success - Completed", func(t *testing.T) {
		body := map[string]interface{}{
			"status":      "completed",
			"approved_by": 2,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPut, "/inventory/stok-transfers/1/status", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200 OK, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("UpdateStatus Fail - Invalid Status", func(t *testing.T) {
		body := map[string]interface{}{
			"status":      "pending",
			"approved_by": 2,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPut, "/inventory/stok-transfers/1/status", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnprocessableEntity {
			t.Errorf("Expected HTTP 422, got %d", rec.Code)
		}
	})
}
