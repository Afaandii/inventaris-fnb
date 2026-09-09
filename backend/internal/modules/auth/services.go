package auth

import (
	"backend/internal/shared/audit_logs"
	"backend/internal/shared/middleware"
	"backend/internal/shared/model"
	"backend/pkg/helper"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type LoginRequest struct {
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required"`
	RememberMe bool   `json:"remember_me"`
}

type UserResponse struct {
	IDUser      uint       `json:"id_user"`
	RoleID      uint       `json:"role_id"`
	RoleName    string     `json:"role_name,omitempty"`
	OutletID    *uint      `json:"outlet_id"`
	Name        string     `json:"name"`
	Username    string     `json:"username"`
	Email       string     `json:"email"`
	PhoneNumber *string    `json:"phone_number"`
	Avatar      *string    `json:"avatar"`
	Status      string     `json:"status"`
	IsActive    *bool      `json:"is_active"`
	LastLogin   *time.Time `json:"last_login"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type LoginResult struct {
	User          UserResponse `json:"user"`
	Token         string       `json:"token"`
	ExpiresInSecs int          `json:"expires_in_secs"`
}

type AuthService interface {
	Login(req LoginRequest, ip, userAgent string) (*LoginResult, error)
	Logout(userID uint, ip, userAgent string) error
	GetMe(userID uint) (*UserResponse, error)
}

type authService struct {
	repo         AuthRepository
	auditService auditlogs.AuditLogService
}

func NewAuthService(repo AuthRepository, auditService auditlogs.AuditLogService) AuthService {
	return &authService{
		repo:         repo,
		auditService: auditService,
	}
}

func toUserResponse(user *model.Users) UserResponse {
	return UserResponse{
		IDUser:      user.IDUser,
		RoleID:      user.RoleRef,
		RoleName:    user.Role.RoleName,
		OutletID:    user.OutletRef,
		Name:        user.Name,
		Username:    user.Username,
		Email:       user.Email,
		PhoneNumber: user.PhoneNumber,
		Avatar:      user.Avatar,
		Status:      user.Status,
		IsActive:    user.IsActive,
		LastLogin:   user.LastLogin,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
	}
}

func (s *authService) Login(req LoginRequest, ip, userAgent string) (*LoginResult, error) {
	genericErrMsg := "Email atau password tidak valid."

	// 1. Cari user berdasarkan email
	user, err := s.repo.FindByEmail(strings.TrimSpace(req.Email))
	if err != nil {
		if s.auditService != nil {
			_ = s.auditService.Log(auditlogs.AuditLogEntry{
				UserID:      0,
				Action:      "LOGIN_FAILED",
				Module:      "auth",
				EntityType:  "users",
				EntityID:    0,
				Description: fmt.Sprintf("Percobaan login gagal: Email tidak ditemukan (%s)", req.Email),
				IPAddress:   ip,
				UserAgent:   userAgent,
			})
		}
		return nil, errors.New(genericErrMsg)
	}

	// 2. Periksa status aktif user
	if user.Status != "active" || (user.IsActive != nil && !*user.IsActive) {
		if s.auditService != nil {
			_ = s.auditService.Log(auditlogs.AuditLogEntry{
				UserID:      user.IDUser,
				Action:      "LOGIN_FAILED",
				Module:      "auth",
				EntityType:  "users",
				EntityID:    int(user.IDUser),
				Description: fmt.Sprintf("Percobaan login gagal: Akun tidak aktif (%s)", req.Email),
				IPAddress:   ip,
				UserAgent:   userAgent,
			})
		}
		return nil, errors.New(genericErrMsg)
	}

	// 3. Verifikasi Password hash bcrypt
	if !helper.CheckPassword(req.Password, user.Password) {
		if s.auditService != nil {
			_ = s.auditService.Log(auditlogs.AuditLogEntry{
				UserID:      user.IDUser,
				Action:      "LOGIN_FAILED",
				Module:      "auth",
				EntityType:  "users",
				EntityID:    int(user.IDUser),
				Description: fmt.Sprintf("Percobaan login gagal: Password salah untuk email %s", req.Email),
				IPAddress:   ip,
				UserAgent:   userAgent,
			})
		}
		return nil, errors.New(genericErrMsg)
	}

	// 4. Kalkulasi masa berlaku token (1 hari vs 14 hari)
	expiryDuration := 24 * time.Hour
	if req.RememberMe {
		expiryDuration = 14 * 24 * time.Hour
	}

	// 5. Generate JWT Token
	claims := middleware.JWTClaims{
		UserID: user.IDUser,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "inventaris-fnb",
			Subject:   fmt.Sprintf("%d", user.IDUser),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiryDuration)),
			ID:        uuid.New().String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(middleware.GetJWTSecret())
	if err != nil {
		return nil, errors.New("Gagal membuat token autentikasi.")
	}

	// 6. Update last_login
	now := time.Now()
	_ = s.repo.UpdateLastLogin(user.IDUser, now)
	user.LastLogin = &now

	// 7. Catat Audit Log LOGIN_SUCCESS
	if s.auditService != nil {
		_ = s.auditService.Log(auditlogs.AuditLogEntry{
			UserID:      user.IDUser,
			Action:      "LOGIN_SUCCESS",
			Module:      "auth",
			EntityType:  "users",
			EntityID:    int(user.IDUser),
			Description: fmt.Sprintf("User %s berhasil login", user.Email),
			IPAddress:   ip,
			UserAgent:   userAgent,
		})
	}

	return &LoginResult{
		User:          toUserResponse(user),
		Token:         tokenString,
		ExpiresInSecs: int(expiryDuration.Seconds()),
	}, nil
}

func (s *authService) Logout(userID uint, ip, userAgent string) error {
	if userID != 0 && s.auditService != nil {
		_ = s.auditService.Log(auditlogs.AuditLogEntry{
			UserID:      userID,
			Action:      "LOGOUT",
			Module:      "auth",
			EntityType:  "users",
			EntityID:    int(userID),
			Description: "User berhasil logout",
			IPAddress:   ip,
			UserAgent:   userAgent,
		})
	}
	return nil
}

func (s *authService) GetMe(userID uint) (*UserResponse, error) {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return nil, errors.New("User tidak ditemukan.")
	}
	resp := toUserResponse(user)
	return &resp, nil
}
