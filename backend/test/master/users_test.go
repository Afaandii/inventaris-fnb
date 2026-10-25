package master_test

import (
	"backend/internal/modules/master/users"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func TestUsers_Service_CRUD(t *testing.T) {
	mockRepo := NewMockUserRepository()
	service := users.NewServiceUser(mockRepo)

	now := time.Now()

	// 1. Create
	usr, err := service.Create(1, 1, "Chef Juna", "chefjuna", "juna@example.com", "Password123!", "081234567890", now, "https://example.com/avatar.jpg", "active", true)
	if err != nil {
		t.Fatalf("Ekspektasi Create user sukses, error: %v", err)
	}
	if usr.IDUser == 0 {
		t.Errorf("Ekspektasi IDUser terisi")
	}
	if usr.Password == "Password123!" {
		t.Errorf("Ekspektasi password sudah di-hash bcrypt, bukan plain text")
	}

	// 2. GetById
	found, err := service.GetById(usr.IDUser)
	if err != nil {
		t.Fatalf("Ekspektasi GetById sukses, error: %v", err)
	}
	if found.Name != "Chef Juna" {
		t.Errorf("Ekspektasi Name 'Chef Juna', didapat '%s'", found.Name)
	}

	// 3. GetAll
	all, err := service.GetAll()
	if err != nil {
		t.Fatalf("Ekspektasi GetAll sukses, error: %v", err)
	}
	if len(all) != 1 {
		t.Errorf("Ekspektasi 1 user, didapat %d", len(all))
	}

	// 4. Update
	updated, err := service.Update(usr.IDUser, 1, 1, "Chef Juna Pratama", "chefjuna", "juna@example.com", "NewPassword123!", "081234567890", now, "https://example.com/avatar.jpg", "active", true)
	if err != nil {
		t.Fatalf("Ekspektasi Update sukses, error: %v", err)
	}
	if updated.Name != "Chef Juna Pratama" {
		t.Errorf("Ekspektasi nama user terupdate, didapat '%s'", updated.Name)
	}

	// 5. Delete
	err = service.Delete(usr.IDUser)
	if err != nil {
		t.Fatalf("Ekspektasi Delete sukses, error: %v", err)
	}
}

func TestUsers_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockRepo := NewMockUserRepository()
	service := users.NewServiceUser(mockRepo)
	handler := users.NewHandlerUser(service)

	r := gin.New()
	r.GET("/api/v1/users", handler.GetAll)
	r.GET("/api/v1/users/:id_user", handler.GetById)
	r.POST("/api/v1/users", handler.Create)
	r.PUT("/api/v1/users/:id_user", handler.Update)
	r.DELETE("/api/v1/users/:id_user", handler.Delete)

	// Uji POST Create Valid -> HTTP 201
	payload := map[string]interface{}{
		"role_id":      1,
		"outlet_id":    1,
		"name":         "Budi Santoso",
		"username":     "budisantoso",
		"email":        "budi@example.com",
		"password":     "Rahasia123!",
		"phone_number": "081298765432",
		"last_login":   time.Now().Format(time.RFC3339),
		"avatar":       "https://example.com/budi.png",
		"status":       "active",
		"is_active":    true,
	}
	bodyBytes, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodPost, "/api/v1/users", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("Ekspektasi HTTP 201 Created, didapat %d. Body: %s", w.Code, w.Body.String())
	}

	// Uji GET All -> HTTP 200
	reqGetAll, _ := http.NewRequest(http.MethodGet, "/api/v1/users", nil)
	wGetAll := httptest.NewRecorder()
	r.ServeHTTP(wGetAll, reqGetAll)
	if wGetAll.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk GetAll, didapat %d", wGetAll.Code)
	}

	// Uji GET By ID -> HTTP 200
	reqGetID, _ := http.NewRequest(http.MethodGet, "/api/v1/users/1", nil)
	wGetID := httptest.NewRecorder()
	r.ServeHTTP(wGetID, reqGetID)
	if wGetID.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk GetById, didapat %d", wGetID.Code)
	}

	// Uji PUT Update -> HTTP 200
	updatePayload := map[string]interface{}{
		"role_id":      1,
		"outlet_id":    1,
		"name":         "Budi Santoso Super",
		"username":     "budisantoso",
		"email":        "budi@example.com",
		"password":     "RahasiaBaru123!",
		"phone_number": "081298765432",
		"last_login":   time.Now().Format(time.RFC3339),
		"avatar":       "https://example.com/budi.png",
		"status":       "active",
		"is_active":    true,
	}
	upBytes, _ := json.Marshal(updatePayload)
	reqUpdate, _ := http.NewRequest(http.MethodPut, "/api/v1/users/1", bytes.NewBuffer(upBytes))
	reqUpdate.Header.Set("Content-Type", "application/json")
	wUpdate := httptest.NewRecorder()
	r.ServeHTTP(wUpdate, reqUpdate)
	if wUpdate.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk Update, didapat %d. Body: %s", wUpdate.Code, wUpdate.Body.String())
	}

	// Uji DELETE -> HTTP 200
	reqDel, _ := http.NewRequest(http.MethodDelete, "/api/v1/users/1", nil)
	wDel := httptest.NewRecorder()
	r.ServeHTTP(wDel, reqDel)
	if wDel.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk Delete, didapat %d", wDel.Code)
	}
}
