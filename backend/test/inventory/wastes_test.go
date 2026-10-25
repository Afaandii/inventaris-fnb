package inventory_test

import (
	wastes "backend/internal/modules/inventory/wastes"
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

func TestWastes_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &MockWasteService{
		Wastes: []model.Wastes{
			{
				IDWaste:       1,
				WirehouseRef:  1,
				IngredientRef: 1,
				CreatedBy:     1,
				Qty:           decimal.NewFromFloat(5.5),
				Reason:        "Bahan rusak/kadaluwarsa",
				WasteDate:     time.Now(),
			},
		},
	}
	handler := wastes.NewHandler(mockService)

	router := gin.New()
	router.GET("/inventory/wastes", handler.GetAll)
	router.GET("/inventory/wastes/:id_waste", handler.GetByID)
	router.POST("/inventory/wastes", handler.Create)

	t.Run("GetAll Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/inventory/wastes?warehouse_id=1&ingredient_id=1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetByID Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/inventory/wastes/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d", rec.Code)
		}
	})

	t.Run("GetByID Not Found", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/inventory/wastes/999", nil)
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
			"qty":           3.5,
			"reason":        "Susu basi/pecah kemasan",
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/inventory/wastes", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusCreated {
			t.Fatalf("Expected HTTP 201 Created, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("Create Fail - Missing Reason", func(t *testing.T) {
		body := map[string]interface{}{
			"warehouse_id":  1,
			"ingredient_id": 1,
			"created_by":    1,
			"qty":           3.5,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/inventory/wastes", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnprocessableEntity {
			t.Errorf("Expected HTTP 422, got %d", rec.Code)
		}
	})
}
