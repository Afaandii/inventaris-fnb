package product_test

import (
	products "backend/internal/modules/product/products"
	"backend/internal/shared/model"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestProducts_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &MockProductService{
		Products: []model.Products{
			{
				IDProduct:   1,
				CategoryRef: 1,
				ProdCode:    "PRD-20261025-001",
				ProdName:    "Kopi Susu Gula Aren",
				ProdType:    "prepared",
				IsActive:    true,
				IsAvailable: true,
			},
		},
	}
	handler := products.NewHandler(mockService)

	router := gin.New()
	router.GET("/products", handler.GetAll)
	router.GET("/products/:id_product", handler.GetByID)
	router.POST("/products", handler.Create)
	router.PUT("/products/:id_product", handler.Update)
	router.DELETE("/products/:id_product", handler.Delete)

	t.Run("GetAll Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/products?category_id=1&prod_type=prepared&is_active=true", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetByID Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/products/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d", rec.Code)
		}
	})

	t.Run("GetByID Not Found", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/products/999", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("Expected HTTP 404, got %d", rec.Code)
		}
	})

	t.Run("Create Success", func(t *testing.T) {
		body := map[string]interface{}{
			"category_id": 1,
			"prod_name":   "Espresso Single",
			"sku":         "ESP-001",
			"prod_type":   "prepared",
			"description": "Kopi murni single shot",
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/products", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusCreated {
			t.Fatalf("Expected HTTP 201 Created, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("Create Fail - Invalid ProdType", func(t *testing.T) {
		body := map[string]interface{}{
			"category_id": 1,
			"prod_name":   "Espresso Single",
			"prod_type":   "invalid_type",
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/products", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnprocessableEntity {
			t.Errorf("Expected HTTP 422, got %d", rec.Code)
		}
	})

	t.Run("Update Success", func(t *testing.T) {
		body := map[string]interface{}{
			"category_id": 1,
			"prod_name":   "Kopi Susu Aren Spesial",
			"prod_type":   "prepared",
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPut, "/products/1", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200 OK, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("Delete Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodDelete, "/products/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200 OK, got %d: %s", rec.Code, rec.Body.String())
		}
	})
}
