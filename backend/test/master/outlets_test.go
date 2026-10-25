package master_test

import (
	"backend/internal/modules/master/outlets"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
)

func TestOutlets_Service_CRUD(t *testing.T) {
	mockRepo := NewMockOutletRepository()
	service := outlets.NewServiceOutlet(mockRepo)

	openTime := datatypes.NewTime(8, 0, 0, 0)
	closeTime := datatypes.NewTime(22, 0, 0, 0)

	// 1. Create
	out, err := service.Create("Outlet Pusat", "Jl. Sudirman No 1", "Jakarta", openTime, closeTime, "081234567890", "active")
	if err != nil {
		t.Fatalf("Ekspektasi Create sukses, error: %v", err)
	}
	if out.IDOutlet == 0 {
		t.Errorf("Ekspektasi IDOutlet terisi")
	}
	if out.OutletCode == "" {
		t.Errorf("Ekspektasi OutletCode terisi otomatis")
	}

	// 2. GetById
	found, err := service.GetById(out.IDOutlet)
	if err != nil {
		t.Fatalf("Ekspektasi GetById sukses, error: %v", err)
	}
	if found.OutletName != "Outlet Pusat" {
		t.Errorf("Ekspektasi OutletName 'Outlet Pusat', didapat '%s'", found.OutletName)
	}

	// 3. GetAll
	all, err := service.GetAll()
	if err != nil {
		t.Fatalf("Ekspektasi GetAll sukses, error: %v", err)
	}
	if len(all) != 1 {
		t.Errorf("Ekspektasi 1 outlet, didapat %d", len(all))
	}

	// 4. Update
	updated, err := service.Update(out.IDOutlet, "Outlet Pusat Renovasi", "Jl. Sudirman No 1", "Jakarta", openTime, closeTime, "081234567890", "renovation")
	if err != nil {
		t.Fatalf("Ekspektasi Update sukses, error: %v", err)
	}
	if updated.StatusOutlet != "renovation" {
		t.Errorf("Ekspektasi StatusOutlet 'renovation', didapat '%s'", updated.StatusOutlet)
	}

	// 5. Delete
	err = service.Delete(out.IDOutlet)
	if err != nil {
		t.Fatalf("Ekspektasi Delete sukses, error: %v", err)
	}
}

func TestOutlets_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockRepo := NewMockOutletRepository()
	service := outlets.NewServiceOutlet(mockRepo)
	handler := outlets.NewHandlerOutlet(service)

	r := gin.New()
	r.GET("/api/v1/outlets", handler.GetAll)
	r.GET("/api/v1/outlets/:id_outlet", handler.GetById)
	r.POST("/api/v1/outlets", handler.Create)
	r.PUT("/api/v1/outlets/:id_outlet", handler.Update)
	r.DELETE("/api/v1/outlets/:id_outlet", handler.Delete)

	// Uji POST Create Valid -> HTTP 201
	payload := map[string]interface{}{
		"outlet_name":   "Outlet Cabang Barat",
		"address":       "Jl. Panjang No 10",
		"city":          "Jakarta Barat",
		"opening_hours": "09:00",
		"closing_hours": "21:00",
		"phone_number":  "081987654321",
		"status_outlet": "active",
	}
	bodyBytes, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodPost, "/api/v1/outlets", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("Ekspektasi HTTP 201 Created, didapat %d. Body: %s", w.Code, w.Body.String())
	}

	var createResp map[string]interface{}
	_ = json.Unmarshal(w.Body.Bytes(), &createResp)
	if createResp["status"] != "success" {
		t.Errorf("Ekspektasi status 'success', didapat: %v", createResp["status"])
	}

	// Uji GET All -> HTTP 200
	reqGetAll, _ := http.NewRequest(http.MethodGet, "/api/v1/outlets", nil)
	wGetAll := httptest.NewRecorder()
	r.ServeHTTP(wGetAll, reqGetAll)
	if wGetAll.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk GetAll, didapat %d", wGetAll.Code)
	}

	// Uji GET By ID -> HTTP 200
	reqGetID, _ := http.NewRequest(http.MethodGet, "/api/v1/outlets/1", nil)
	wGetID := httptest.NewRecorder()
	r.ServeHTTP(wGetID, reqGetID)
	if wGetID.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk GetById, didapat %d", wGetID.Code)
	}

	// Uji PUT Update -> HTTP 200
	updatePayload := map[string]interface{}{
		"outlet_name":   "Outlet Barat Baru",
		"address":       "Jl. Panjang No 12",
		"city":          "Jakarta Barat",
		"opening_hours": "10:00",
		"closing_hours": "22:00",
		"phone_number":  "081987654321",
		"status_outlet": "active",
	}
	upBytes, _ := json.Marshal(updatePayload)
	reqUpdate, _ := http.NewRequest(http.MethodPut, "/api/v1/outlets/1", bytes.NewBuffer(upBytes))
	reqUpdate.Header.Set("Content-Type", "application/json")
	wUpdate := httptest.NewRecorder()
	r.ServeHTTP(wUpdate, reqUpdate)
	if wUpdate.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk Update, didapat %d. Body: %s", wUpdate.Code, wUpdate.Body.String())
	}

	// Uji DELETE -> HTTP 200
	reqDel, _ := http.NewRequest(http.MethodDelete, "/api/v1/outlets/1", nil)
	wDel := httptest.NewRecorder()
	r.ServeHTTP(wDel, reqDel)
	if wDel.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk Delete, didapat %d", wDel.Code)
	}
}
