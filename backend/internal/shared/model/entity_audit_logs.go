package model

import (
	"net/netip"
	"time"
)

type AuditLogs struct {
	IDAuditLogs uint       `json:"id_audit_log" gorm:"primaryKey;autoIncrement;column:id_audit_log"`
	UserRef     uint       `json:"user_id" gorm:"column:user_id"`
	Action      string     `json:"action" gorm:"type:varchar(180);column:action"`
	Module      string     `json:"module" gorm:"type:modules;column:module"`
	EntityType  string     `json:"entity_type" gorm:"type:entities_types;column:entity_type"`
	EntityID    int        `json:"entity_id" gorm:"type:int;column:entity_id"`
	Description string     `json:"description" gorm:"type:text;column:description"`
	OldValues   string     `json:"old_values" gorm:"type:text;default:null;column:old_values"`
	NewValues   string     `json:"new_values" gorm:"type:text;column:new_values"`
	IpAddress   netip.Addr `json:"ip_address" gorm:"type:inet;column:ip_address"`
	UserAgent   string     `json:"user_agent" gorm:"type:varchar(255);column:user_agent"`
	RequestID   string     `json:"request_id" gorm:"type:varchar(255);column:request_id"`
	CreatedAt   time.Time  `json:"created_at"`

	User Users `gorm:"foreignKey:UserRef;references:IDUser;constraint:OnUpdate:RESTRICT,OnDelete:CASCADE"`
}

func (AuditLogs) TableName() string {
	return "audit_logs"
}
