package productvariants

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service ProductVariantService
}

func NewHandler(service ProductVariantService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	productIDStr := ctx.DefaultQuery("product_id", "0")
	isActiveStr := ctx.Query("is_active")

	productID, err := strconv.Atoi(productIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid product_id parameter", err.Error())
		return
	}

	var isActive *bool
	if isActiveStr != "" {
		val := isActiveStr == "true" || isActiveStr == "1"
		isActive = &val
	}

	data, err := h.service.GetAll(uint(productID), isActive)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve product variants list!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received product variants successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_product_variant")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_product_variant parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve product variant by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Product variant not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received product variant details by ID successfully!", data)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req CreateVariantInput

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
		response.Error(ctx, http.StatusInternalServerError, "Failed to create product variant!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created product variant successfully!", data)
}

func (h *Handler) Update(ctx *gin.Context) {
	idStr := ctx.Param("id_product_variant")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_product_variant parameter", err.Error())
		return
	}

	var req UpdateVariantInput

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
		response.Error(ctx, http.StatusInternalServerError, "Failed to update product variant!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated product variant successfully!", data)
}

func (h *Handler) Delete(ctx *gin.Context) {
	idStr := ctx.Param("id_product_variant")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_product_variant parameter", err.Error())
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to delete product variant!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Deleted product variant successfully!", nil)
}
