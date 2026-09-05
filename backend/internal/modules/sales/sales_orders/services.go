package salesorders

import (
	stokbalances "backend/internal/modules/inventory/stok_balances"
	"backend/internal/shared/model"
	"backend/pkg/helper"
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type CreateSalesOrderItemInput struct {
	ProductVariantID uint    `json:"product_variant_id" validate:"required,number,min=1"`
	Quantity         int     `json:"quantity" validate:"required,number,min=1"`
	DiscountAmount   float64 `json:"discount_amount" validate:"omitempty,numeric,min=0"`
	Notes            string  `json:"notes"`
}

type CreateSalesOrderInput struct {
	OutletID       uint                        `json:"outlet_id" validate:"required,number,min=1"`
	TableID        uint                        `json:"table_id"`
	CashierID      uint                        `json:"cashier_id" validate:"required,number,min=1"`
	OrderType      string                      `json:"order_type" validate:"required,oneof=dine_in takeaway"`
	CustomerName   string                      `json:"customer_name"`
	DiscountAmount float64                     `json:"discount_amount" validate:"omitempty,numeric,min=0"`
	TaxAmount      float64                     `json:"tax_amount" validate:"omitempty,numeric,min=0"`
	ServiceCharge  float64                     `json:"service_charge" validate:"omitempty,numeric,min=0"`
	Notes          string                      `json:"notes"`
	Items          []CreateSalesOrderItemInput `json:"items" validate:"required,min=1,dive"`
}

type SalesOrderService interface {
	GetAll(outletID, cashierID, tableID uint, status, paymentStatus, orderType, startDate, endDate string) ([]model.SalesOrders, error)
	GetByID(id uint) (*model.SalesOrders, error)
	Create(input CreateSalesOrderInput) (*model.SalesOrders, error)
	UpdateStatus(id uint, status string, userID uint) (*model.SalesOrders, error)
	CancelOrder(id uint, userID uint) (*model.SalesOrders, error)
}

type salesOrderService struct {
	db             *gorm.DB
	repo           SalesOrderRepository
	balanceService stokbalances.StokBalanceService
}

func NewSalesOrderService(db *gorm.DB, repo SalesOrderRepository, balanceService stokbalances.StokBalanceService) SalesOrderService {
	return &salesOrderService{db, repo, balanceService}
}

func (s *salesOrderService) GetAll(outletID, cashierID, tableID uint, status, paymentStatus, orderType, startDate, endDate string) ([]model.SalesOrders, error) {
	return s.repo.GetAll(outletID, cashierID, tableID, status, paymentStatus, orderType, startDate, endDate)
}

func (s *salesOrderService) GetByID(id uint) (*model.SalesOrders, error) {
	return s.repo.GetByID(id)
}

func (s *salesOrderService) Create(input CreateSalesOrderInput) (*model.SalesOrders, error) {
	var outlet model.Outlets
	if err := s.db.First(&outlet, "id_outlet = ?", input.OutletID).Error; err != nil {
		return nil, errors.New("outlet tidak ditemukan di master data")
	}

	var cashier model.Users
	if err := s.db.First(&cashier, "id_user = ?", input.CashierID).Error; err != nil {
		return nil, errors.New("cashier/user tidak ditemukan di master data")
	}

	var table model.DiningTables
	if input.OrderType == "dine_in" && input.TableID > 0 {
		if err := s.db.First(&table, "id_dining_table = ?", input.TableID).Error; err != nil {
			return nil, errors.New("dining table tidak ditemukan")
		}
		if table.OutletRef != input.OutletID {
			return nil, fmt.Errorf("meja '%s' tidak terdaftar pada outlet '%s'", table.Name, outlet.OutletName)
		}
	} else if input.OrderType == "takeaway" {
		input.TableID = 0
	}

	subtotal := decimal.Zero
	var orderItems []model.SalesOrderItems

	// Validasi item, snapshot harga, dan perhitungan subtotal di backend
	for _, item := range input.Items {
		var variant model.ProductVariants
		if err := s.db.Preload("Product").First(&variant, "id_product_variant = ?", item.ProductVariantID).Error; err != nil {
			return nil, fmt.Errorf("product variant ID %d tidak ditemukan", item.ProductVariantID)
		}

		if !variant.IsActive || !variant.IsAvailable {
			return nil, fmt.Errorf("product variant '%s' sedang tidak aktif atau tidak tersedia", variant.VariantName)
		}

		unitPrice := variant.SellPrice
		qtyDec := decimal.NewFromInt(int64(item.Quantity))
		discountItemDec := decimal.NewFromFloat(item.DiscountAmount)
		totalItemDec := unitPrice.Mul(qtyDec).Sub(discountItemDec)

		if totalItemDec.LessThan(decimal.Zero) {
			totalItemDec = decimal.Zero
		}

		subtotal = subtotal.Add(totalItemDec)

		orderItems = append(orderItems, model.SalesOrderItems{
			ProdVarRef:     variant.IDProductVariant,
			Qty:            item.Quantity,
			UnitPrice:      unitPrice,
			DiscountAmount: discountItemDec,
			TotalAmount:    totalItemDec,
			Notes:          item.Notes,
		})
	}

	discountOrderDec := decimal.NewFromFloat(input.DiscountAmount)
	taxAmountDec := decimal.NewFromFloat(input.TaxAmount)
	serviceChargeDec := decimal.NewFromFloat(input.ServiceCharge)

	totalAmountDec := subtotal.Sub(discountOrderDec).Add(taxAmountDec).Add(serviceChargeDec)
	if totalAmountDec.LessThan(decimal.Zero) {
		totalAmountDec = decimal.Zero
	}

	count, err := s.repo.CountTodayOrders()
	if err != nil {
		return nil, err
	}
	orderNumber := helper.GenerateCodeSalesOrder(int(count))
	queueNumber := helper.GenerateQueueNumber(int(count))

	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	custName := input.CustomerName
	if custName == "" {
		custName = "Guest"
	}

	order := &model.SalesOrders{
		OutletRef:      input.OutletID,
		TableRef:       input.TableID,
		CashierRef:     input.CashierID,
		OrderNumber:    orderNumber,
		OrderType:      input.OrderType,
		OrderDate:      time.Now(),
		CustomerName:   custName,
		QueueNumber:    queueNumber,
		ServiceCharge:  serviceChargeDec,
		StatusOrders:   "confirmed",
		Subtotal:       subtotal,
		DiscountAmount: discountOrderDec,
		TaxAmount:      taxAmountDec,
		TotalAmount:    totalAmountDec,
		PaymentStatus:  "unpaid",
		Notes:          input.Notes,
		SalesOrderItem: orderItems,
	}

	if err := s.repo.CreateWithTx(tx, order); err != nil {
		tx.Rollback()
		return nil, err
	}

	if input.OrderType == "dine_in" && input.TableID > 0 {
		table.StatusTable = "occupied"
		if err := tx.Save(&table).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.repo.GetByID(order.IDSalesOrder)
}

func (s *salesOrderService) UpdateStatus(id uint, status string, userID uint) (*model.SalesOrders, error) {
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	order, err := s.repo.GetByIDWithTx(tx, id)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	if order == nil {
		tx.Rollback()
		return nil, errors.New("sales order tidak ditemukan")
	}

	if order.StatusOrders == "completed" || order.StatusOrders == "cancelled" {
		tx.Rollback()
		return nil, fmt.Errorf("sales order berstatus %s tidak dapat diubah lagi", order.StatusOrders)
	}

	switch status {
	case "draft", "confirmed", "processing", "ready":
		order.StatusOrders = status

	case "completed":
		// 1. Ambil gudang aktif untuk outlet ini
		warehouse, err := s.repo.GetActiveWarehouseByOutletWithTx(tx, order.OutletRef)
		if err != nil {
			tx.Rollback()
			return nil, err
		}

		// 2. Iterasi setiap item pada Sales Order untuk pemotongan stok bahan baku resep
		if warehouse != nil {
			for _, item := range order.SalesOrderItem {
				var variant model.ProductVariants
				if err := tx.First(&variant, "id_product_variant = ?", item.ProdVarRef).Error; err == nil {
					recipe, errRecipe := s.repo.GetActiveRecipeByProductIDWithTx(tx, variant.ProductRef, order.OutletRef)
					if errRecipe == nil && recipe != nil {
						yieldQtyFloat, _ := recipe.YieldQty.Float64()
						if yieldQtyFloat <= 0 {
							yieldQtyFloat = 1.0
						}
						multiplier := float64(item.Qty) / yieldQtyFloat

						for _, recipeItem := range recipe.RecipeItem {
							itemQtyFloat, _ := recipeItem.Quantity.Float64()
							requiredQty := uint(math.Ceil(itemQtyFloat * multiplier))

							if requiredQty > 0 {
								errReduce := s.balanceService.ReduceStock(
									tx,
									recipeItem.IngredientRef,
									warehouse.IDWirehouse,
									requiredQty,
									userID,
									order.IDSalesOrder,
									"sales_order",
									fmt.Sprintf("Konsumsi bahan penjualan %s (Order #%s)", variant.VariantName, order.OrderNumber),
								)
								if errReduce != nil {
									tx.Rollback()
									return nil, fmt.Errorf("gagal memotong stok bahan '%s' untuk penjualan: %v", recipeItem.Ingredient.IngreName, errReduce)
								}
							}
						}
					}
				}
			}
		}

		// 3. Revert meja kembali ke available jika dine in
		if order.TableRef > 0 {
			var table model.DiningTables
			if err := tx.First(&table, "id_dining_table = ?", order.TableRef).Error; err == nil {
				table.StatusTable = "available"
				_ = tx.Save(&table).Error
			}
		}

		order.StatusOrders = "completed"

	case "cancelled":
		if order.TableRef > 0 {
			var table model.DiningTables
			if err := tx.First(&table, "id_dining_table = ?", order.TableRef).Error; err == nil {
				table.StatusTable = "available"
				_ = tx.Save(&table).Error
			}
		}
		order.StatusOrders = "cancelled"
		order.PaymentStatus = "cancelled"

	default:
		tx.Rollback()
		return nil, fmt.Errorf("status order tidak valid: %s", status)
	}

	if err := s.repo.UpdateWithTx(tx, order); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.repo.GetByID(order.IDSalesOrder)
}

func (s *salesOrderService) CancelOrder(id uint, userID uint) (*model.SalesOrders, error) {
	return s.UpdateStatus(id, "cancelled", userID)
}
