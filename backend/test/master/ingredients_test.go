package master_test

import (
	"backend/internal/modules/master/ingredients"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestIngredients_Service_CRUD(t *testing.T) {
	mockRepo := NewMockIngredientRepository()
	service := ingredients.NewServiceIngredient(mockRepo)

	// 1. Create
	ingre, err := service.Create(1, 1, 1, "Tepung Terigu", "SKU-TPG-01", "899123456789", 5.0, 50.0, 12000.0, 12000.0, false, 180, "active", true)
	if err != nil {
		t.Fatalf("Ekspektasi Create ingredient sukses, error: %v", err)
	}
	if ingre.IDIngredient == 0 {
		t.Errorf("Ekspektasi IDIngredient terisi")
	}
	if ingre.IngreCode == "" {
		t.Errorf("Ekspektasi IngreCode terisi otomatis")
	}

	// 2. GetById
	found, err := service.GetById(ingre.IDIngredient)
	if err != nil {
		t.Fatalf("Ekspektasi GetById sukses, error: %v", err)
	}
	if found.IngreName != "Tepung Terigu" {
		t.Errorf("Ekspektasi IngreName 'Tepung Terigu', didapat '%s'", found.IngreName)
	}

	// 3. GetAll
	all, err := service.GetAll()
	if err != nil {
		t.Fatalf("Ekspektasi GetAll sukses, error: %v", err)
	}
	if len(all) != 1 {
		t.Errorf("Ekspektasi 1 ingredient, didapat %d", len(all))
	}

	// 4. Update
	updated, err := service.Update(ingre.IDIngredient, 1, 1, 1, "Tepung Terigu Premium", "SKU-TPG-01", "899123456789", 10.0, 60.0, 14000.0, 14000.0, false, 180, "active", true)
	if err != nil {
		t.Fatalf("Ekspektasi Update sukses, error: %v", err)
	}
	if updated.IngreName != "Tepung Terigu Premium" {
		t.Errorf("Ekspektasi IngreName terupdate, didapat '%s'", updated.IngreName)
	}

	// 5. Delete
	err = service.Delete(ingre.IDIngredient)
	if err != nil {
		t.Fatalf("Ekspektasi Delete sukses, error: %v", err)
	}
}

func TestIngredients_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockRepo := NewMockIngredientRepository()
	service := ingredients.NewServiceIngredient(mockRepo)
	handler := ingredients.NewHandlerIngredient(service)

	r := gin.New()
	r.GET("/api/v1/ingredients", handler.GetAll)
	r.GET("/api/v1/ingredients/:id_ingredient", handler.GetById)
	r.POST("/api/v1/ingredients", handler.Create)
	r.PUT("/api/v1/ingredients/:id_ingredient", handler.Update)
	r.DELETE("/api/v1/ingredients/:id_ingredient", handler.Delete)

	// Uji POST Create Valid -> HTTP 201
	payload := map[string]interface{}{
		"category_id":       1,
		"unit_id":           1,
		"supplier_id":       1,
		"ingre_name":        "Gula Pasir",
		"sku":               "SKU-GLA-01",
		"Barcode":           "899988877711",
		"min_stok":          10.0,
		"max_stok":          100.0,
		"cost_price":        15000.0,
		"average_cost":      15000.0,
		"is_perishable":     false,
		"shelf_life_day":    365,
		"status_ingredient": "active",
		"is_active":         true,
	}
	bodyBytes, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodPost, "/api/v1/ingredients", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("Ekspektasi HTTP 201 Created, didapat %d. Body: %s", w.Code, w.Body.String())
	}

	// Uji GET All -> HTTP 200
	reqGetAll, _ := http.NewRequest(http.MethodGet, "/api/v1/ingredients", nil)
	wGetAll := httptest.NewRecorder()
	r.ServeHTTP(wGetAll, reqGetAll)
	if wGetAll.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk GetAll, didapat %d", wGetAll.Code)
	}

	// Uji GET By ID -> HTTP 200
	reqGetID, _ := http.NewRequest(http.MethodGet, "/api/v1/ingredients/1", nil)
	wGetID := httptest.NewRecorder()
	r.ServeHTTP(wGetID, reqGetID)
	if wGetID.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk GetById, didapat %d", wGetID.Code)
	}

	// Uji PUT Update -> HTTP 200
	updatePayload := map[string]interface{}{
		"category_id":       1,
		"unit_id":           1,
		"supplier_id":       1,
		"ingre_name":        "Gula Pasir Halus",
		"sku":               "SKU-GLA-01",
		"Barcode":           "899988877711",
		"min_stok":          10.0,
		"max_stok":          100.0,
		"cost_price":        16000.0,
		"average_cost":      16000.0,
		"is_perishable":     false,
		"shelf_life_day":    365,
		"status_ingredient": "active",
		"is_active":         true,
	}
	upBytes, _ := json.Marshal(updatePayload)
	reqUpdate, _ := http.NewRequest(http.MethodPut, "/api/v1/ingredients/1", bytes.NewBuffer(upBytes))
	reqUpdate.Header.Set("Content-Type", "application/json")
	wUpdate := httptest.NewRecorder()
	r.ServeHTTP(wUpdate, reqUpdate)
	if wUpdate.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk Update, didapat %d. Body: %s", wUpdate.Code, wUpdate.Body.String())
	}

	// Uji DELETE -> HTTP 200
	reqDel, _ := http.NewRequest(http.MethodDelete, "/api/v1/ingredients/1", nil)
	wDel := httptest.NewRecorder()
	r.ServeHTTP(wDel, reqDel)
	if wDel.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk Delete, didapat %d", wDel.Code)
	}
}
