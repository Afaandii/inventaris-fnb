package ingredients

import (
	"backend/internal/shared/model"
	"backend/pkg/helper"

	"github.com/shopspring/decimal"
)

type ServiceIngredient interface {
	GetAll() ([]model.Ingredients, error)
	GetById(id_ingre uint) (*model.Ingredients, error)
	Create(category_id, unit_id, supplier_id uint, ingre_name, sku, barcode string, min_stok, max_stok, cost_price, average_cost float64, is_perishable bool, shelf_life_day int, status_ingredient string, is_active bool) (*model.Ingredients, error)
	Update(id_ingre, category_id, unit_id, supplier_id uint, ingre_name, sku, barcode string, min_stok, max_stok, cost_price, average_cost float64, is_perishable bool, shelf_life_day int, status_ingredient string, is_active bool) (*model.Ingredients, error)
	Delete(id_ingre uint) error
}

type serviceIngredient struct {
	repo IngredientRepository
}

func NewServiceIngredient(repo IngredientRepository) ServiceIngredient {
	return &serviceIngredient{repo}
}

func (si *serviceIngredient) GetAll() ([]model.Ingredients, error) {
	return si.repo.FindAll()
}

func (si *serviceIngredient) GetById(id_ingre uint) (*model.Ingredients, error) {
	return si.repo.FindById(id_ingre)
}

func (si *serviceIngredient) Create(category_id, unit_id, supplier_id uint, ingre_name, sku, barcode string, min_stok, max_stok, cost_price, average_cost float64, is_perishable bool, shelf_life_day int, status_ingredient string, is_active bool) (*model.Ingredients, error) {
	count, err := si.repo.CountTodayIngredients()
	if err != nil {
		return nil, err
	}

	generatedCode := helper.GenerateCodeIngredient(int(count))

	minStokDec := decimal.NewFromFloat(min_stok)
	maxStokDec := decimal.NewFromFloat(max_stok)
	costPricetokDec := decimal.NewFromFloat(cost_price)
	averageCostStokDec := decimal.NewFromFloat(average_cost)

	ingre := &model.Ingredients{
		CategoryRef:  category_id,
		UnitRef:      unit_id,
		SupplierRef:  &supplier_id,
		IngreCode:    generatedCode,
		IngreName:    ingre_name,
		Sku:          &sku,
		Barcode:      &barcode,
		MinStok:      minStokDec,
		MaxStok:      &maxStokDec,
		CostPrice:    costPricetokDec,
		AverageCost:  averageCostStokDec,
		IsPerishable: is_perishable,
		ShelfLifeDay: &shelf_life_day,
		IsActive:     is_active,
	}

	err = si.repo.Create(ingre)

	return ingre, err
}

func (si *serviceIngredient) Update(id_ingre, category_id, unit_id, supplier_id uint, ingre_name, sku, barcode string, min_stok, max_stok, cost_price, average_cost float64, is_perishable bool, shelf_life_day int, status_ingredient string, is_active bool) (*model.Ingredients, error) {
	ingre, err := si.repo.FindById(id_ingre)
	if err != nil {
		return nil, err
	}

	count, err := si.repo.CountTodayIngredients()
	if err != nil {
		return nil, err
	}

	generatedCode := helper.GenerateCodeIngredient(int(count))

	minStokDec := decimal.NewFromFloat(min_stok)
	maxStokDec := decimal.NewFromFloat(max_stok)
	costPricetokDec := decimal.NewFromFloat(cost_price)
	averageCostStokDec := decimal.NewFromFloat(average_cost)

	ingre.CategoryRef = category_id
	ingre.UnitRef = unit_id
	ingre.SupplierRef = &supplier_id
	ingre.IngreCode = generatedCode
	ingre.IngreName = ingre_name
	ingre.Sku = &sku
	ingre.Barcode = &barcode
	ingre.MinStok = minStokDec
	ingre.MaxStok = &maxStokDec
	ingre.CostPrice = costPricetokDec
	ingre.AverageCost = averageCostStokDec
	ingre.IsPerishable = is_perishable
	ingre.ShelfLifeDay = &shelf_life_day
	ingre.IsActive = is_active

	err = si.repo.Update(ingre)

	return ingre, err
}

func (si *serviceIngredient) Delete(id_ingre uint) error {
	return si.repo.Delete(id_ingre)
}
