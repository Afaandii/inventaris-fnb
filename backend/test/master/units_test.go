package master_test

import (
	"backend/internal/modules/master/units"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestUnits_Service_CRUD(t *testing.T) {
	mockRepo := NewMockUnitRepository()
	service := units.NewUnitService(mockRepo)

	// 1. Create
	unt, err := service.Create("Kilogram", "weight", "kg", true)
	if err != nil {
		t.Fatalf("Ekspektasi Create unit sukses, error: %v", err)
	}
	if unt.IDUnit == 0 {
		t.Errorf("Ekspektasi IDUnit terisi")
	}
	if unt.UnitCode == "" {
		t.Errorf("Ekspektasi UnitCode terisi otomatis")
	}

	// 2. GetById
	found, err := service.GetById(unt.IDUnit)
	if err != nil {
		t.Fatalf("Ekspektasi GetById sukses, error: %v", err)
	}
	if found.UnitName != "Kilogram" {
		t.Errorf("Ekspektasi UnitName 'Kilogram', didapat '%s'", found.UnitName)
	}

	// 3. GetAll
	all, err := service.GetAll()
	if err != nil {
		t.Fatalf("Ekspektasi GetAll sukses, error: %v", err)
	}
	if len(all) != 1 {
		t.Errorf("Ekspektasi 1 unit, didapat %d", len(all))
	}

	// 4. Update
	updated, err := service.Update(unt.IDUnit, "Gram", "weight", "g", true)
	if err != nil {
		t.Fatalf("Ekspektasi Update sukses, error: %v", err)
	}
	if updated.UnitName != "Gram" {
		t.Errorf("Ekspektasi UnitName 'Gram', didapat '%s'", updated.UnitName)
	}

	// 5. Delete
	err = service.Delete(unt.IDUnit)
	if err != nil {
		t.Fatalf("Ekspektasi Delete sukses, error: %v", err)
	}
}

func TestUnits_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockRepo := NewMockUnitRepository()
	service := units.NewUnitService(mockRepo)
	handler := units.NewHandlerUnit(service)

	r := gin.New()
	r.GET("/api/v1/units", handler.GetAll)
	r.GET("/api/v1/units/:id_unit", handler.GetById)
	r.POST("/api/v1/units", handler.Create)
	r.PUT("/api/v1/units/:id_unit", handler.Update)
	r.DELETE("/api/v1/units/:id_unit", handler.Delete)

	// Uji POST Create Valid -> HTTP 201
	payload := map[string]interface{}{
		"unit_name":  "Liter",
		"type":       "volume",
		"short_name": "L",
		"is_active":  true,
	}
	bodyBytes, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodPost, "/api/v1/units", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("Ekspektasi HTTP 201 Created, didapat %d. Body: %s", w.Code, w.Body.String())
	}

	// Uji GET All -> HTTP 200
	reqGetAll, _ := http.NewRequest(http.MethodGet, "/api/v1/units", nil)
	wGetAll := httptest.NewRecorder()
	r.ServeHTTP(wGetAll, reqGetAll)
	if wGetAll.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk GetAll, didapat %d", wGetAll.Code)
	}

	// Uji GET By ID -> HTTP 200
	reqGetID, _ := http.NewRequest(http.MethodGet, "/api/v1/units/1", nil)
	wGetID := httptest.NewRecorder()
	r.ServeHTTP(wGetID, reqGetID)
	if wGetID.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk GetById, didapat %d", wGetID.Code)
	}

	// Uji PUT Update -> HTTP 200
	updatePayload := map[string]interface{}{
		"unit_name":  "Mililiter",
		"type":       "volume",
		"short_name": "ml",
		"is_active":  true,
	}
	upBytes, _ := json.Marshal(updatePayload)
	reqUpdate, _ := http.NewRequest(http.MethodPut, "/api/v1/units/1", bytes.NewBuffer(upBytes))
	reqUpdate.Header.Set("Content-Type", "application/json")
	wUpdate := httptest.NewRecorder()
	r.ServeHTTP(wUpdate, reqUpdate)
	if wUpdate.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk Update, didapat %d. Body: %s", wUpdate.Code, wUpdate.Body.String())
	}

	// Uji DELETE -> HTTP 200
	reqDel, _ := http.NewRequest(http.MethodDelete, "/api/v1/units/1", nil)
	wDel := httptest.NewRecorder()
	r.ServeHTTP(wDel, reqDel)
	if wDel.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk Delete, didapat %d", wDel.Code)
	}
}
