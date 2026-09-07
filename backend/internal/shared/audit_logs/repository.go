package auditlogs

import (
	"backend/internal/shared/model"
	"errors"

	"gorm.io/gorm"
)

type AuditLogRepository interface {
	CreateWithTx(tx *gorm.DB, log *model.AuditLogs) error
	GetAll(userID uint, module, action, entityType, startDate, endDate string) ([]model.AuditLogs, error)
	GetByID(id uint) (*model.AuditLogs, error)
}

type auditLogRepository struct {
	db *gorm.DB
}

func NewAuditLogRepository(db *gorm.DB) AuditLogRepository {
	return &auditLogRepository{db}
}

func (r *auditLogRepository) CreateWithTx(tx *gorm.DB, log *model.AuditLogs) error {
	return tx.Create(log).Error
}

func (r *auditLogRepository) GetAll(userID uint, module, action, entityType, startDate, endDate string) ([]model.AuditLogs, error) {
	var data []model.AuditLogs
	query := r.db.Preload("User")

	if userID > 0 {
		query = query.Where("user_id = ?", userID)
	}
	if module != "" {
		query = query.Where("module = ?", module)
	}
	if action != "" {
		query = query.Where("action = ?", action)
	}
	if entityType != "" {
		query = query.Where("entity_type = ?", entityType)
	}
	if startDate != "" {
		query = query.Where("DATE(created_at) >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("DATE(created_at) <= ?", endDate)
	}

	err := query.Order("id_audit_log DESC").Find(&data).Error
	return data, err
}

func (r *auditLogRepository) GetByID(id uint) (*model.AuditLogs, error) {
	var data model.AuditLogs
	err := r.db.Preload("User").First(&data, "id_audit_log = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}
