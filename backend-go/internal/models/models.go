package models

import (
	"time"

	"gorm.io/gorm"
)

type OnboardingRequest struct {
	ID                  string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	TradingName         string    `gorm:"not null" json:"tradingName"`
	ContactName         string    `gorm:"not null" json:"contactName"`
	ContactEmail        string    `gorm:"not null" json:"contactEmail"`
	ContactPhone        string    `json:"contactPhone"`
	CompanyAddress      string    `gorm:"type:text" json:"companyAddress"`
	Industry            string    `json:"industry"`
	CompanySize         string    `json:"companySize"`
	RequestType         string    `json:"requestType"`
	Region              string    `json:"region"`
	Status              string    `gorm:"default:'New'" json:"status"`
	AssignedTeam        string    `json:"assignedTeam"`
	AssignedUserID      string    `json:"assignedUserId"`
	CompletionPercentage int      `gorm:"default:0" json:"completionPercentage"`
	ReferenceNumber     string    `gorm:"uniqueIndex;not null" json:"referenceNumber"`
	Notes               string    `gorm:"type:text" json:"notes"`
	CreatedAt           time.Time `json:"createdAt"`
	UpdatedAt           time.Time `json:"updatedAt"`
	CreatedBy           string    `json:"createdBy"`
	UpdatedBy           string    `json:"updatedBy"`

	StatusHistory    []StatusHistory  `gorm:"foreignKey:RequestID;constraint:OnDelete:CASCADE" json:"statusHistory,omitempty"`
	TeamAssignments  []TeamAssignment `gorm:"foreignKey:RequestID;constraint:OnDelete:CASCADE" json:"teamAssignments,omitempty"`
}

func (OnboardingRequest) TableName() string {
	return "onboarding_requests"
}

type RoutingRule struct {
	ID          string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	RuleName    string    `gorm:"not null" json:"ruleName"`
	Priority    int       `gorm:"not null" json:"priority"`
	Conditions  string    `gorm:"type:text" json:"conditions"` // JSON stored as text
	AssignedTeam string   `gorm:"not null" json:"assignedTeam"`
	IsActive    bool      `gorm:"default:true" json:"isActive"`
	CreatedAt   time.Time `json:"createdAt"`
}

func (RoutingRule) TableName() string {
	return "routing_rules"
}

type StatusHistory struct {
	ID        string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	RequestID string    `gorm:"not null;index" json:"requestId"`
	OldStatus string    `json:"oldStatus"`
	NewStatus string    `json:"newStatus"`
	ChangedBy string    `json:"changedBy"`
	ChangedAt time.Time `gorm:"default:now()" json:"changedAt"`
	Notes     string    `gorm:"type:text" json:"notes"`
}

func (StatusHistory) TableName() string {
	return "status_history"
}

type TeamAssignment struct {
	ID            string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	RequestID     string    `gorm:"not null;index" json:"requestId"`
	TeamName      string    `gorm:"not null" json:"teamName"`
	AssignedUserID string   `json:"assignedUserId"`
	AssignedAt    time.Time `gorm:"default:now()" json:"assignedAt"`
	Status        string    `gorm:"default:'Pending'" json:"status"`
}

func (TeamAssignment) TableName() string {
	return "team_assignments"
}

