package auth

import (
	"backend/internal/shared/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	service AuthService
}

func NewAuthHandler(service AuthService) *AuthHandler {
	return &AuthHandler{service}
}

// Login godoc
// @Summary User login
// @Tags Auth
// @Accept json
// @Produce json
// @Param body body LoginRequest true "Login Credentials"
// @Success 200 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Router /api/v1/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Data input login tidak valid.", err.Error())
		return
	}

	result, err := h.service.Login(req, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error(), nil)
		return
	}

	// Simpan JWT ke dalam HttpOnly Cookie
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("access_token", result.Token, result.ExpiresInSecs, "/", "", false, true)

	response.Success(c, http.StatusOK, "Login berhasil.", result.User)
}

// Logout godoc
// @Summary User logout
// @Tags Auth
// @Produce json
// @Success 200 {object} response.APIResponse
// @Router /api/v1/auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	var userID uint
	if val, exists := c.Get("user_id"); exists {
		if uid, ok := val.(uint); ok {
			userID = uid
		}
	}

	_ = h.service.Logout(userID, c.ClientIP(), c.Request.UserAgent())

	// Hapus cookie dengan MaxAge = -1
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("access_token", "", -1, "/", "", false, true)

	response.Success(c, http.StatusOK, "Logout berhasil.", nil)
}

// Me godoc
// @Summary Get current authenticated user profile
// @Tags Auth
// @Produce json
// @Success 200 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Router /api/v1/auth/me [get]
func (h *AuthHandler) Me(c *gin.Context) {
	val, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "Sesi autentikasi tidak ditemukan.", nil)
		return
	}

	userID, ok := val.(uint)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "ID User tidak valid.", nil)
		return
	}

	user, err := h.service.GetMe(userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Berhasil mendapatkan profil user.", user)
}
