package master_test

import (
	"backend/internal/modules/master/suppliers"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestSuppliers_Service_CRUD(t *testing.T) {
	mockRepo := NewMockSupplierRepository()
	service := suppliers.NewServiceSupplier(mockRepo)

	// 1. Create
	sup, err := service.Create("12.345.678.9-012", "PT Sumber Pangan", "sumber@example.com", "Jl. Industri No 5", "Surabaya", "Budi Santoso", "BCA 1234567890", "Supplier sayuran segar", "active")
	if err != nil {
		t.Fatalf("Ekspektasi Create supplier sukses, error: %v", err)
	}
	if sup.IDSupplier == 0 {
		t.Errorf("Ekspektasi IDSupplier terisi")
	}
	if sup.SupplierCode == "" {
		t.Errorf("Ekspektasi SupplierCode terisi otomatis")
	}

	// 2. GetById
	found, err := service.GetById(sup.IDSupplier)
	if err != nil {
		t.Fatalf("Ekspektasi GetById sukses, error: %v", err)
	}
	if found.SupplierName != "PT Sumber Pangan" {
		t.Errorf("Ekspektasi SupplierName 'PT Sumber Pangan', didapat '%s'", found.SupplierName)
	}

	// 3. GetAll
	all, err := service.GetAll()
	if err != nil {
		t.Fatalf("Ekspektasi GetAll sukses, error: %v", err)
	}
	if len(all) != 1 {
		t.Errorf("Ekspektasi 1 supplier, didapat %d", len(all))
	}

	// 4. Update
	updated, err := service.Update(sup.IDSupplier, "12.345.678.9-012", "PT Sumber Pangan Makmur", "makmur@example.com", "Jl. Industri No 5", "Surabaya", "Budi Santoso", "BCA 1234567890", "Supplier sayuran dan buah segar", "active")
	if err != nil {
		t.Fatalf("Ekspektasi Update sukses, error: %v", err)
	}
	if updated.SupplierName != "PT Sumber Pangan Makmur" {
		t.Errorf("Ekspektasi nama supplier terupdate, didapat '%s'", updated.SupplierName)
	}

	// 5. Delete
	err = service.Delete(sup.IDSupplier)
	if err != nil {
		t.Fatalf("Ekspektasi Delete sukses, error: %v", err)
	}
}

func TestSuppliers_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockRepo := NewMockSupplierRepository()
	service := suppliers.NewServiceSupplier(mockRepo)
	handler := suppliers.NewHandlerSupplier(service)

	r := gin.New()
	r.GET("/api/v1/suppliers", handler.GetAll)
	r.GET("/api/v1/suppliers/:id_supplier", handler.GetById)
	r.POST("/api/v1/suppliers", handler.Create)
	r.PUT("/api/v1/suppliers/:id_supplier", handler.Update)
	r.DELETE("/api/v1/suppliers/:id_supplier", handler.Delete)

	// Uji POST Create Valid -> HTTP 201
	payload := map[string]interface{}{
		"npwp":            "98.765.432.1-098",
		"supplier_name":   "CV Daging Jaya",
		"email":           "daging@example.com",
		"address":         "Kawasan Niaga No 22",
		"city":            "Bandung",
		"contact_person":  "Asep Suherman",
		"bank_account":    "Mandiri 987654321",
		"notes":           "Supplier daging ayam & sapi potong",
		"status_supplier": "active",
	}
	bodyBytes, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodPost, "/api/v1/suppliers", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("Ekspektasi HTTP 201 Created, didapat %d. Body: %s", w.Code, w.Body.String())
	}

	// Uji GET All -> HTTP 200
	reqGetAll, _ := http.NewRequest(http.MethodGet, "/api/v1/suppliers", nil)
	wGetAll := httptest.NewRecorder()
	r.ServeHTTP(wGetAll, reqGetAll)
	if wGetAll.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk GetAll, didapat %d", wGetAll.Code)
	}

	// Uji GET By ID -> HTTP 200
	reqGetID, _ := http.NewRequest(http.MethodGet, "/api/v1/suppliers/1", nil)
	wGetID := httptest.NewRecorder()
	r.ServeHTTP(wGetID, reqGetID)
	if wGetID.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk GetById, didapat %d", wGetID.Code)
	}

	// Uji PUT Update -> HTTP 200
	updatePayload := map[string]interface{}{
		"npwp":            "98.765.432.1-098",
		"supplier_name":   "CV Daging Jaya Prima",
		"email":           "daging@example.com",
		"address":         "Kawasan Niaga No 22",
		"city":            "Bandung",
		"contact_person":  "Asep Suherman",
		"bank_account":    "Mandiri 987654321",
		"notes":           "Supplier daging potong higienis",
		"status_supplier": "active",
	}
	upBytes, _ := json.Marshal(updatePayload)
	reqUpdate, _ := http.NewRequest(http.MethodPut, "/api/v1/suppliers/1", bytes.NewBuffer(upBytes))
	reqUpdate.Header.Set("Content-Type", "application/json")
	wUpdate := httptest.NewRecorder()
	r.ServeHTTP(wUpdate, reqUpdate)
	if wUpdate.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk Update, didapat %d. Body: %s", wUpdate.Code, wUpdate.Body.String())
	}

	// Uji DELETE -> HTTP 202 (StatusAccepted)
	reqDel, _ := http.NewRequest(http.MethodDelete, "/api/v1/suppliers/1", nil)
	wDel := httptest.NewRecorder()
	r.ServeHTTP(wDel, reqDel)
	if wDel.Code != http.StatusAccepted {
		t.Fatalf("Ekspektasi HTTP 202 StatusAccepted untuk Delete, didapat %d", wDel.Code)
	}
}
