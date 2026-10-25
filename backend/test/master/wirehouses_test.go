package master_test

import (
	"backend/internal/modules/master/wirehouses"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestWirehouses_Service_CRUD(t *testing.T) {
	mockRepo := NewMockWirehouseRepository()
	service := wirehouses.NewWirehouseService(mockRepo)

	// 1. Create
	wire, err := service.Create(1, 2, "Gudang Utama Barat", "Jl. Daan Mogot No 15", "Jakarta", "081234567890", "main", "active")
	if err != nil {
		t.Fatalf("Ekspektasi Create wirehouse sukses, error: %v", err)
	}
	if wire.IDWirehouse == 0 {
		t.Errorf("Ekspektasi IDWirehouse terisi")
	}
	if wire.WirehouseCode == "" {
		t.Errorf("Ekspektasi WirehouseCode terisi otomatis")
	}

	// 2. GetById
	found, err := service.GetById(wire.IDWirehouse)
	if err != nil {
		t.Fatalf("Ekspektasi GetById sukses, error: %v", err)
	}
	if found.WirehouseName != "Gudang Utama Barat" {
		t.Errorf("Ekspektasi WirehouseName 'Gudang Utama Barat', didapat '%s'", found.WirehouseName)
	}

	// 3. GetAll
	all, err := service.GetAll()
	if err != nil {
		t.Fatalf("Ekspektasi GetAll sukses, error: %v", err)
	}
	if len(all) != 1 {
		t.Errorf("Ekspektasi 1 wirehouse, didapat %d", len(all))
	}

	// 4. Update
	updated, err := service.Update(wire.IDWirehouse, 1, 2, "Gudang Kitchen Barat", "Jl. Daan Mogot No 15", "Jakarta", "081234567890", "kitchen", "active")
	if err != nil {
		t.Fatalf("Ekspektasi Update sukses, error: %v", err)
	}
	if updated.Type != "kitchen" {
		t.Errorf("Ekspektasi tipe 'kitchen', didapat '%s'", updated.Type)
	}

	// 5. Delete
	err = service.Delete(wire.IDWirehouse)
	if err != nil {
		t.Fatalf("Ekspektasi Delete sukses, error: %v", err)
	}
}

func TestWirehouses_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockRepo := NewMockWirehouseRepository()
	service := wirehouses.NewWirehouseService(mockRepo)
	handler := wirehouses.NewHandlerWirehouse(service)

	r := gin.New()
	r.GET("/api/v1/wirehouses", handler.GetAll)
	r.GET("/api/v1/wirehouses/:id_wirehouse", handler.GetById)
	r.POST("/api/v1/wirehouses", handler.Create)
	r.PUT("/api/v1/wirehouses/:id_wirehouse", handler.Update)
	r.DELETE("/api/v1/wirehouses/:id_wirehouse", handler.Delete)

	// Uji POST Create Valid -> HTTP 201
	payload := map[string]interface{}{
		"outlet_id":      1,
		"manager_id":     2,
		"wirehouse_name": "Gudang Dingin",
		"address":        "Jl. Pelabuhan No 4",
		"city":           "Semarang",
		"phone_number":   "081333444555",
		"type":           "storage",
		"status":         "active",
	}
	bodyBytes, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodPost, "/api/v1/wirehouses", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("Ekspektasi HTTP 201 Created, didapat %d. Body: %s", w.Code, w.Body.String())
	}

	// Uji GET All -> HTTP 200
	reqGetAll, _ := http.NewRequest(http.MethodGet, "/api/v1/wirehouses", nil)
	wGetAll := httptest.NewRecorder()
	r.ServeHTTP(wGetAll, reqGetAll)
	if wGetAll.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk GetAll, didapat %d", wGetAll.Code)
	}

	// Uji GET By ID -> HTTP 200
	reqGetID, _ := http.NewRequest(http.MethodGet, "/api/v1/wirehouses/1", nil)
	wGetID := httptest.NewRecorder()
	r.ServeHTTP(wGetID, reqGetID)
	if wGetID.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk GetById, didapat %d", wGetID.Code)
	}

	// Uji PUT Update -> HTTP 200
	updatePayload := map[string]interface{}{
		"outlet_id":      1,
		"manager_id":     2,
		"wirehouse_name": "Gudang Dingin Beku",
		"address":        "Jl. Pelabuhan No 4",
		"city":           "Semarang",
		"phone_number":   "081333444555",
		"type":           "storage",
		"status":         "active",
	}
	upBytes, _ := json.Marshal(updatePayload)
	reqUpdate, _ := http.NewRequest(http.MethodPut, "/api/v1/wirehouses/1", bytes.NewBuffer(upBytes))
	reqUpdate.Header.Set("Content-Type", "application/json")
	wUpdate := httptest.NewRecorder()
	r.ServeHTTP(wUpdate, reqUpdate)
	if wUpdate.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk Update, didapat %d. Body: %s", wUpdate.Code, wUpdate.Body.String())
	}

	// Uji DELETE -> HTTP 200
	reqDel, _ := http.NewRequest(http.MethodDelete, "/api/v1/wirehouses/1", nil)
	wDel := httptest.NewRecorder()
	r.ServeHTTP(wDel, reqDel)
	if wDel.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk Delete, didapat %d", wDel.Code)
	}
}
