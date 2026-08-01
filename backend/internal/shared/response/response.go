package response

import "github.com/gin-gonic/gin"

type APIResponse struct {
	Status  string      `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"datas,omitempty"`
	Error   interface{} `json:"error,omitempty"`
}

func Success(ctx *gin.Context, statusCode int, message string, data interface{}) {
	ctx.JSON(statusCode, APIResponse{
		Status:  "success",
		Message: message,
		Data:    data,
	})
}

func Error(ctx *gin.Context, statusCode int, message string, err interface{}) {
	ctx.JSON(statusCode, APIResponse{
		Status:  "error",
		Message: message,
		Error:   err,
	})
}
