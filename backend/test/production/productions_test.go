package production_test

import (
	productions "backend/internal/modules/production/productions"
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

func TestProductions_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &MockProductionService{
		Productions: []model.Productions{
			{
				IDProduction:     1,
				OutletRef:        1,
				WarehouseRef:     1,
				UnitRef:          1,
				CreatedBy:        1,
				ProductRef:       1,
				Qty:              decimal.NewFromFloat(20.0),
				StatusProduction: "draft",
				ProductionDate:   time.Now(),
				Notes:            "Produksi batch pagi",
			},
		},
	}
	handler := productions.NewHandler(mockService)

	router := gin.New()
	router.GET("/productions", handler.GetAll)
	router.GET("/productions/:id_production", handler.GetByID)
	router.GET("/productions/:id_production/check-stock", handler.CheckStockRequirement)
	router.POST("/productions", handler.Create)
	router.PUT("/productions/:id_production/status", handler.UpdateStatus)

	t.Run("GetAll Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/productions?product_id=1&warehouse_id=1&outlet_id=1&status=draft", nil)
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
		req, _ := http.NewRequest(http.MethodGet, "/productions/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetByID Not Found", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/productions/999", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("Expected HTTP 404, got %d", rec.Code)
		}
	})

	t.Run("CheckStockRequirement Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/productions/1/check-stock", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}

		var resp map[string]interface{}
		_ = json.Unmarshal(rec.Body.Bytes(), &resp)
		datas, ok := resp["datas"].(map[string]interface{})
		if !ok || datas["can_produce"] != true {
			t.Errorf("Expected can_produce true in response datas, got %v", resp["datas"])
		}
	})

	t.Run("Create Success", func(t *testing.T) {
		body := map[string]interface{}{
			"outlet_id":    1,
			"warehouse_id": 1,
			"unit_id":      1,
			"created_by":   1,
			"product_id":   1,
			"qty":          25.0,
			"notes":        "Batch khusus event",
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/productions", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusCreated {
			t.Fatalf("Expected HTTP 201 Created, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("Create Fail - Missing ProductID", func(t *testing.T) {
		body := map[string]interface{}{
			"outlet_id":    1,
			"warehouse_id": 1,
			"unit_id":      1,
			"created_by":   1,
			"qty":          25.0,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/productions", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnprocessableEntity {
			t.Errorf("Expected HTTP 422, got %d", rec.Code)
		}
	})

	t.Run("UpdateStatus Success - In Progress", func(t *testing.T) {
		body := map[string]interface{}{
			"status":  "in_progress",
			"user_id": 1,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPut, "/productions/1/status", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200 OK, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("UpdateStatus Success - Completed", func(t *testing.T) {
		body := map[string]interface{}{
			"status":  "completed",
			"user_id": 1,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPut, "/productions/1/status", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200 OK, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("UpdateStatus Fail - Invalid Status", func(t *testing.T) {
		body := map[string]interface{}{
			"status":  "draft",
			"user_id": 1,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPut, "/productions/1/status", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnprocessableEntity {
			t.Errorf("Expected HTTP 422, got %d", rec.Code)
		}
	})
}
