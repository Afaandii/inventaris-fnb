package reservations_test

import (
	diningtables "backend/internal/modules/reservations/dining_tables"
	"backend/internal/shared/model"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestDiningTables_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &MockDiningTableService{
		Tables: []model.DiningTables{
			{
				IDDiningTable: 1,
				OutletRef:     1,
				Name:          "Table 01",
				Capacity:      4,
				StatusTable:   "available",
			},
		},
	}
	handler := diningtables.NewHandler(mockService)

	router := gin.New()
	router.GET("/dining-tables", handler.GetAll)
	router.GET("/dining-tables/:id_dining_table", handler.GetByID)
	router.POST("/dining-tables", handler.Create)
	router.PUT("/dining-tables/:id_dining_table", handler.Update)
	router.DELETE("/dining-tables/:id_dining_table", handler.Delete)

	t.Run("GetAll Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/dining-tables?outlet_id=1&status=available", nil)
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
		req, _ := http.NewRequest(http.MethodGet, "/dining-tables/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d", rec.Code)
		}
	})

	t.Run("GetByID Not Found", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/dining-tables/999", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("Expected HTTP 404, got %d", rec.Code)
		}
	})

	t.Run("Create Success", func(t *testing.T) {
		body := map[string]interface{}{
			"outlet_id":    1,
			"name":         "Table VIP 1",
			"capacity":     8,
			"status_table": "available",
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/dining-tables", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusCreated {
			t.Fatalf("Expected HTTP 201 Created, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("Create Fail - Missing Capacity", func(t *testing.T) {
		body := map[string]interface{}{
			"outlet_id": 1,
			"name":      "Table VIP 1",
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/dining-tables", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnprocessableEntity {
			t.Errorf("Expected HTTP 422, got %d", rec.Code)
		}
	})

	t.Run("Update Success", func(t *testing.T) {
		body := map[string]interface{}{
			"outlet_id":    1,
			"name":         "Table VIP 1 Revised",
			"capacity":     10,
			"status_table": "reserved",
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPut, "/dining-tables/1", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200 OK, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("Delete Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodDelete, "/dining-tables/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200 OK, got %d: %s", rec.Code, rec.Body.String())
		}
	})
}
