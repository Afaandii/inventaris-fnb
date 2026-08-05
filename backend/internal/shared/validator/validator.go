package validator

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

func Validate(s interface{}) map[string]string {
	err := validate.Struct(s)
	if err != nil {
		return nil
	}

	errorMessage := make(map[string]string)

	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, fieldError := range validationErrors {
			switch fieldError.Tag() {
			case "required":
				errorMessage[fieldError.Field()] = fmt.Sprintf("Field %s must be filled!", fieldError.Field())
			case "min":
				errorMessage[fieldError.Field()] = fmt.Sprintf("Field %s must be at least %s characters long!", fieldError.Field(), fieldError.Param())
			case "max":
				errorMessage[fieldError.Field()] = fmt.Sprintf("Field %s must be at most %s characters long!", fieldError.Field(), fieldError.Param())
			case "oneof":
				errorMessage[fieldError.Field()] = fmt.Sprintf("Field %s must be one of the following values: %s!", fieldError.Field(), fieldError.Param())
			case "email":
				errorMessage[fieldError.Field()] = fmt.Sprintf("Field %s must be a valid email address!", fieldError.Field())
			case "url":
				errorMessage[fieldError.Field()] = fmt.Sprintf("Field %s must be a valid URL!", fieldError.Field())
			case "time":
				errorMessage[fieldError.Field()] = fmt.Sprintf("Field %s must be a valid time format (HH:mm)!", fieldError.Field())
			case "datetime":
				errorMessage[fieldError.Field()] = fmt.Sprintf("Field %s must match the format %s!", fieldError.Field(), fieldError.Param())
			case "date":
				errorMessage[fieldError.Field()] = fmt.Sprintf("Field %s must be a valid date format (YYYY-MM-DD)!", fieldError.Field())
			case "numeric":
				errorMessage[fieldError.Field()] = fmt.Sprintf("Field %s must contain only numbers!", fieldError.Field())

			case "number":
				errorMessage[fieldError.Field()] = fmt.Sprintf("Field %s must be a valid number!", fieldError.Field())
			default:
				errorMessage[fieldError.Field()] = fmt.Sprintf("Field %s is invalid!", fieldError.Field())
			}
		}
	}
	return errorMessage
}
