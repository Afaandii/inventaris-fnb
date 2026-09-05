package payments

import (
	"backend/internal/shared/response"
	"backend/internal/shared/validator"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service PaymentService
}

func NewHandler(service PaymentService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	orderIDStr := ctx.DefaultQuery("sales_order_id", "0")
	status := ctx.DefaultQuery("status", "")
	method := ctx.DefaultQuery("method", "")
	provider := ctx.DefaultQuery("provider", "")

	orderID, err := strconv.Atoi(orderIDStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid sales_order_id parameter", err.Error())
		return
	}

	data, err := h.service.GetAll(uint(orderID), status, method, provider)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve payments list!", err.Error())
		return
	}

	response.Success(ctx, http.StatusOK, "Received payments list successfully!", data)
}

func (h *Handler) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id_payment")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid id_payment parameter", err.Error())
		return
	}

	data, err := h.service.GetByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Failed to retrieve payment details by ID!", err.Error())
		return
	}

	if data == nil {
		response.Error(ctx, http.StatusNotFound, "Payment not found!", nil)
		return
	}

	response.Success(ctx, http.StatusOK, "Received payment details by ID successfully!", data)
}

func (h *Handler) Create(ctx *gin.Context) {
	var req CreatePaymentInput

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
		response.Error(ctx, http.StatusInternalServerError, "Failed to create payment!", err.Error())
		return
	}

	response.Success(ctx, http.StatusCreated, "Created payment successfully!", data)
}
