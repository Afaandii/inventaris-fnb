package users

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterUserRoutes(r *gin.Engine, db *gorm.DB) {
	repo := NewUserRepository(db)
	service := NewServiceUser(repo)
	handler := NewHandlerUser(service)

	group := r.Group("/api/v1/users")
	{
		group.GET("", handler.GetAll)
		group.GET("/:id_user", handler.GetById)
		group.POST("", handler.Create)
		group.PUT("/:id_user", handler.Update)
		group.DELETE("/:id_user", handler.Delete)
	}
}
