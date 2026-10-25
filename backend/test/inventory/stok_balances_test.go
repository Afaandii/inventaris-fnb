package inventory_test

import (
	stokbalances "backend/internal/modules/inventory/stok_balances"
	"backend/internal/shared/model"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestStokBalances_Service(t *testing.T) {
	repo := NewMockStokBalanceRepo()
	mockMovementService := &MockStokMovementService{}
	service := stokbalances.NewStokBalanceService(repo, mockMovementService)

	// Seed data via Repo
	_ = repo.Create(&model.StokBalances{
		IngredientRef: 1,
		WirehouseRef:  1,
		AvailableQty:  100,
		BatchNo:       "BATCH-001",
	})
	_ = repo.Create(&model.StokBalances{
		IngredientRef: 2,
		WirehouseRef:  1,
		AvailableQty:  50,
		BatchNo:       "BATCH-002",
	})

	t.Run("GetAll Success", func(t *testing.T) {
		res, err := service.GetAll(1, 0)
		if err != nil {
			t.Fatalf("Unexpected error: %v", err)
		}
		if len(res) != 2 {
			t.Errorf("Expected 2 balances, got %d", len(res))
		}
	})

	t.Run("GetByID Success", func(t *testing.T) {
		res, err := service.GetByID(1)
		if err != nil {
			t.Fatalf("Unexpected error: %v", err)
		}
		if res == nil || res.IDStokBalance != 1 {
			t.Errorf("Expected balance ID 1, got %v", res)
		}
	})

	t.Run("GetByID Not Found", func(t *testing.T) {
		res, err := service.GetByID(999)
		if err != nil {
			t.Fatalf("Unexpected error: %v", err)
		}
		if res != nil {
			t.Errorf("Expected nil, got %v", res)
		}
	})
}

func TestStokBalances_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &MockStokBalanceService{
		Balances: []model.StokBalances{
			{IDStokBalance: 1, IngredientRef: 1, WirehouseRef: 1, AvailableQty: 100},
		},
	}
	handler := stokbalances.NewStokBalanceHandler(mockService)

	router := gin.New()
	router.GET("/inventory/stok-balances", handler.GetAll)
	router.GET("/inventory/stok-balances/:id_stok_balance", handler.GetByID)

	t.Run("GetAll Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/inventory/stok-balances?wirehouse_id=1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}

		var resp map[string]interface{}
		_ = json.Unmarshal(rec.Body.Bytes(), &resp)
		if resp["status"] != "success" {
			t.Errorf("Expected status success, got %v", resp["status"])
		}
	})

	t.Run("GetByID Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/inventory/stok-balances/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetByID Invalid ID", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/inventory/stok-balances/abc", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Errorf("Expected HTTP 400, got %d", rec.Code)
		}
	})
}
