package suppliers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterSupplierRoutes(r *gin.Engine, db *gorm.DB) {
	repo := NewSupplierRepository(db)
	service := NewServiceSupplier(repo)
	handler := NewHandlerSupplier(service)

	group := r.Group("/api/v1/suppliers")
	{
		group.GET("/", handler.GetAll)
		group.GET("/:id_supplier", handler.GetById)
		group.POST("/", handler.Create)
		group.PUT("/:id_supplier", handler.Update)
		group.DELETE("/:id_supplier", handler.Delete)
	}
}
