package diningtables

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service DiningTableService
}

func NewHandler(service DiningTableService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	outletIDStr := ctx.DefaultQuery("outlet_id", "0")
	status := ctx.DefaultQuery("status", "")

	outletID, err := strconv.Atoi(outletIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid outlet_id parameter", err.Error())
		return
	}

	data, err := h.service.GetAll(uint(outletID), status)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve dining tables list!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received dining tables successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_dining_table")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_dining_table parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve dining table details by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Dining table not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received dining table details by ID successfully!", data)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req CreateDiningTableInput

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validator Fail!", errMap)
		return
	}

	data, err := h.service.Create(req)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to create dining table!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created dining table successfully!", data)
}

func (h *Handler) Update(ctx *gin.Context) {
	idStr := ctx.Param("id_dining_table")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_dining_table parameter", err.Error())
		return
	}

	var req UpdateDiningTableInput

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validator Fail!", errMap)
		return
	}

	data, err := h.service.Update(uint(id), req)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to update dining table!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated dining table successfully!", data)
}

func (h *Handler) Delete(ctx *gin.Context) {
	idStr := ctx.Param("id_dining_table")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_dining_table parameter", err.Error())
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to delete dining table!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Deleted dining table successfully!", nil)
}
