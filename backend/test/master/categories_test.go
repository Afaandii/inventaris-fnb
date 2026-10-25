package master_test

import (
	"backend/internal/modules/master/categories"
	"backend/internal/shared/model"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestCategories_Service_CRUD(t *testing.T) {
	mockRepo := NewMockCategoryRepository()
	service := categories.NewServiceRole(mockRepo)

	// 1. Create
	cat, err := service.Create(0, "Minuman Segar", "product", "Kategori minuman segar", "active")
	if err != nil {
		t.Fatalf("Ekspektasi Create sukses, error: %v", err)
	}
	if cat.IDCategory == 0 {
		t.Errorf("Ekspektasi IDCategory terisi")
	}
	if cat.Slug != "minuman-segar" {
		t.Errorf("Ekspektasi slug 'minuman-segar', didapat '%s'", cat.Slug)
	}

	// 2. GetById
	found, err := service.GetById(cat.IDCategory)
	if err != nil {
		t.Fatalf("Ekspektasi GetById sukses, error: %v", err)
	}
	if found.CategoryName != "Minuman Segar" {
		t.Errorf("Ekspektasi CategoryName 'Minuman Segar', didapat '%s'", found.CategoryName)
	}

	// 3. GetAll
	all, err := service.GetAll()
	if err != nil {
		t.Fatalf("Ekspektasi GetAll sukses, error: %v", err)
	}
	if len(all) != 1 {
		t.Errorf("Ekspektasi 1 category, didapat %d", len(all))
	}

	// 4. Update
	updated, err := service.Update(cat.IDCategory, 0, "Minuman Dingin", "product", "Deskripsi baru", "active")
	if err != nil {
		t.Fatalf("Ekspektasi Update sukses, error: %v", err)
	}
	if updated.CategoryName != "Minuman Dingin" {
		t.Errorf("Ekspektasi CategoryName 'Minuman Dingin', didapat '%s'", updated.CategoryName)
	}
	if updated.Slug != "minuman-dingin" {
		t.Errorf("Ekspektasi slug 'minuman-dingin', didapat '%s'", updated.Slug)
	}

	// 5. Delete
	err = service.Delete(cat.IDCategory)
	if err != nil {
		t.Fatalf("Ekspektasi Delete sukses, error: %v", err)
	}

	// Verifikasi sudah terhapus
	_, err = service.GetById(cat.IDCategory)
	if err == nil {
		t.Errorf("Ekspektasi GetById gagal setelah dihapus")
	}
}

func TestCategories_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockRepo := NewMockCategoryRepository()
	service := categories.NewServiceRole(mockRepo)
	handler := categories.NewHandlerRole(service)

	r := gin.New()
	r.GET("/api/v1/categories", handler.GetAll)
	r.GET("/api/v1/categories/:id_category", handler.GetById)
	r.POST("/api/v1/categories", handler.Create)
	r.PUT("/api/v1/categories/:id_category", handler.Update)
	r.DELETE("/api/v1/categories/:id_category", handler.Delete)

	// Uji POST Create Valid -> HTTP 201
	payload := map[string]interface{}{
		"parent_id":     0,
		"category_name": "Bahan Kering",
		"type":          "ingredient",
		"description":   "Bahan baku kering untuk dapur",
		"status":        "active",
	}
	bodyBytes, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodPost, "/api/v1/categories", bytes.NewBuffer(bodyBytes))
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
	datas, ok := createResp["datas"].(map[string]interface{})
	if !ok || datas["category_name"] != "Bahan Kering" {
		t.Errorf("Ekspektasi datas.category_name adalah 'Bahan Kering'")
	}

	// Uji POST Create Invalid Validator -> HTTP 422
	invalidPayload := map[string]interface{}{
		"category_name": "A", // Kurang dari min=3
		"type":          "unknown_type",
		"status":        "active",
	}
	invalidBytes, _ := json.Marshal(invalidPayload)
	reqInvalid, _ := http.NewRequest(http.MethodPost, "/api/v1/categories", bytes.NewBuffer(invalidBytes))
	reqInvalid.Header.Set("Content-Type", "application/json")
	wInvalid := httptest.NewRecorder()
	r.ServeHTTP(wInvalid, reqInvalid)

	if wInvalid.Code != http.StatusUnprocessableEntity {
		t.Fatalf("Ekspektasi HTTP 422 Unprocessable Entity, didapat %d", wInvalid.Code)
	}

	// Uji GET All -> HTTP 200
	reqGetAll, _ := http.NewRequest(http.MethodGet, "/api/v1/categories", nil)
	wGetAll := httptest.NewRecorder()
	r.ServeHTTP(wGetAll, reqGetAll)
	if wGetAll.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk GetAll, didapat %d", wGetAll.Code)
	}

	// Uji GET By ID -> HTTP 200
	reqGetID, _ := http.NewRequest(http.MethodGet, "/api/v1/categories/1", nil)
	wGetID := httptest.NewRecorder()
	r.ServeHTTP(wGetID, reqGetID)
	if wGetID.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk GetById, didapat %d", wGetID.Code)
	}

	// Uji PUT Update -> HTTP 200
	updatePayload := map[string]interface{}{
		"parent_id":     0,
		"category_name": "Bahan Kering Rempah",
		"type":          "ingredient",
		"description":   "Deskripsi terupdate rempah",
		"status":        "active",
	}
	upBytes, _ := json.Marshal(updatePayload)
	reqUpdate, _ := http.NewRequest(http.MethodPut, "/api/v1/categories/1", bytes.NewBuffer(upBytes))
	reqUpdate.Header.Set("Content-Type", "application/json")
	wUpdate := httptest.NewRecorder()
	r.ServeHTTP(wUpdate, reqUpdate)
	if wUpdate.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk Update, didapat %d. Body: %s", wUpdate.Code, wUpdate.Body.String())
	}

	// Uji DELETE -> HTTP 200
	reqDel, _ := http.NewRequest(http.MethodDelete, "/api/v1/categories/1", nil)
	wDel := httptest.NewRecorder()
	r.ServeHTTP(wDel, reqDel)
	if wDel.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 OK untuk Delete, didapat %d", wDel.Code)
	}
}

func init() {
	_ = model.Category{}
}
