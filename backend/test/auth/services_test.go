package auth_test

import (
	"backend/internal/modules/auth"
	"os"
	"strings"
	"testing"
)

func init() {
	// Setup JWT_SECRET untuk lingkungan testing jika belum diset
	if os.Getenv("JWT_SECRET") == "" {
		_ = os.Setenv("JWT_SECRET", "unit_test_jwt_secret_key_1234567890")
	}
}

func TestLogin_Success(t *testing.T) {
	mockRepo := NewMockAuthRepository()
	mockAudit := NewMockAuditLogService()
	service := auth.NewAuthService(mockRepo, mockAudit)

	user := createTestUser(10, "admin@example.com", "Secret123!", "active", true)
	mockRepo.Users[user.Email] = user
	mockRepo.UsersByID[user.IDUser] = user

	req := auth.LoginRequest{
		Email:      "admin@example.com",
		Password:   "Secret123!",
		RememberMe: false,
	}

	result, err := service.Login(req, "192.168.1.100", "Mozilla/5.0")
	if err != nil {
		t.Fatalf("Ekspektasi login sukses, tapi dapat error: %v", err)
	}

	if result.Token == "" {
		t.Errorf("Ekspektasi token JWT tidak kosong")
	}

	// 24 jam = 86400 detik
	expectedExpiry := 24 * 3600
	if result.ExpiresInSecs != expectedExpiry {
		t.Errorf("Ekspektasi masa aktif token %d detik, tapi didapat %d", expectedExpiry, result.ExpiresInSecs)
	}

	if result.User.Email != user.Email {
		t.Errorf("Ekspektasi email user %s, tapi didapat %s", user.Email, result.User.Email)
	}
	if result.User.IDUser != user.IDUser {
		t.Errorf("Ekspektasi ID User %d, tapi didapat %d", user.IDUser, result.User.IDUser)
	}
	if result.User.RoleName != "Staff" {
		t.Errorf("Ekspektasi RoleName Staff, tapi didapat %s", result.User.RoleName)
	}

	// Verifikasi UpdateLastLogin dipanggil
	if _, updated := mockRepo.LastLoginUpdates[user.IDUser]; !updated {
		t.Errorf("Ekspektasi repo.UpdateLastLogin dipanggil untuk user ID %d", user.IDUser)
	}

	// Verifikasi Audit Log LOGIN_SUCCESS dicatat
	if len(mockAudit.Entries) == 0 {
		t.Fatalf("Ekspektasi ada entri audit log yang tercatat")
	}
	lastAudit := mockAudit.Entries[len(mockAudit.Entries)-1]
	if lastAudit.Action != "LOGIN_SUCCESS" {
		t.Errorf("Ekspektasi audit action LOGIN_SUCCESS, tapi didapat %s", lastAudit.Action)
	}
	if lastAudit.UserID != user.IDUser {
		t.Errorf("Ekspektasi audit UserID %d, tapi didapat %d", user.IDUser, lastAudit.UserID)
	}
}

func TestLogin_Success_RememberMe(t *testing.T) {
	mockRepo := NewMockAuthRepository()
	mockAudit := NewMockAuditLogService()
	service := auth.NewAuthService(mockRepo, mockAudit)

	user := createTestUser(11, "remember@example.com", "Secret123!", "active", true)
	mockRepo.Users[user.Email] = user
	mockRepo.UsersByID[user.IDUser] = user

	req := auth.LoginRequest{
		Email:      "remember@example.com",
		Password:   "Secret123!",
		RememberMe: true, // Remember Me aktif (14 hari)
	}

	result, err := service.Login(req, "192.168.1.101", "Mozilla/5.0")
	if err != nil {
		t.Fatalf("Ekspektasi login remember_me sukses, tapi dapat error: %v", err)
	}

	// 14 hari = 14 * 24 * 3600 = 1209600 detik
	expectedExpiry := 14 * 24 * 3600
	if result.ExpiresInSecs != expectedExpiry {
		t.Errorf("Ekspektasi masa aktif token remember_me %d detik, tapi didapat %d", expectedExpiry, result.ExpiresInSecs)
	}
}

func TestLogin_Failed_EmailNotFound(t *testing.T) {
	mockRepo := NewMockAuthRepository()
	mockAudit := NewMockAuditLogService()
	service := auth.NewAuthService(mockRepo, mockAudit)

	req := auth.LoginRequest{
		Email:    "unknown@example.com",
		Password: "Password123!",
	}

	result, err := service.Login(req, "192.168.1.102", "Mozilla/5.0")
	if err == nil {
		t.Fatalf("Ekspektasi login gagal untuk email tak terdaftar, tapi sukses")
	}
	if result != nil {
		t.Errorf("Ekspektasi result nil saat gagal login")
	}

	expectedErrMsg := "Email atau password tidak valid."
	if err.Error() != expectedErrMsg {
		t.Errorf("Ekspektasi pesan error generik '%s', tapi didapat '%s'", expectedErrMsg, err.Error())
	}

	// Audit Log harus mencatat LOGIN_FAILED dengan UserID 0
	if len(mockAudit.Entries) == 0 {
		t.Fatalf("Ekspektasi audit log LOGIN_FAILED dicatat")
	}
	lastAudit := mockAudit.Entries[len(mockAudit.Entries)-1]
	if lastAudit.Action != "LOGIN_FAILED" {
		t.Errorf("Ekspektasi audit action LOGIN_FAILED, tapi didapat %s", lastAudit.Action)
	}
	if lastAudit.UserID != 0 {
		t.Errorf("Ekspektasi audit UserID 0 untuk email tidak ditemukan, tapi didapat %d", lastAudit.UserID)
	}
}

func TestLogin_Failed_InactiveOrSuspendedUser(t *testing.T) {
	testCases := []struct {
		name     string
		status   string
		isActive bool
	}{
		{name: "Status Inactive", status: "inactive", isActive: true},
		{name: "Status Suspended", status: "suspended", isActive: true},
		{name: "Status Banned", status: "banned", isActive: true},
		{name: "IsActive False", status: "active", isActive: false},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockRepo := NewMockAuthRepository()
			mockAudit := NewMockAuditLogService()
			service := auth.NewAuthService(mockRepo, mockAudit)

			email := strings.ToLower(tc.name) + "@example.com"
			user := createTestUser(20, email, "Secret123!", tc.status, tc.isActive)
			mockRepo.Users[user.Email] = user

			req := auth.LoginRequest{
				Email:    email,
				Password: "Secret123!",
			}

			result, err := service.Login(req, "192.168.1.103", "Mozilla/5.0")
			if err == nil {
				t.Fatalf("Ekspektasi login gagal untuk user non-aktif (%s), tapi berhasil", tc.name)
			}
			if result != nil {
				t.Errorf("Ekspektasi result bernilai nil")
			}

			// Audit Log LOGIN_FAILED harus tercatat
			if len(mockAudit.Entries) == 0 {
				t.Fatalf("Ekspektasi audit log LOGIN_FAILED dicatat")
			}
			lastAudit := mockAudit.Entries[len(mockAudit.Entries)-1]
			if lastAudit.Action != "LOGIN_FAILED" {
				t.Errorf("Ekspektasi audit action LOGIN_FAILED, tapi didapat %s", lastAudit.Action)
			}
			if lastAudit.UserID != user.IDUser {
				t.Errorf("Ekspektasi audit UserID %d, tapi didapat %d", user.IDUser, lastAudit.UserID)
			}
		})
	}
}

func TestLogin_Failed_WrongPassword(t *testing.T) {
	mockRepo := NewMockAuthRepository()
	mockAudit := NewMockAuditLogService()
	service := auth.NewAuthService(mockRepo, mockAudit)

	user := createTestUser(30, "staff@example.com", "Benar123!", "active", true)
	mockRepo.Users[user.Email] = user

	req := auth.LoginRequest{
		Email:    "staff@example.com",
		Password: "SalahPassword!", // Password sengaja salah
	}

	result, err := service.Login(req, "192.168.1.104", "Mozilla/5.0")
	if err == nil {
		t.Fatalf("Ekspektasi login gagal karena password salah, tapi berhasil")
	}
	if result != nil {
		t.Errorf("Ekspektasi result bernilai nil")
	}

	expectedErrMsg := "Email atau password tidak valid."
	if err.Error() != expectedErrMsg {
		t.Errorf("Ekspektasi pesan error generik '%s', tapi didapat '%s'", expectedErrMsg, err.Error())
	}

	// Audit Log LOGIN_FAILED harus tercatat
	if len(mockAudit.Entries) == 0 {
		t.Fatalf("Ekspektasi audit log LOGIN_FAILED dicatat")
	}
	lastAudit := mockAudit.Entries[len(mockAudit.Entries)-1]
	if lastAudit.Action != "LOGIN_FAILED" {
		t.Errorf("Ekspektasi audit action LOGIN_FAILED, tapi didapat %s", lastAudit.Action)
	}
}

func TestLogout_Success(t *testing.T) {
	mockRepo := NewMockAuthRepository()
	mockAudit := NewMockAuditLogService()
	service := auth.NewAuthService(mockRepo, mockAudit)

	userID := uint(50)
	err := service.Logout(userID, "192.168.1.105", "Mozilla/5.0")
	if err != nil {
		t.Fatalf("Ekspektasi logout berhasil, error: %v", err)
	}

	if len(mockAudit.Entries) == 0 {
		t.Fatalf("Ekspektasi audit log LOGOUT dicatat")
	}
	lastAudit := mockAudit.Entries[len(mockAudit.Entries)-1]
	if lastAudit.Action != "LOGOUT" {
		t.Errorf("Ekspektasi action LOGOUT, tapi didapat %s", lastAudit.Action)
	}
	if lastAudit.UserID != userID {
		t.Errorf("Ekspektasi UserID %d, tapi didapat %d", userID, lastAudit.UserID)
	}
}

func TestLogout_ZeroUserID(t *testing.T) {
	mockRepo := NewMockAuthRepository()
	mockAudit := NewMockAuditLogService()
	service := auth.NewAuthService(mockRepo, mockAudit)

	// Jika userID 0, fungsi tidak mencatat audit log tetapi tidak mengembalikan error
	err := service.Logout(0, "192.168.1.105", "Mozilla/5.0")
	if err != nil {
		t.Fatalf("Ekspektasi logout aman walau userID 0, error: %v", err)
	}

	if len(mockAudit.Entries) != 0 {
		t.Errorf("Ekspektasi tidak ada audit log dicatat jika userID 0")
	}
}

func TestGetMe_Success(t *testing.T) {
	mockRepo := NewMockAuthRepository()
	mockAudit := NewMockAuditLogService()
	service := auth.NewAuthService(mockRepo, mockAudit)

	user := createTestUser(42, "me@example.com", "Password123!", "active", true)
	mockRepo.UsersByID[user.IDUser] = user

	me, err := service.GetMe(user.IDUser)
	if err != nil {
		t.Fatalf("Ekspektasi GetMe sukses, tapi dapat error: %v", err)
	}

	if me.IDUser != user.IDUser {
		t.Errorf("Ekspektasi IDUser %d, tapi didapat %d", user.IDUser, me.IDUser)
	}
	if me.Email != user.Email {
		t.Errorf("Ekspektasi Email %s, tapi didapat %s", user.Email, me.Email)
	}
	if me.Username != user.Username {
		t.Errorf("Ekspektasi Username %s, tapi didapat %s", user.Username, me.Username)
	}
	if me.RoleName != "Staff" {
		t.Errorf("Ekspektasi RoleName Staff, tapi didapat %s", me.RoleName)
	}
}

func TestGetMe_UserNotFound(t *testing.T) {
	mockRepo := NewMockAuthRepository()
	mockAudit := NewMockAuditLogService()
	service := auth.NewAuthService(mockRepo, mockAudit)

	me, err := service.GetMe(9999) // ID yang tidak ada
	if err == nil {
		t.Fatalf("Ekspektasi GetMe gagal saat user tidak ditemukan, tapi sukses")
	}
	if me != nil {
		t.Errorf("Ekspektasi me bernilai nil saat user tidak ditemukan")
	}
	if err.Error() != "User tidak ditemukan." {
		t.Errorf("Ekspektasi pesan 'User tidak ditemukan.', tapi didapat '%s'", err.Error())
	}
}
