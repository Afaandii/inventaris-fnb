package product_test

import (
	menuitems "backend/internal/modules/product/menu_items"
	"backend/internal/shared/model"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestMenuItems_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &MockMenuItemService{
		MenuItems: []model.MenuItems{
			{
				IDMenuItem:  1,
				ProductRef:  1,
				OutletRef:   1,
				SortOrder:   1,
				IsAvailable: true,
			},
		},
	}
	handler := menuitems.NewHandler(mockService)

	router := gin.New()
	router.GET("/menu-items", handler.GetAll)
	router.GET("/menu-items/:id_menu_item", handler.GetByID)
	router.GET("/menu-items/catalog/:outlet_id", handler.GetCatalogByOutlet)
	router.POST("/menu-items", handler.Create)
	router.PUT("/menu-items/:id_menu_item", handler.Update)
	router.DELETE("/menu-items/:id_menu_item", handler.Delete)

	t.Run("GetAll Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/menu-items?outlet_id=1&product_id=1&is_available=true", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetByID Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/menu-items/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d", rec.Code)
		}
	})

	t.Run("GetCatalogByOutlet Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/menu-items/catalog/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d", rec.Code)
		}
	})

	t.Run("Create Success", func(t *testing.T) {
		body := map[string]interface{}{
			"product_id": 1,
			"outlet_id":  1,
			"sort_order": 2,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/menu-items", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusCreated {
			t.Fatalf("Expected HTTP 201 Created, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("Create Fail - Missing OutletID", func(t *testing.T) {
		body := map[string]interface{}{
			"product_id": 1,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/menu-items", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnprocessableEntity {
			t.Errorf("Expected HTTP 422, got %d", rec.Code)
		}
	})

	t.Run("Update Success", func(t *testing.T) {
		body := map[string]interface{}{
			"product_id": 1,
			"outlet_id":  1,
			"sort_order": 5,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPut, "/menu-items/1", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200 OK, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("Delete Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodDelete, "/menu-items/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200 OK, got %d: %s", rec.Code, rec.Body.String())
		}
	})
}
