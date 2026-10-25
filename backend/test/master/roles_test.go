package master_test

import (
	"backend/internal/modules/master/roles"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestRoles_Service_CRUD(t *testing.T) {
	mockRepo := NewMockRoleRepository()
	service := roles.NewServiceRole(mockRepo)

	// 1. Create
	role, err := service.Create("cashier", "Kasir Utama", "Hak akses kasir POS")
	if err != nil {
		t.Fatalf("Ekspektasi Create sukses, error: %v", err)
	}
	if role.IDRoles == 0 {
		t.Errorf("Ekspektasi IDRoles terisi")
	}
	if role.RoleName != "cashier" {
		t.Errorf("Ekspektasi RoleName 'cashier', didapat '%s'", role.RoleName)
	}

	// 2. GetById
	found, err := service.GetById(role.IDRoles)
	if err != nil {
		t.Fatalf("Ekspektasi GetById sukses, error: %v", err)
	}
	if found.DisplayName != "Kasir Utama" {
		t.Errorf("Ekspektasi DisplayName 'Kasir Utama', didapat '%s'", found.DisplayName)
	}

	// 3. GetAll
	all, err := service.GetAll()
	if err != nil {
		t.Fatalf("Ekspektasi GetAll sukses, error: %v", err)
	}
	if len(all) != 1 {
		t.Errorf("Ekspektasi 1 role, didapat %d", len(all))
	}

	// 4. Update
	updated, err := service.Update(role.IDRoles, "senior_cashier", "Kasir Senior", "Hak akses kasir senior")
	if err != nil {
		t.Fatalf("Ekspektasi Update sukses, error: %v", err)
	}
	if updated.RoleName != "senior_cashier" {
		t.Errorf("Ekspektasi RoleName 'senior_cashier', didapat '%s'", updated.RoleName)
	}

	// 5. Delete
	err = service.Delete(role.IDRoles)
	if err != nil {
		t.Fatalf("Ekspektasi Delete sukses, error: %v", err)
	}
}

func TestRoles_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockRepo := NewMockRoleRepository()
	service := roles.NewServiceRole(mockRepo)
	handler := roles.NewHandlerRole(service)

	r := gin.New()
	r.GET("/api/v1/roles", handler.GetAll)
	r.GET("/api/v1/roles/:id_role", handler.GetById)
	r.POST("/api/v1/roles", handler.Create)
	r.PUT("/api/v1/roles/:id_role", handler.Update)
	r.DELETE("/api/v1/roles/:id_role", handler.Delete)

	// Uji POST Create Valid -> HTTP 201
	payload := map[string]interface{}{
		"role_name":    "manager",
		"display_name": "Manajer Resto",
		"description":  "Pengawas seluruh operasional restoran",
	}
	bodyBytes, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodPost, "/api/v1/roles", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("Ekspektasi HTTP 201 Created, didapat %d. Body: %s", w.Code, w.Body.String())
	}

	// Uji POST Create Invalid Validator -> HTTP 422
	invalidPayload := map[string]interface{}{
		"role_name": "m", // Kurang dari min=3
	}
	invalidBytes, _ := json.Marshal(invalidPayload)
	reqInvalid, _ := http.NewRequest(http.MethodPost, "/api/v1/roles", bytes.NewBuffer(invalidBytes))
	reqInvalid.Header.Set("Content-Type", "application/json")
	wInvalid := httptest.NewRecorder()
	r.ServeHTTP(wInvalid, reqInvalid)

	if wInvalid.Code != http.StatusUnprocessableEntity {
		t.Fatalf("Ekspektasi HTTP 422 Unprocessable Entity, didapat %d", wInvalid.Code)
	}

	// Uji GET All -> HTTP 200
	reqGetAll, _ := http.NewRequest(http.MethodGet, "/api/v1/roles", nil)
	wGetAll := httptest.NewRecorder()
	r.ServeHTTP(wGetAll, reqGetAll)
	if wGetAll.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk GetAll, didapat %d", wGetAll.Code)
	}

	// Uji GET By ID -> HTTP 200
	reqGetID, _ := http.NewRequest(http.MethodGet, "/api/v1/roles/1", nil)
	wGetID := httptest.NewRecorder()
	r.ServeHTTP(wGetID, reqGetID)
	if wGetID.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk GetById, didapat %d", wGetID.Code)
	}

	// Uji PUT Update -> HTTP 200
	updatePayload := map[string]interface{}{
		"role_name":    "general_manager",
		"display_name": "General Manajer",
		"description":  "Pimpinan tertinggi operasional resto",
	}
	upBytes, _ := json.Marshal(updatePayload)
	reqUpdate, _ := http.NewRequest(http.MethodPut, "/api/v1/roles/1", bytes.NewBuffer(upBytes))
	reqUpdate.Header.Set("Content-Type", "application/json")
	wUpdate := httptest.NewRecorder()
	r.ServeHTTP(wUpdate, reqUpdate)
	if wUpdate.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk Update, didapat %d", wUpdate.Code)
	}

	// Uji DELETE -> HTTP 200
	reqDel, _ := http.NewRequest(http.MethodDelete, "/api/v1/roles/1", nil)
	wDel := httptest.NewRecorder()
	r.ServeHTTP(wDel, reqDel)
	if wDel.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk Delete, didapat %d", wDel.Code)
	}
}
