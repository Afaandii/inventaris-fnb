package errors

import "errors"

var (
	ErrNotFound       = errors.New("Not found data!")
	ErrInvalidId      = errors.New("Invalid id!")
	ErrBadRequest     = errors.New("Invalid request!")
	ErrInternalServer = errors.New("Internal server error!")
	ErrUnauthorized   = errors.New("Unauthorized user!")
	ErrForbidden      = errors.New("Forbidden access!")
)
