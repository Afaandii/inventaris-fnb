package auth_test

import (
	"backend/internal/shared/audit_logs"
	"backend/internal/shared/model"
	"backend/pkg/helper"
	"errors"
	"time"

	"gorm.io/gorm"
)

// MockAuthRepository mensimulasikan penyimpanan data user untuk auth
type MockAuthRepository struct {
	Users               map[string]*model.Users // key: lowercase email
	UsersByID           map[uint]*model.Users   // key: id_user
	LastLoginUpdates    map[uint]time.Time
	FindByEmailError    error
	FindByIDError       error
	UpdateLastLoginErr  error
}

func NewMockAuthRepository() *MockAuthRepository {
	return &MockAuthRepository{
		Users:            make(map[string]*model.Users),
		UsersByID:        make(map[uint]*model.Users),
		LastLoginUpdates: make(map[uint]time.Time),
	}
}

func (m *MockAuthRepository) FindByEmail(email string) (*model.Users, error) {
	if m.FindByEmailError != nil {
		return nil, m.FindByEmailError
	}
	user, exists := m.Users[email]
	if !exists {
		return nil, errors.New("record not found")
	}
	return user, nil
}

func (m *MockAuthRepository) FindByID(id uint) (*model.Users, error) {
	if m.FindByIDError != nil {
		return nil, m.FindByIDError
	}
	user, exists := m.UsersByID[id]
	if !exists {
		return nil, errors.New("record not found")
	}
	return user, nil
}

func (m *MockAuthRepository) UpdateLastLogin(id uint, t time.Time) error {
	if m.UpdateLastLoginErr != nil {
		return m.UpdateLastLoginErr
	}
	m.LastLoginUpdates[id] = t
	return nil
}

// MockAuditLogService mensimulasikan pencatatan audit log
type MockAuditLogService struct {
	Entries []auditlogs.AuditLogEntry
	LogError error
}

func NewMockAuditLogService() *MockAuditLogService {
	return &MockAuditLogService{
		Entries: make([]auditlogs.AuditLogEntry, 0),
	}
}

func (m *MockAuditLogService) Log(entry auditlogs.AuditLogEntry) error {
	if m.LogError != nil {
		return m.LogError
	}
	m.Entries = append(m.Entries, entry)
	return nil
}

func (m *MockAuditLogService) LogWithTx(tx *gorm.DB, entry auditlogs.AuditLogEntry) error {
	return m.Log(entry)
}

func (m *MockAuditLogService) GetAll(userID uint, module, action, entityType, startDate, endDate string) ([]model.AuditLogs, error) {
	return nil, nil
}

func (m *MockAuditLogService) GetByID(id uint) (*model.AuditLogs, error) {
	return nil, nil
}

// Helper untuk membuat user aktif dengan field lengkap sesuai model.Users
func createTestUser(id uint, email, rawPassword, status string, isActive bool) *model.Users {
	hashedPassword, _ := helper.HashPassword(rawPassword)
	phone := "081234567890"
	avatar := "https://example.com/avatar.png"
	outletID := uint(1)
	now := time.Now()

	return &model.Users{
		IDUser:      id,
		RoleRef:     1,
		OutletRef:   &outletID,
		Name:        "Test Staff User",
		Username:    "teststaff",
		Email:       email,
		Password:    hashedPassword,
		PhoneNumber: &phone,
		Avatar:      &avatar,
		Status:      status,
		IsActive:    &isActive,
		CreatedAt:   now,
		UpdatedAt:   now,
		Role: model.Roles{
			IDRoles:     1,
			RoleName:    "Staff",
			DisplayName: "Staff Kasir",
		},
	}
}
