package inventory_test

import (
	stokmovements "backend/internal/modules/inventory/stok_movements"
	"backend/internal/shared/model"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

func TestStokMovements_Service(t *testing.T) {
	repo := NewMockStokMovementRepo()
	service := stokmovements.NewStokMovementService(repo)

	wh1 := uint(1)
	wh2 := uint(2)
	_ = repo.CreateWithTx(nil, &model.StokMovements{
		WirehouseFrom: &wh1,
		WirehouseTo:   &wh2,
		IngredientRef: 1,
		MovementType:  "transfer",
		Qty:           decimal.NewFromInt(10),
		MovementDate:  time.Now(),
	})

	t.Run("GetAll Success", func(t *testing.T) {
		res, err := service.GetAll(0, 1, "transfer", "", "")
		if err != nil {
			t.Fatalf("Unexpected error: %v", err)
		}
		if len(res) != 1 {
			t.Errorf("Expected 1 movement, got %d", len(res))
		}
	})

	t.Run("GetByID Success", func(t *testing.T) {
		res, err := service.GetByID(1)
		if err != nil {
			t.Fatalf("Unexpected error: %v", err)
		}
		if res == nil || res.IDStokMovement != 1 {
			t.Errorf("Expected movement ID 1, got %v", res)
		}
	})
}

func TestStokMovements_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &MockStokMovementService{
		Movements: []model.StokMovements{
			{IDStokMovement: 1, IngredientRef: 1, MovementType: "in", Qty: decimal.NewFromInt(50)},
		},
	}
	handler := stokmovements.NewStokMovementHandler(mockService)

	router := gin.New()
	router.GET("/inventory/stok-movements", handler.GetAll)
	router.GET("/inventory/stok-movements/:id_stok_movement", handler.GetByID)

	t.Run("GetAll Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/inventory/stok-movements?movement_type=in", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetByID Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/inventory/stok-movements/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d", rec.Code)
		}
	})

	t.Run("GetByID Not Found", func(t *testing.T) {
		mockServiceEmpty := &MockStokMovementService{}
		hEmpty := stokmovements.NewStokMovementHandler(mockServiceEmpty)
		rEmpty := gin.New()
		rEmpty.GET("/inventory/stok-movements/:id_stok_movement", hEmpty.GetByID)

		req, _ := http.NewRequest(http.MethodGet, "/inventory/stok-movements/999", nil)
		rec := httptest.NewRecorder()
		rEmpty.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("Expected HTTP 404, got %d", rec.Code)
		}
	})

	t.Run("GetByID Invalid ID", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/inventory/stok-movements/xyz", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Errorf("Expected HTTP 400, got %d", rec.Code)
		}
	})
}
