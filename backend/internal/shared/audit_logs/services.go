package auditlogs

import (
	"backend/internal/shared/model"
	"encoding/json"
	"net/netip"
	"strings"
	"time"

	"gorm.io/gorm"
)

type AuditLogEntry struct {
	UserID      uint        `json:"user_id"`
	Action      string      `json:"action"`
	Module      string      `json:"module"`
	EntityType  string      `json:"entity_type"`
	EntityID    int         `json:"entity_id"`
	Description string      `json:"description"`
	OldValues   interface{} `json:"old_values"`
	NewValues   interface{} `json:"new_values"`
	IPAddress   string      `json:"ip_address"`
	UserAgent   string      `json:"user_agent"`
	RequestID   string      `json:"request_id"`
}

type AuditLogService interface {
	Log(entry AuditLogEntry) error
	LogWithTx(tx *gorm.DB, entry AuditLogEntry) error
	GetAll(userID uint, module, action, entityType, startDate, endDate string) ([]model.AuditLogs, error)
	GetByID(id uint) (*model.AuditLogs, error)
}

type auditLogService struct {
	db   *gorm.DB
	repo AuditLogRepository
}

func NewAuditLogService(db *gorm.DB, repo AuditLogRepository) AuditLogService {
	return &auditLogService{db, repo}
}

var sensitiveKeys = map[string]bool{
	"password":              true,
	"password_confirmation": true,
	"token":                 true,
	"secret":                true,
	"secret_key":            true,
	"api_key":               true,
	"credential":            true,
	"credentials":           true,
}

func (s *auditLogService) sanitizeAndMarshal(data interface{}) string {
	if data == nil {
		return ""
	}

	bytes, err := json.Marshal(data)
	if err != nil {
		return ""
	}

	var rawMap map[string]interface{}
	if err := json.Unmarshal(bytes, &rawMap); err == nil {
		s.maskMap(rawMap)
		cleanedBytes, errClean := json.Marshal(rawMap)
		if errClean == nil {
			return string(cleanedBytes)
		}
	}

	return string(bytes)
}

func (s *auditLogService) maskMap(m map[string]interface{}) {
	for k, v := range m {
		lowerK := strings.ToLower(k)
		if sensitiveKeys[lowerK] {
			m[k] = "******"
			continue
		}
		if childMap, ok := v.(map[string]interface{}); ok {
			s.maskMap(childMap)
		}
	}
}

func (s *auditLogService) parseIP(ipStr string) netip.Addr {
	ipStr = strings.TrimSpace(ipStr)
	if ipStr != "" {
		if addr, err := netip.ParseAddr(ipStr); err == nil {
			return addr
		}
	}
	addr, _ := netip.ParseAddr("127.0.0.1")
	return addr
}

func (s *auditLogService) Log(entry AuditLogEntry) error {
	return s.LogWithTx(s.db, entry)
}

func (s *auditLogService) LogWithTx(tx *gorm.DB, entry AuditLogEntry) error {
	// Cegah infinite loop pencatatan audit log sendiri
	if entry.Module == "audit_logs" {
		return nil
	}

	parsedIP := s.parseIP(entry.IPAddress)

	logRecord := &model.AuditLogs{
		UserRef:     entry.UserID,
		Action:      entry.Action,
		Module:      entry.Module,
		EntityType:  entry.EntityType,
		EntityID:    entry.EntityID,
		Description: entry.Description,
		OldValues:   s.sanitizeAndMarshal(entry.OldValues),
		NewValues:   s.sanitizeAndMarshal(entry.NewValues),
		IpAddress:   parsedIP,
		UserAgent:   entry.UserAgent,
		RequestID:   entry.RequestID,
		CreatedAt:   time.Now(),
	}

	return s.repo.CreateWithTx(tx, logRecord)
}

func (s *auditLogService) GetAll(userID uint, module, action, entityType, startDate, endDate string) ([]model.AuditLogs, error) {
	return s.repo.GetAll(userID, module, action, entityType, startDate, endDate)
}

func (s *auditLogService) GetByID(id uint) (*model.AuditLogs, error) {
	return s.repo.GetByID(id)
}
