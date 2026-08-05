package categories

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service ServiceCategory
}

func NewHandlerRole(service ServiceCategory) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	category, err := h.service.GetAll()
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve data categories", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received data categories successfully!", category)
}

func (h *Handler) GetById(ctx *gin.Context) {
	id_category, err := strconv.Atoi(ctx.Param("id_category"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id category!", nil)
		return
	}

	category, err := h.service.GetById(uint(id_category))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve data category by id!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received data category by id successfully!", category)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req struct {
		ParentId     uint   `json:"parent_id"`
		CategoryName string `json:"category_name" validate:"required,min=3,max=200"`
		Types        string `json:"types" validate:"required,oneof=products,max=120"`
		Description  string `json:"description" validate:"min:3,max=500"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validation fail!", errMap)
		return
	}

	category, err := h.service.Create(req.ParentId, req.CategoryName, req.Types, req.Description)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to create data category", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Category created successfully!", category)
}

func (h *Handler) Update(ctx *gin.Context) {
	id_category, err := strconv.Atoi(ctx.Param("category_id"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id Category!", nil)
		return
	}

	var req struct {
		ParentId     uint   `json:"parent_id"`
		CategoryName string `json:"category_name" validate:"required,min=3,max=200"`
		Types        string `json:"types" validate:"required,oneof=products,max=120"`
		Description  string `json:"description" validate:"min:3,max=500"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validation fail!", errMap)
		return
	}

	category, err := h.service.Update(uint(id_category), req.ParentId, req.CategoryName, req.Types, req.Description)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to update data category", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Category updated successfully!", category)
}

func (h *Handler) Delete(ctx *gin.Context) {
	id_category, err := strconv.Atoi(ctx.Param("category_id"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id Category!", nil)
		return
	}

	if err := h.service.Delete(uint(id_category)); err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to delete data category", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Category deleted successfully!", nil)
}
