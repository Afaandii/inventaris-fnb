package suppliers

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service ServiceSupplier
}

func NewHandlerSupplier(service ServiceSupplier) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	suppliers, err := h.service.GetAll()
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieved data suppliers", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received data suppliers successfully!", suppliers)
}

func (h *Handler) GetById(ctx *gin.Context) {
	id_supplier, err := strconv.Atoi(ctx.Param("id_supplier"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id supplier!", nil)
		return
	}

	supplier, err := h.service.GetById(uint(id_supplier))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieved data supplier", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received data supplier by id successfully!", supplier)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req struct {
		Npwp           string `json:"npwp" validate:"required,min=3,max=200"`
		SupplierCode   string `json:"supplier_code" validate:"required,min=3,max=200"`
		SupplierName   string `json:"supplier_name" validate:"required,min=3,max=200"`
		Email          string `json:"email" validate:"required,email"`
		Address        string `json:"address" validate:"required,min=3,max=500"`
		City           string `json:"city" validate:"required,min=3,max=200"`
		ContactPerson  string `json:"contact_person" validate:"required,min=3,max=200"`
		BankAccount    string `json:"bank_account" validate:"required,min=3,max=200"`
		Notes          string `json:"notes" validate:"required,min=3,max=500"`
		StatusSupplier string `json:"status_supplier" validate:"required,oneof=active inactive"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validation fail!", errMap)
		return
	}

	supp, err := h.service.Create(req.Npwp, req.SupplierCode, req.SupplierName, req.Email, req.Address, req.City, req.ContactPerson, req.BankAccount, req.Notes, req.StatusSupplier)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to create supplier", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Supplier created successfully!", supp)
}

func (h *Handler) Update(ctx *gin.Context) {
	id_supplier, err := strconv.Atoi(ctx.Param("id_supplier"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id supplier!", nil)
		return
	}

	var req struct {
		Npwp           string `json:"npwp" validate:"required,min=3,max=200"`
		SupplierCode   string `json:"supplier_code" validate:"required,min=3,max=200"`
		SupplierName   string `json:"supplier_name" validate:"required,min=3,max=200"`
		Email          string `json:"email" validate:"required,email"`
		Address        string `json:"address" validate:"required,min=3,max=500"`
		City           string `json:"city" validate:"required,min=3,max=200"`
		ContactPerson  string `json:"contact_person" validate:"required,min=3,max=20"`
		BankAccount    string `json:"bank_account" validate:"required,min=3,max=200"`
		Notes          string `json:"notes" validate:"required,min=3,max=500"`
		StatusSupplier string `json:"status_supplier" validate:"required,oneof=active inactive"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	if errMap := validator.Validate(req); errMap != nil {
		response.Error(ctx, http.StatusUnprocessableEntity, "Validation fail!", errMap)
		return
	}

	supp, err := h.service.Update(uint(id_supplier), req.Npwp, req.SupplierCode, req.SupplierName, req.Email, req.Address, req.City, req.ContactPerson, req.BankAccount, req.Notes, req.StatusSupplier)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to create supplier", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Supplier created successfully!", supp)
}

func (h *Handler) Delete(ctx *gin.Context) {
	id_supp, err := strconv.Atoi(ctx.Param("id_supplier"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id supplier!", nil)
		return
	}

	err = h.service.Delete(uint(id_supp))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to delete data supplier!", err.Error())
		return
	}

	response.Success(ctx, http.StatusAccepted, "Deleted data supplier successfully!", nil)
}
