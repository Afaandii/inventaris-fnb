package product_test

import (
	recipes "backend/internal/modules/product/recipes"
	"backend/internal/shared/model"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

func TestRecipes_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &MockRecipeService{
		Recipes: []model.Recipes{
			{
				IDRecipe:      1,
				ProductRef:    1,
				OutletRef:     1,
				YieldQty:      decimal.NewFromInt(1),
				YieldUnit:     "Portion",
				RecipeVersion: "v1.0",
				IsActive:      true,
			},
		},
	}
	handler := recipes.NewHandler(mockService)

	router := gin.New()
	router.GET("/recipes", handler.GetAll)
	router.GET("/recipes/:id_recipe", handler.GetByID)
	router.POST("/recipes", handler.Create)
	router.PUT("/recipes/:id_recipe", handler.Update)
	router.DELETE("/recipes/:id_recipe", handler.Delete)

	t.Run("GetAll Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/recipes?product_id=1&outlet_id=1&is_active=true", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetByID Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/recipes/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d", rec.Code)
		}
	})

	t.Run("Create Success", func(t *testing.T) {
		body := map[string]interface{}{
			"product_id":     1,
			"outlet_id":      1,
			"yield_qty":      1.0,
			"yield_unit":     "Cup",
			"instruction":    "Campurkan espresso dan susu aren",
			"recipe_version": "v1.0",
			"items": []map[string]interface{}{
				{
					"ingredient_id": 1,
					"unit_id":       1,
					"quantity":      30.0,
				},
			},
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/recipes", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusCreated {
			t.Fatalf("Expected HTTP 201 Created, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("Create Fail - Missing YieldUnit", func(t *testing.T) {
		body := map[string]interface{}{
			"product_id":     1,
			"outlet_id":      1,
			"yield_qty":      1.0,
			"recipe_version": "v1.0",
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/recipes", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnprocessableEntity {
			t.Errorf("Expected HTTP 422, got %d", rec.Code)
		}
	})

	t.Run("Update Success", func(t *testing.T) {
		body := map[string]interface{}{
			"product_id":     1,
			"outlet_id":      1,
			"yield_qty":      1.0,
			"yield_unit":     "Cup",
			"instruction":    "Resep revisi",
			"recipe_version": "v1.1",
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPut, "/recipes/1", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200 OK, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("Delete Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodDelete, "/recipes/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200 OK, got %d: %s", rec.Code, rec.Body.String())
		}
	})
}
