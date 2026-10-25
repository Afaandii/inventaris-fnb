package master_test

import (
	"backend/internal/shared/model"
	"errors"
)

// ==========================
// Mock Category Repository
// ==========================
type MockCategoryRepository struct {
	Items     map[uint]*model.Category
	FindErr   error
	CreateErr error
	UpdateErr error
	DeleteErr error
}

func NewMockCategoryRepository() *MockCategoryRepository {
	return &MockCategoryRepository{Items: make(map[uint]*model.Category)}
}

func (m *MockCategoryRepository) FindAll() ([]model.Category, error) {
	if m.FindErr != nil {
		return nil, m.FindErr
	}
	var res []model.Category
	for _, v := range m.Items {
		res = append(res, *v)
	}
	return res, nil
}

func (m *MockCategoryRepository) FindById(id uint) (*model.Category, error) {
	if m.FindErr != nil {
		return nil, m.FindErr
	}
	item, ok := m.Items[id]
	if !ok {
		return nil, errors.New("category not found")
	}
	return item, nil
}

func (m *MockCategoryRepository) Create(cat *model.Category) error {
	if m.CreateErr != nil {
		return m.CreateErr
	}
	cat.IDCategory = uint(len(m.Items) + 1)
	m.Items[cat.IDCategory] = cat
	return nil
}

func (m *MockCategoryRepository) Update(cat *model.Category) error {
	if m.UpdateErr != nil {
		return m.UpdateErr
	}
	m.Items[cat.IDCategory] = cat
	return nil
}

func (m *MockCategoryRepository) Delete(id uint) error {
	if m.DeleteErr != nil {
		return m.DeleteErr
	}
	delete(m.Items, id)
	return nil
}

// ==========================
// Mock Role Repository
// ==========================
type MockRoleRepository struct {
	Items     map[uint]*model.Roles
	FindErr   error
	CreateErr error
	UpdateErr error
	DeleteErr error
}

func NewMockRoleRepository() *MockRoleRepository {
	return &MockRoleRepository{Items: make(map[uint]*model.Roles)}
}

func (m *MockRoleRepository) FindAll() ([]model.Roles, error) {
	if m.FindErr != nil {
		return nil, m.FindErr
	}
	var res []model.Roles
	for _, v := range m.Items {
		res = append(res, *v)
	}
	return res, nil
}

func (m *MockRoleRepository) FindById(id uint) (*model.Roles, error) {
	if m.FindErr != nil {
		return nil, m.FindErr
	}
	item, ok := m.Items[id]
	if !ok {
		return nil, errors.New("role not found")
	}
	return item, nil
}

func (m *MockRoleRepository) Create(role *model.Roles) error {
	if m.CreateErr != nil {
		return m.CreateErr
	}
	role.IDRoles = uint(len(m.Items) + 1)
	m.Items[role.IDRoles] = role
	return nil
}

func (m *MockRoleRepository) Update(role *model.Roles) error {
	if m.UpdateErr != nil {
		return m.UpdateErr
	}
	m.Items[role.IDRoles] = role
	return nil
}

func (m *MockRoleRepository) Delete(id uint) error {
	if m.DeleteErr != nil {
		return m.DeleteErr
	}
	delete(m.Items, id)
	return nil
}

// ==========================
// Mock Outlet Repository
// ==========================
type MockOutletRepository struct {
	Items     map[uint]*model.Outlets
	FindErr   error
	CreateErr error
	UpdateErr error
	DeleteErr error
	TodayCount int64
}

func NewMockOutletRepository() *MockOutletRepository {
	return &MockOutletRepository{Items: make(map[uint]*model.Outlets)}
}

func (m *MockOutletRepository) GetAll() ([]model.Outlets, error) {
	if m.FindErr != nil {
		return nil, m.FindErr
	}
	var res []model.Outlets
	for _, v := range m.Items {
		res = append(res, *v)
	}
	return res, nil
}

func (m *MockOutletRepository) GetById(id uint) (*model.Outlets, error) {
	if m.FindErr != nil {
		return nil, m.FindErr
	}
	item, ok := m.Items[id]
	if !ok {
		return nil, errors.New("outlet not found")
	}
	return item, nil
}

func (m *MockOutletRepository) Create(out *model.Outlets) error {
	if m.CreateErr != nil {
		return m.CreateErr
	}
	out.IDOutlet = uint(len(m.Items) + 1)
	m.Items[out.IDOutlet] = out
	return nil
}

func (m *MockOutletRepository) Update(out *model.Outlets) error {
	if m.UpdateErr != nil {
		return m.UpdateErr
	}
	m.Items[out.IDOutlet] = out
	return nil
}

func (m *MockOutletRepository) Delete(id uint) error {
	if m.DeleteErr != nil {
		return m.DeleteErr
	}
	delete(m.Items, id)
	return nil
}

func (m *MockOutletRepository) CountTodayOutlets() (int64, error) {
	return m.TodayCount, nil
}

// ==========================
// Mock Supplier Repository
// ==========================
type MockSupplierRepository struct {
	Items     map[uint]*model.Suppliers
	FindErr   error
	CreateErr error
	UpdateErr error
	DeleteErr error
	TodayCount int64
}

func NewMockSupplierRepository() *MockSupplierRepository {
	return &MockSupplierRepository{Items: make(map[uint]*model.Suppliers)}
}

func (m *MockSupplierRepository) GetAll() ([]model.Suppliers, error) {
	if m.FindErr != nil {
		return nil, m.FindErr
	}
	var res []model.Suppliers
	for _, v := range m.Items {
		res = append(res, *v)
	}
	return res, nil
}

func (m *MockSupplierRepository) GetById(id uint) (*model.Suppliers, error) {
	if m.FindErr != nil {
		return nil, m.FindErr
	}
	item, ok := m.Items[id]
	if !ok {
		return nil, errors.New("supplier not found")
	}
	return item, nil
}

func (m *MockSupplierRepository) Create(supplier *model.Suppliers) error {
	if m.CreateErr != nil {
		return m.CreateErr
	}
	supplier.IDSupplier = uint(len(m.Items) + 1)
	m.Items[supplier.IDSupplier] = supplier
	return nil
}

func (m *MockSupplierRepository) Update(supplier *model.Suppliers) error {
	if m.UpdateErr != nil {
		return m.UpdateErr
	}
	m.Items[supplier.IDSupplier] = supplier
	return nil
}

func (m *MockSupplierRepository) Delete(id uint) error {
	if m.DeleteErr != nil {
		return m.DeleteErr
	}
	delete(m.Items, id)
	return nil
}

func (m *MockSupplierRepository) CountTodaySuppliers() (int64, error) {
	return m.TodayCount, nil
}

// ==========================
// Mock Unit Repository
// ==========================
type MockUnitRepository struct {
	Items     map[uint]*model.Units
	FindErr   error
	CreateErr error
	UpdateErr error
	DeleteErr error
	TodayCount int64
}

func NewMockUnitRepository() *MockUnitRepository {
	return &MockUnitRepository{Items: make(map[uint]*model.Units)}
}

func (m *MockUnitRepository) GetAll() ([]model.Units, error) {
	if m.FindErr != nil {
		return nil, m.FindErr
	}
	var res []model.Units
	for _, v := range m.Items {
		res = append(res, *v)
	}
	return res, nil
}

func (m *MockUnitRepository) GetById(id uint) (*model.Units, error) {
	if m.FindErr != nil {
		return nil, m.FindErr
	}
	item, ok := m.Items[id]
	if !ok {
		return nil, errors.New("unit not found")
	}
	return item, nil
}

func (m *MockUnitRepository) Create(units *model.Units) error {
	if m.CreateErr != nil {
		return m.CreateErr
	}
	units.IDUnit = uint(len(m.Items) + 1)
	m.Items[units.IDUnit] = units
	return nil
}

func (m *MockUnitRepository) Update(units *model.Units) error {
	if m.UpdateErr != nil {
		return m.UpdateErr
	}
	m.Items[units.IDUnit] = units
	return nil
}

func (m *MockUnitRepository) Delete(id uint) error {
	if m.DeleteErr != nil {
		return m.DeleteErr
	}
	delete(m.Items, id)
	return nil
}

func (m *MockUnitRepository) CountTodayUnits() (int64, error) {
	return m.TodayCount, nil
}

// ==========================
// Mock Wirehouse Repository
// ==========================
type MockWirehouseRepository struct {
	Items     map[uint]*model.Wirehouse
	FindErr   error
	CreateErr error
	UpdateErr error
	DeleteErr error
	TodayCount int64
}

func NewMockWirehouseRepository() *MockWirehouseRepository {
	return &MockWirehouseRepository{Items: make(map[uint]*model.Wirehouse)}
}

func (m *MockWirehouseRepository) GetAll() ([]model.Wirehouse, error) {
	if m.FindErr != nil {
		return nil, m.FindErr
	}
	var res []model.Wirehouse
	for _, v := range m.Items {
		res = append(res, *v)
	}
	return res, nil
}

func (m *MockWirehouseRepository) GetById(id uint) (*model.Wirehouse, error) {
	if m.FindErr != nil {
		return nil, m.FindErr
	}
	item, ok := m.Items[id]
	if !ok {
		return nil, errors.New("wirehouse not found")
	}
	return item, nil
}

func (m *MockWirehouseRepository) Create(wire *model.Wirehouse) error {
	if m.CreateErr != nil {
		return m.CreateErr
	}
	wire.IDWirehouse = uint(len(m.Items) + 1)
	m.Items[wire.IDWirehouse] = wire
	return nil
}

func (m *MockWirehouseRepository) Update(wire *model.Wirehouse) error {
	if m.UpdateErr != nil {
		return m.UpdateErr
	}
	m.Items[wire.IDWirehouse] = wire
	return nil
}

func (m *MockWirehouseRepository) Delete(id uint) error {
	if m.DeleteErr != nil {
		return m.DeleteErr
	}
	delete(m.Items, id)
	return nil
}

func (m *MockWirehouseRepository) CountTodayWirehouses() (int64, error) {
	return m.TodayCount, nil
}

// ==========================
// Mock Ingredient Repository
// ==========================
type MockIngredientRepository struct {
	Items     map[uint]*model.Ingredients
	FindErr   error
	CreateErr error
	UpdateErr error
	DeleteErr error
	TodayCount int64
}

func NewMockIngredientRepository() *MockIngredientRepository {
	return &MockIngredientRepository{Items: make(map[uint]*model.Ingredients)}
}

func (m *MockIngredientRepository) FindAll() ([]model.Ingredients, error) {
	if m.FindErr != nil {
		return nil, m.FindErr
	}
	var res []model.Ingredients
	for _, v := range m.Items {
		res = append(res, *v)
	}
	return res, nil
}

func (m *MockIngredientRepository) FindById(id uint) (*model.Ingredients, error) {
	if m.FindErr != nil {
		return nil, m.FindErr
	}
	item, ok := m.Items[id]
	if !ok {
		return nil, errors.New("ingredient not found")
	}
	return item, nil
}

func (m *MockIngredientRepository) Create(ingre *model.Ingredients) error {
	if m.CreateErr != nil {
		return m.CreateErr
	}
	ingre.IDIngredient = uint(len(m.Items) + 1)
	m.Items[ingre.IDIngredient] = ingre
	return nil
}

func (m *MockIngredientRepository) Update(ingre *model.Ingredients) error {
	if m.UpdateErr != nil {
		return m.UpdateErr
	}
	m.Items[ingre.IDIngredient] = ingre
	return nil
}

func (m *MockIngredientRepository) Delete(id uint) error {
	if m.DeleteErr != nil {
		return m.DeleteErr
	}
	delete(m.Items, id)
	return nil
}

func (m *MockIngredientRepository) CountTodayIngredients() (int64, error) {
	return m.TodayCount, nil
}

// ==========================
// Mock User Repository
// ==========================
type MockUserRepository struct {
	Items     map[uint]*model.Users
	FindErr   error
	CreateErr error
	UpdateErr error
	DeleteErr error
}

func NewMockUserRepository() *MockUserRepository {
	return &MockUserRepository{Items: make(map[uint]*model.Users)}
}

func (m *MockUserRepository) FindAll() ([]model.Users, error) {
	if m.FindErr != nil {
		return nil, m.FindErr
	}
	var res []model.Users
	for _, v := range m.Items {
		res = append(res, *v)
	}
	return res, nil
}

func (m *MockUserRepository) FindById(id uint) (*model.Users, error) {
	if m.FindErr != nil {
		return nil, m.FindErr
	}
	item, ok := m.Items[id]
	if !ok {
		return nil, errors.New("user not found")
	}
	return item, nil
}

func (m *MockUserRepository) Create(usr *model.Users) error {
	if m.CreateErr != nil {
		return m.CreateErr
	}
	usr.IDUser = uint(len(m.Items) + 1)
	m.Items[usr.IDUser] = usr
	return nil
}

func (m *MockUserRepository) Update(usr *model.Users) error {
	if m.UpdateErr != nil {
		return m.UpdateErr
	}
	m.Items[usr.IDUser] = usr
	return nil
}

func (m *MockUserRepository) Delete(id uint) error {
	if m.DeleteErr != nil {
		return m.DeleteErr
	}
	delete(m.Items, id)
	return nil
}
