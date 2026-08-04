package suppliers

import "backend/internal/shared/model"

type ServiceSupplier interface {
	GetAll() ([]model.Suppliers, error)
	GetById(id uint) (*model.Suppliers, error)
	Create(npwp, supplier_code, supplier_name, email, address, city, contact_person, bank_account, notes, status_supplier string) (*model.Suppliers, error)
	Update(id_supplier uint, npwp, supplier_code, supplier_name, email, address, city, contact_person, bank_account, notes, status_supplier string) (*model.Suppliers, error)
	Delete(id uint) error
}

type serviceSupplier struct {
	repo SupplierRepository
}

func NewServiceSupplier(repo SupplierRepository) ServiceSupplier {
	return &serviceSupplier{repo}
}

func (ss *serviceSupplier) GetAll() ([]model.Suppliers, error) {
	return ss.repo.GetAll()
}

func (ss *serviceSupplier) GetById(id_supplier uint) (*model.Suppliers, error) {
	return ss.repo.GetById(id_supplier)
}

func (ss *serviceSupplier) Create(npwp, supplier_code, supplier_name, email, address, city, contact_person, bank_account, notes, status_supplier string) (*model.Suppliers, error) {
	sup := &model.Suppliers{
		Npwp:           &npwp,
		SupplierCode:   supplier_code,
		SupplierName:   supplier_name,
		Email:          email,
		Address:        address,
		City:           city,
		ContactPerson:  &contact_person,
		BankAccount:    bank_account,
		Notes:          notes,
		StatusSupplier: status_supplier,
	}

	err := ss.repo.Create(sup)
	return sup, err
}

func (ss *serviceSupplier) Update(id_supplier uint, npwp, supplier_code, supplier_name, email, address, city, contact_person, bank_account, notes, status_supplier string) (*model.Suppliers, error) {
	sup, err := ss.repo.GetById(id_supplier)
	if err != nil {
		return nil, err
	}

	sup.Npwp = &npwp
	sup.SupplierCode = supplier_code
	sup.SupplierName = supplier_name
	sup.Email = email
	sup.Address = address
	sup.City = city
	sup.ContactPerson = &contact_person
	sup.BankAccount = bank_account
	sup.Notes = notes
	sup.StatusSupplier = status_supplier

	err = ss.repo.Update(sup)
	return sup, err
}

func (ss *serviceSupplier) Delete(id uint) error {
	return ss.repo.Delete(id)
}
