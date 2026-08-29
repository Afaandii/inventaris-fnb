package menuitems

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service MenuItemService
}

func NewHandler(service MenuItemService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	outletIDStr := ctx.DefaultQuery("outlet_id", "0")
	productIDStr := ctx.DefaultQuery("product_id", "0")
	isAvailableStr := ctx.Query("is_available")

	outletID, err := strconv.Atoi(outletIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid outlet_id parameter", err.Error())
		return
	}

	productID, err := strconv.Atoi(productIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid product_id parameter", err.Error())
		return
	}

	var isAvailable *bool
	if isAvailableStr != "" {
		val := isAvailableStr == "true" || isAvailableStr == "1"
		isAvailable = &val
	}

	data, err := h.service.GetAll(uint(outletID), uint(productID), isAvailable)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve menu items list!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received menu items successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_menu_item")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_menu_item parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve menu item by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Menu item not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received menu item details by ID successfully!", data)
}

func (h *Handler) GetCatalogByOutlet(ctx *gin.Context) {
	outletIDStr := ctx.Param("outlet_id")
	outletID, err := strconv.Atoi(outletIDStr)
	if err != nil || outletID <= 0 {
		response.Error(ctx, http.StatusBadRequest, "Invalid outlet_id parameter", nil)
		return
	}

	data, err := h.service.GetCatalogByOutlet(uint(outletID))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve outlet menu catalog!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received outlet menu catalog successfully!", data)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req CreateMenuItemInput

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
		response.Error(ctx, http.StatusInternalServerError, "Failed to create menu item!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created menu item successfully!", data)
}

func (h *Handler) Update(ctx *gin.Context) {
	idStr := ctx.Param("id_menu_item")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_menu_item parameter", err.Error())
		return
	}

	var req UpdateMenuItemInput

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
		response.Error(ctx, http.StatusInternalServerError, "Failed to update menu item!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Updated menu item successfully!", data)
}

func (h *Handler) Delete(ctx *gin.Context) {
	idStr := ctx.Param("id_menu_item")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_menu_item parameter", err.Error())
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to delete menu item!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Deleted menu item successfully!", nil)
}
