package outlets

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterOutletRoutes(r *gin.Engine, db *gorm.DB) {
	repo := NewOutletRepository(db)
	service := NewServiceOutlet(repo)
	handler := NewHandlerOutlet(service)

	group := r.Group("/api/v1/outlets")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_outlet", handler.GetById)
		group.POST("", handler.Create)
		group.PUT("/:id_outlet", handler.Update)
		group.DELETE("/:id_outlet", handler.Delete)
	}
}
