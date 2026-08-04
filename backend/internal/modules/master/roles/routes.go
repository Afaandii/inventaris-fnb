package roles

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutesRole(r *gin.Engine, db *gorm.DB) {
	repo := NewRoleRepository(db)
	service := NewService(repo)
	handler := NewHandler(service)

	group := r.Group("/api/v1/roles")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_role", handler.GetById)
		group.POST("", handler.Create)
		group.PUT("/:id_role", handler.Update)
		group.DELETE("/:id_role", handler.Delete)
	}
}
