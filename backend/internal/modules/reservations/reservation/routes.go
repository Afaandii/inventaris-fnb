package reservation

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB) ReservationService {
	repo := NewReservationRepository(db)
	service := NewReservationService(db, repo)
	handler := NewHandler(service)

	group := r.Group("/api/v1/reservations/reservations")
	{
		group.GET("", handler.GetAll)
		group.GET("/available-tables", handler.GetAvailableTables)
		group.GET("/:id_reservation", handler.GetByID)
		group.POST("", handler.Create)
		group.PUT("/:id_reservation", handler.Update)
		group.PUT("/:id_reservation/status", handler.UpdateStatus)
	}

	return service
}
