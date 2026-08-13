package users

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service ServiceUser
}

func NewHandlerUser(service ServiceUser) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	unt, err := h.service.GetAll()
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieved data user!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received data user successfully!", unt)
}

func (h *Handler) GetById(ctx *gin.Context) {
	id_user, err := strconv.Atoi(ctx.Param("id_user"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id user!", err.Error())
		return
	}

	unt, err := h.service.GetById(uint(id_user))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieved data user by id!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received data user by id successfully!", unt)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req struct {
		RoleId      uint      `json:"role_id" validate:"required,min=1,number"`
		OutletId    uint      `json:"outlet_id" validate:"required,min=1,number"`
		Name        string    `json:"name" validate:"required,min=4,max=120,alpha"`
		Username    string    `json:"username" validate:"required,min=4,max=150,alpha"`
		Email       string    `json:"email" validate:"required,min=4,max=100,alphanum"`
		Password    string    `json:"password" validate:"required,min=8,max=80,alphanum"`
		PhoneNumber string    `json:"phone_number" validate:"required,min=1,max=20,number"`
		LastLogin   time.Time `json:"last_login" validate:"datetime=15:04"`
		Avatar      string    `json:"avatar" validate:"min=3,max=255,alphanum"`
		Status      string    `json:"status" validate:"required,min=3,max=120,alpha"`
		IsActive    bool      `json:"is_active" validate:"min=1,boolean"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validator fail!", errMap)
		return
	}

	usr, err := h.service.Create(req.RoleId, req.OutletId, req.Name, req.Username, req.Email, req.Password, req.PhoneNumber, req.LastLogin, req.Avatar, req.Status, req.IsActive)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed create data user!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created data user successfully!", usr)
}

func (h *Handler) Update(ctx *gin.Context) {
	id_user, err := strconv.Atoi(ctx.Param("id_user"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id user!", err.Error())
		return
	}

	var req struct {
		RoleId      uint      `json:"role_id" validate:"required,min=1,number"`
		OutletId    uint      `json:"outlet_id" validate:"required,min=1,number"`
		Name        string    `json:"name" validate:"required,min=4,max=120,alpha"`
		Username    string    `json:"username" validate:"required,min=4,max=150,alpha"`
		Email       string    `json:"email" validate:"required,min=4,max=100,alphanum"`
		Password    string    `json:"password" validate:"required,min=8,max=80,alphanum"`
		PhoneNumber string    `json:"phone_number" validate:"required,min=1,max=20,number"`
		LastLogin   time.Time `json:"last_login" validate:"datetime=15:04"`
		Avatar      string    `json:"avatar" validate:"min=3,max=255,alphanum"`
		Status      string    `json:"status" validate:"required,min=3,max=120,alpha"`
		IsActive    bool      `json:"is_active" validate:"min=1,boolean"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validator fail!", errMap)
		return
	}

	usr, err := h.service.Update(uint(id_user), req.RoleId, req.OutletId, req.Name, req.Username, req.Email, req.Password, req.PhoneNumber, req.LastLogin, req.Avatar, req.Status, req.IsActive)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed update data user!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated data user successfully!", usr)
}

func (h *Handler) Delete(ctx *gin.Context) {
	id_user, err := strconv.Atoi(ctx.Param("id_user"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id user!", err.Error())
		return
	}

	err = h.service.Delete(uint(id_user))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed deteled data user!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Deleted data user successfully!", nil)
}
