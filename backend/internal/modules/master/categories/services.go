package categories

import (
	"backend/internal/shared/model"

	"github.com/gosimple/slug"
)

type ServiceCategory interface {
	GetAll() ([]model.Category, error)
	GetById(id uint) (*model.Category, error)
	Create(parent_id uint, category_name, types, description string) (*model.Category, error)
	Update(id_category, parent_id uint, category_name, types, description string) (*model.Category, error)
	Delete(id uint) error
}

type serviceCategory struct {
	repo CategoryRepository
}

func NewServiceRole(repo CategoryRepository) ServiceCategory {
	return &serviceCategory{repo}
}

func (sc *serviceCategory) GetAll() ([]model.Category, error) {
	return sc.repo.FindAll()
}

func (sc *serviceCategory) GetById(id_category uint) (*model.Category, error) {
	return sc.repo.FindById(id_category)
}

func (sc *serviceCategory) Create(parent_id uint, category_name, types, description string) (*model.Category, error) {
	slugged := slug.Make(category_name)

	cat := &model.Category{
		ParentRef:    &parent_id,
		CategoryName: category_name,
		Slug:         slugged,
		Type:         types,
		Description:  description,
	}

	err := sc.repo.Create(cat)
	return cat, err
}

func (sc *serviceCategory) Update(id_category, parent_id uint, category_name, types, description string) (*model.Category, error) {
	cat, err := sc.repo.FindById(id_category)
	if err != nil {
		return nil, err
	}

	slugged := slug.Make(category_name)
	cat.ParentRef = &parent_id
	cat.CategoryName = category_name
	cat.Slug = slugged
	cat.Type = types
	cat.Description = description

	err = sc.repo.Update(cat)
	return cat, err
}

func (sc *serviceCategory) Delete(id uint) error {
	return sc.repo.Delete(id)
}
