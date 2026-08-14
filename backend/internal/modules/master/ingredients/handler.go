package ingredients

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service ServiceIngredient
}

func NewHandlerIngredient(service ServiceIngredient) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	ingre, err := h.service.GetAll()
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve data ingredient!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received data ingredient successfully!", ingre)
}

func (h *Handler) GetById(ctx *gin.Context) {
	id_ingre, err := strconv.Atoi(ctx.Param("id_ingredient"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id ingredient", err.Error())
		return
	}

	ingre, err := h.service.GetById(uint(id_ingre))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed retrieve data ingredient by id!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received data ingredient by id successfully!", ingre)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req struct {
		CategoryId       uint    `json:"category_id" validate:"required,number,min=1"`
		UnitId           uint    `json:"unit_id" validate:"required,number,min=1"`
		SupplierId       uint    `json:"supplier_id" validate:"required,number,min=1"`
		IngreName        string  `json:"ingre_name" validate:"required,min=3,max=180"`
		Sku              string  `json:"sku" validate:"required,min=1,max=180"`
		Barcode          string  `json:"" validate:"required,alphanum,min=1,max=255"`
		MinStok          float64 `json:"min_stok" validate:"required,gte=0"`
		MaxStok          float64 `json:"max_stok" validate:"required,gt=0"`
		CostPrice        float64 `json:"cost_price" validate:"required,gte=0"`
		AverageCost      float64 `json:"average_cost" validate:"required,gte=0"`
		IsPerishable     bool    `json:"is_perishable" validate:"required,boolean"`
		ShelfLifeDay     int     `json:"shelf_life_day" validate:"required,number"`
		StatusIngredient string  `json:"status_ingredient" validate:"required,min=3,max=180"`
		IsActive         bool    `json:"is_active" validate:"required,boolean"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validator Fail!", errMap)
		return
	}

	ingre, err := h.service.Create(req.CategoryId, req.UnitId, req.SupplierId, req.IngreName, req.Sku, req.Barcode, req.MinStok, req.MaxStok, req.CostPrice, req.AverageCost, req.IsPerishable, req.ShelfLifeDay, req.StatusIngredient, req.IsActive)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Faied to create data ingredient!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created data ingredient successfully!", ingre)
}

func (h *Handler) Update(ctx *gin.Context) {
	id_ingre, err := strconv.Atoi(ctx.Param("id_ingredient"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id ingredient!", err.Error())
		return
	}

	var req struct {
		CategoryId       uint    `json:"category_id" validate:"required,number,min=1"`
		UnitId           uint    `json:"unit_id" validate:"required,number,min=1"`
		SupplierId       uint    `json:"supplier_id" validate:"required,number,min=1"`
		IngreName        string  `json:"ingre_name" validate:"required,min=3,max=180"`
		Sku              string  `json:"sku" validate:"required,min=1,max=180"`
		Barcode          string  `json:"" validate:"required,alphanum,min=1,max=255"`
		MinStok          float64 `json:"min_stok" validate:"required,numeric"`
		MaxStok          float64 `json:"max_stok" validate:"required,numeric"`
		CostPrice        float64 `json:"cost_price" validate:"required,numeric"`
		AverageCost      float64 `json:"average_cost" validate:"required,numeric"`
		IsPerishable     bool    `json:"is_perishable" validate:"required,boolean"`
		ShelfLifeDay     int     `json:"shelf_life_day" validate:"required,number"`
		StatusIngredient string  `json:"status_ingredient" validate:"required,min=3,max=180"`
		IsActive         bool    `json:"is_active" validate:"required,boolean"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body!", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validator Fail!", errMap)
		return
	}

	ingre, err := h.service.Update(uint(id_ingre), req.CategoryId, req.UnitId, req.SupplierId, req.IngreName, req.Sku, req.Barcode, req.MinStok, req.MaxStok, req.CostPrice, req.AverageCost, req.IsPerishable, req.ShelfLifeDay, req.StatusIngredient, req.IsActive)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to update data ingredient!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated data ingredient successfully!", ingre)
}

func (h *Handler) Delete(ctx *gin.Context) {
	id_ingre, err := strconv.Atoi(ctx.Param("id_ingredient"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id ingredient!", err.Error())
		return
	}

	err = h.service.Delete(uint(id_ingre))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to delete data ingredient!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Deleted data ingredient successfully!", nil)
}
