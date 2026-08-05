package units

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterUnitRoute(r *gin.Engine, db *gorm.DB) {
	repo := NewUnitRepository(db)
	service := NewUnitService(repo)
	handler := NewHandlerUnit(service)

	group := r.Group("/api/v1/units")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_unit", handler.GetById)
		group.POST("", handler.Create)
		group.PUT("/:id_unit", handler.Update)
		group.DELETE("/:id_unit", handler.Delete)
	}
}
