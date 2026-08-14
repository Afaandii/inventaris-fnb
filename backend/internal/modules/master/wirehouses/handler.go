package wirehouses

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service ServiceWirehouse
}

func NewHandlerWirehouse(service ServiceWirehouse) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	wire, err := h.service.GetAll()
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieved data wirehouse!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received data wirehouse successfully!", wire)
}

func (h *Handler) GetById(ctx *gin.Context) {
	id_wire, err := strconv.Atoi(ctx.Param("id_wirehouse"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id wirehouse!", err.Error())
		return
	}

	wire, err := h.service.GetById(uint(id_wire))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed retrieved data wirehouse by id!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received data wirehouse by id successfully!", wire)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req struct {
		OutletId      uint   `json:"outlet_id" validate:"required,number,min=1"`
		ManagerId     uint   `json:"manager_id" validate:"required,number,min=1"`
		WirehouseName string `json:"wirehouse_name" validate:"required,min=3,max=180"`
		Address       string `json:"address" validate:"required,min=3,max=120"`
		City          string `json:"city" validate:"required,min=3,max=80"`
		PhoneNumber   string `json:"phone_number" validate:"required,max=20,alphanum"`
		Type          string `json:"type" validate:"required,max=150,alpha"`
		Status        string `json:"status" validate:"required,max=150,alpha"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validator fail!", errMap)
		return
	}

	wire, err := h.service.Create(req.OutletId, req.ManagerId, req.WirehouseName, req.Address, req.City, req.PhoneNumber, req.Type, req.Status)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to created wirehouse!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created data wirehouse successfully!", wire)
}

func (h *Handler) Update(ctx *gin.Context) {
	id_wire, err := strconv.Atoi(ctx.Param("id_wirehouse"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invali id wirehouse", err.Error())
		return
	}

	var req struct {
		OutletId      uint   `json:"outlet_id" validate:"required,number,min=1"`
		ManagerId     uint   `json:"manager_id" validate:"required,number,min=1"`
		WirehouseName string `json:"wirehouse_name" validate:"required,min=3,max=180"`
		Address       string `json:"address" validate:"required,min=3,max=120"`
		City          string `json:"city" validate:"required,min=3,max=80"`
		PhoneNumber   string `json:"phone_number" validate:"required,max=20,alphanum"`
		Type          string `json:"type" validate:"required,max=150,alpha"`
		Status        string `json:"status" validate:"required,max=150,alpha"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validator fail!", errMap)
		return
	}

	wire, err := h.service.Update(uint(id_wire), req.OutletId, req.ManagerId, req.WirehouseName, req.Address, req.City, req.PhoneNumber, req.Type, req.Status)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to updated data wirehouse!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated data wirehouse successfully!", wire)
}

func (h *Handler) Delete(ctx *gin.Context) {
	id_wire, err := strconv.Atoi(ctx.Param("id_wirehouse"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invali id wirehouse", err.Error())
		return
	}

	err = h.service.Delete(uint(id_wire))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to deleted data wirehouse!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Deleted data wirehouse successfully!", nil)
}
