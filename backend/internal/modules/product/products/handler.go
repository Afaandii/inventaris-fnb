package products

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service ProductService
}

func NewHandler(service ProductService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	categoryIDStr := ctx.DefaultQuery("category_id", "0")
	prodType := ctx.DefaultQuery("prod_type", "")
	isActiveStr := ctx.Query("is_active")

	categoryID, err := strconv.Atoi(categoryIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid category_id parameter", err.Error())
		return
	}

	var isActive *bool
	if isActiveStr != "" {
		val := isActiveStr == "true" || isActiveStr == "1"
		isActive = &val
	}

	data, err := h.service.GetAll(uint(categoryID), prodType, isActive)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve products list!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received products successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_product")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_product parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve product details by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Product not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received product details by ID successfully!", data)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req CreateProductInput

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
		response.Error(ctx, http.StatusInternalServerError, "Failed to create product!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created product successfully!", data)
}

func (h *Handler) Update(ctx *gin.Context) {
	idStr := ctx.Param("id_product")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_product parameter", err.Error())
		return
	}

	var req UpdateProductInput

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
		response.Error(ctx, http.StatusInternalServerError, "Failed to update product!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated product successfully!", data)
}

func (h *Handler) Delete(ctx *gin.Context) {
	idStr := ctx.Param("id_product")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_product parameter", err.Error())
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to delete product!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Deleted product successfully!", nil)
}
