package reservations_test

import (
	"backend/internal/modules/reservations/reservation"
	"backend/internal/shared/model"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
)

func TestReservation_Handler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &MockReservationService{
		Reservations: []model.Reservations{
			{
				IDReservation:     1,
				OutletRef:         1,
				TableRef:          1,
				CreatedBy:         1,
				ReservationCode:   "RSV-20261026-001",
				CustName:          "John Doe",
				CustPhone:         "081234567890",
				ReservationDate:   time.Now(),
				ReservationTime:   datatypes.NewTime(19, 0, 0, 0),
				NumberOfGuest:     4,
				StatusReservation: "pending",
			},
		},
		AvailTables: []model.DiningTables{
			{
				IDDiningTable: 1,
				OutletRef:     1,
				Name:          "Table 01",
				Capacity:      4,
				StatusTable:   "available",
			},
		},
	}
	handler := reservation.NewHandler(mockService)

	router := gin.New()
	router.GET("/reservations", handler.GetAll)
	router.GET("/reservations/:id_reservation", handler.GetByID)
	router.GET("/reservations/available-tables", handler.GetAvailableTables)
	router.POST("/reservations", handler.Create)
	router.PUT("/reservations/:id_reservation", handler.Update)
	router.PUT("/reservations/:id_reservation/status", handler.UpdateStatus)

	t.Run("GetAll Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/reservations?outlet_id=1&table_id=1&status=pending", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("GetByID Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/reservations/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d", rec.Code)
		}
	})

	t.Run("GetAvailableTables Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/reservations/available-tables?outlet_id=1&date=2026-10-26&time=19:00&guest=4", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("Create Success", func(t *testing.T) {
		body := map[string]interface{}{
			"outlet_id":        1,
			"table_id":         1,
			"created_by":       1,
			"customer_name":    "Jane Doe",
			"customer_phone":   "089876543210",
			"reservation_date": "2026-10-27",
			"reservation_time": "19:30",
			"number_of_guest":  2,
			"special_request":  "Window seat",
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/reservations", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusCreated {
			t.Fatalf("Expected HTTP 201 Created, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("Create Fail - Missing Customer Phone", func(t *testing.T) {
		body := map[string]interface{}{
			"outlet_id":        1,
			"table_id":         1,
			"created_by":       1,
			"customer_name":    "Jane Doe",
			"reservation_date": "2026-10-27",
			"reservation_time": "19:30",
			"number_of_guest":  2,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPost, "/reservations", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnprocessableEntity {
			t.Errorf("Expected HTTP 422, got %d", rec.Code)
		}
	})

	t.Run("Update Success", func(t *testing.T) {
		body := map[string]interface{}{
			"outlet_id":        1,
			"table_id":         1,
			"customer_name":    "Jane Doe Update",
			"customer_phone":   "089876543210",
			"reservation_date": "2026-10-27",
			"reservation_time": "20:00",
			"number_of_guest":  3,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPut, "/reservations/1", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200 OK, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("UpdateStatus Success - Confirmed", func(t *testing.T) {
		body := map[string]interface{}{
			"status":  "confirmed",
			"user_id": 1,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPut, "/reservations/1/status", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("Expected HTTP 200 OK, got %d: %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("UpdateStatus Fail - Invalid Status", func(t *testing.T) {
		body := map[string]interface{}{
			"status":  "waiting_payment",
			"user_id": 1,
		}
		jsonBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest(http.MethodPut, "/reservations/1/status", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnprocessableEntity {
			t.Errorf("Expected HTTP 422, got %d", rec.Code)
		}
	})
}
