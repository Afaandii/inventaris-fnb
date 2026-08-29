package recipeitems

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service RecipeItemService
}

func NewHandler(service RecipeItemService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	recipeIDStr := ctx.DefaultQuery("recipe_id", "0")

	recipeID, err := strconv.Atoi(recipeIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid recipe_id parameter", err.Error())
		return
	}

	data, err := h.service.GetAll(uint(recipeID))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve recipe items list!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received recipe items successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_recipe_item")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_recipe_item parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve recipe item by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Recipe item not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received recipe item details by ID successfully!", data)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req CreateRecipeItemDetailInput

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
		response.Error(ctx, http.StatusInternalServerError, "Failed to create recipe item!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created recipe item successfully!", data)
}

func (h *Handler) Update(ctx *gin.Context) {
	idStr := ctx.Param("id_recipe_item")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_recipe_item parameter", err.Error())
		return
	}

	var req UpdateRecipeItemDetailInput

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
		response.Error(ctx, http.StatusInternalServerError, "Failed to update recipe item!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated recipe item successfully!", data)
}

func (h *Handler) Delete(ctx *gin.Context) {
	idStr := ctx.Param("id_recipe_item")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_recipe_item parameter", err.Error())
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to delete recipe item!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Deleted recipe item successfully!", nil)
}
