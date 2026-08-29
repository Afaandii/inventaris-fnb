package recipes

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service RecipeService
}

func NewHandler(service RecipeService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	productIDStr := ctx.DefaultQuery("product_id", "0")
	outletIDStr := ctx.DefaultQuery("outlet_id", "0")
	isActiveStr := ctx.Query("is_active")

	productID, err := strconv.Atoi(productIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid product_id parameter", err.Error())
		return
	}

	outletID, err := strconv.Atoi(outletIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid outlet_id parameter", err.Error())
		return
	}

	var isActive *bool
	if isActiveStr != "" {
		val := isActiveStr == "true" || isActiveStr == "1"
		isActive = &val
	}

	data, err := h.service.GetAll(uint(productID), uint(outletID), isActive)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve recipes list!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received recipes successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_recipe")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_recipe parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve recipe by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Recipe not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received recipe details by ID successfully!", data)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req CreateRecipeInput

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
		response.Error(ctx, http.StatusInternalServerError, "Failed to create recipe!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created recipe successfully!", data)
}

func (h *Handler) Update(ctx *gin.Context) {
	idStr := ctx.Param("id_recipe")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_recipe parameter", err.Error())
		return
	}

	var req UpdateRecipeInput

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
		response.Error(ctx, http.StatusInternalServerError, "Failed to update recipe!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated recipe successfully!", data)
}

func (h *Handler) Delete(ctx *gin.Context) {
	idStr := ctx.Param("id_recipe")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_recipe parameter", err.Error())
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to delete recipe!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Deleted recipe successfully!", nil)
}
