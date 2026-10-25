package auth_test

import (
	"backend/internal/modules/auth"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func setupGinTestRouter() (*gin.Engine, *MockAuthRepository, *MockAuditLogService) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	mockRepo := NewMockAuthRepository()
	mockAudit := NewMockAuditLogService()
	service := auth.NewAuthService(mockRepo, mockAudit)
	handler := auth.NewAuthHandler(service)

	r.POST("/api/v1/auth/login", handler.Login)
	r.POST("/api/v1/auth/logout", handler.Logout)

	// Endpoint /me dengan simulasi context user_id
	r.GET("/api/v1/auth/me", handler.Me)

	return r, mockRepo, mockAudit
}

func TestHandler_Login_Success(t *testing.T) {
	router, mockRepo, _ := setupGinTestRouter()

	user := createTestUser(100, "kasir@example.com", "Password123!", "active", true)
	mockRepo.Users[user.Email] = user
	mockRepo.UsersByID[user.IDUser] = user

	payload := auth.LoginRequest{
		Email:      "kasir@example.com",
		Password:   "Password123!",
		RememberMe: false,
	}
	bodyBytes, _ := json.Marshal(payload)

	req, _ := http.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP status 200, tapi didapat %d. Body: %s", w.Code, w.Body.String())
	}

	// 1. Verifikasi HttpOnly Cookie 'access_token' diset
	cookieHeader := w.Header().Get("Set-Cookie")
	if !strings.Contains(cookieHeader, "access_token=") {
		t.Errorf("Ekspektasi cookie 'access_token' ada di Set-Cookie header, didapat: %s", cookieHeader)
	}
	if !strings.Contains(cookieHeader, "HttpOnly") {
		t.Errorf("Ekspektasi cookie berstatus HttpOnly, didapat: %s", cookieHeader)
	}

	// 2. Verifikasi respon JSON sesuai APIResponse (status, message, datas)
	var resp map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Gagal unmarshal respon JSON: %v", err)
	}

	status, ok := resp["status"].(string)
	if !ok || status != "success" {
		t.Errorf("Ekspektasi status bernilai 'success', didapat: %v", resp["status"])
	}

	datas, ok := resp["datas"].(map[string]interface{})
	if !ok || datas["email"] != "kasir@example.com" {
		t.Errorf("Ekspektasi datas.email adalah kasir@example.com, didapat: %v", resp["datas"])
	}
}

func TestHandler_Login_BadRequest(t *testing.T) {
	router, _, _ := setupGinTestRouter()

	// Kirim JSON invalid (email kosong dan password kosong)
	body := []byte(`{"email": "bukan-email", "password": ""}`)

	req, _ := http.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("Ekspektasi HTTP status 400 Bad Request, didapat %d", w.Code)
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Gagal unmarshal respon JSON: %v", err)
	}

	status, ok := resp["status"].(string)
	if !ok || status != "error" {
		t.Errorf("Ekspektasi status bernilai 'error', didapat: %v", resp["status"])
	}
}

func TestHandler_Login_Unauthorized(t *testing.T) {
	router, _, _ := setupGinTestRouter()

	payload := auth.LoginRequest{
		Email:    "salah@example.com",
		Password: "PasswordSalah123",
	}
	bodyBytes, _ := json.Marshal(payload)

	req, _ := http.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("Ekspektasi HTTP status 401 Unauthorized, didapat %d", w.Code)
	}

	var resp map[string]interface{}
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	if resp["status"] != "error" {
		t.Errorf("Ekspektasi status 'error', didapat: %v", resp["status"])
	}
}

func TestHandler_Logout(t *testing.T) {
	router, _, _ := setupGinTestRouter()

	req, _ := http.NewRequest(http.MethodPost, "/api/v1/auth/logout", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP status 200 OK untuk logout, didapat %d", w.Code)
	}

	// Verifikasi cookie dihapus (Set-Cookie berisi Max-Age=0 atau kedaluwarsa)
	cookieHeader := w.Header().Get("Set-Cookie")
	if !strings.Contains(cookieHeader, "access_token=") {
		t.Errorf("Ekspektasi cookie 'access_token' dihapus pada header Set-Cookie, didapat: %s", cookieHeader)
	}
}

func TestHandler_Me_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	mockRepo := NewMockAuthRepository()
	mockAudit := NewMockAuditLogService()
	service := auth.NewAuthService(mockRepo, mockAudit)
	handler := auth.NewAuthHandler(service)

	user := createTestUser(105, "me_test@example.com", "Password123!", "active", true)
	mockRepo.UsersByID[user.IDUser] = user

	// Middleware simulasi inject user_id ke context Gin
	r.GET("/api/v1/auth/me", func(c *gin.Context) {
		c.Set("user_id", user.IDUser)
		c.Next()
	}, handler.Me)

	req, _ := http.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Ekspektasi HTTP 200 untuk Me terautentikasi, didapat %d", w.Code)
	}

	var resp map[string]interface{}
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	datas, ok := resp["datas"].(map[string]interface{})
	if !ok || datas["email"] != user.Email {
		t.Errorf("Ekspektasi datas.email %s, didapat %v", user.Email, resp["datas"])
	}
}

func TestHandler_Me_NoUserContext(t *testing.T) {
	router, _, _ := setupGinTestRouter()

	// Akses /me tanpa middleware yang menyuntikkan user_id ke context
	req, _ := http.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("Ekspektasi HTTP 401 saat user_id tidak ada di context, didapat %d", w.Code)
	}
}

func TestHandler_Me_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	mockRepo := NewMockAuthRepository()
	mockAudit := NewMockAuditLogService()
	service := auth.NewAuthService(mockRepo, mockAudit)
	handler := auth.NewAuthHandler(service)

	// Injek user_id 9999 yang tidak ada di mockRepo
	r.GET("/api/v1/auth/me", func(c *gin.Context) {
		c.Set("user_id", uint(9999))
		c.Next()
	}, handler.Me)

	req, _ := http.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("Ekspektasi HTTP 404 saat user tidak ditemukan, didapat %d", w.Code)
	}
}
