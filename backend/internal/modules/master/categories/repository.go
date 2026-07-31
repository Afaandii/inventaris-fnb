package categories

import (
	"backend/internal/shared/model"

	"gorm.io/gorm"
)

type CategoryRepository interface {
	FindAll() ([]model.Category, error)
	FindById(id uint) (*model.Category, error)
	Create(cat *model.Category) error
	Update(cat *model.Category) error
	Delete(id uint) error
}

type categoryRepository struct{
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) CategoryRepository{
	return &categoryRepository{db}
}

func (req *categoryRepository) FindAll() ([]model.Category, error){
	var data []model.Category
	err := req.db.Find(&data).Error
	return data, err
}

func (req *categoryRepository) FindById(id uint) (*model.Category, error){
	var data model.Category
	err := req.db.First(&data, "id_category=?", id).Error
	if err != nil {
		return nil, err
	}

	return &data, err
}

func (req *categoryRepository) Create(cat *model.Category) error{
	return req.db.Create(cat).Error
}

func (req *categoryRepository) Update(cat *model.Category) error{
	return req.db.Save(cat).Error
}

func (req *categoryRepository) Delete (id uint) error{
	return req.db.Delete(&model.Category{}, "id_category=?", id).Error
}