package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"onboarding-backend/internal/models"
	"gorm.io/gorm"
)

type OnboardingHandler struct {
	db *gorm.DB
}

func NewOnboardingHandler(db *gorm.DB) *OnboardingHandler {
	return &OnboardingHandler{db: db}
}

type CreateRequestInput struct {
	TradingName    string `json:"tradingName" binding:"required"`
	ContactName    string `json:"contactName" binding:"required"`
	ContactEmail   string `json:"contactEmail" binding:"required,email"`
	ContactPhone   string `json:"contactPhone"`
	CompanyAddress string `json:"companyAddress"`
	Industry       string `json:"industry"`
	CompanySize    string `json:"companySize"`
	RequestType    string `json:"requestType"`
	Region         string `json:"region"`
	Notes          string `json:"notes"`
}

type UpdateStatusInput struct {
	Status string `json:"status" binding:"required"`
	Notes  string `json:"notes"`
}

// CreateRequest creates a new onboarding request
func (h *OnboardingHandler) CreateRequest(c *gin.Context) {
	var input CreateRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Validation error", "details": err.Error()})
		return
	}

	// Generate reference number
	referenceNumber := generateReferenceNumber()

	request := models.OnboardingRequest{
		ID:                  uuid.New().String(),
		TradingName:         input.TradingName,
		ContactName:         input.ContactName,
		ContactEmail:        input.ContactEmail,
		ContactPhone:        input.ContactPhone,
		CompanyAddress:      input.CompanyAddress,
		Industry:            input.Industry,
		CompanySize:         input.CompanySize,
		RequestType:         input.RequestType,
		Region:              input.Region,
		Status:              "New",
		CompletionPercentage: 0,
		ReferenceNumber:     referenceNumber,
		Notes:               input.Notes,
		CreatedAt:           time.Now(),
		UpdatedAt:           time.Now(),
	}

	if err := h.db.Create(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to create request"})
		return
	}

	// Trigger routing logic (async)
	go h.routeRequest(request.ID)

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": request})
}

// GetRequests gets all requests with optional filters
func (h *OnboardingHandler) GetRequests(c *gin.Context) {
	var requests []models.OnboardingRequest
	query := h.db.Model(&models.OnboardingRequest{})

	// Apply filters
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if team := c.Query("assignedTeam"); team != "" {
		query = query.Where("assigned_team = ?", team)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("trading_name ILIKE ? OR contact_name ILIKE ? OR contact_email ILIKE ? OR reference_number ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	var total int64
	query.Count(&total)

	query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&requests)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    requests,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (int(total) + limit - 1) / limit,
		},
	})
}

// GetRequestByID gets a single request by ID
func (h *OnboardingHandler) GetRequestByID(c *gin.Context) {
	id := c.Param("id")

	var request models.OnboardingRequest
	if err := h.db.Preload("StatusHistory").Preload("TeamAssignments").
		Where("id = ?", id).First(&request).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Request not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to fetch request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": request})
}

// UpdateRequest updates an existing request
func (h *OnboardingHandler) UpdateRequest(c *gin.Context) {
	id := c.Param("id")

	var input CreateRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Validation error", "details": err.Error()})
		return
	}

	var request models.OnboardingRequest
	if err := h.db.Where("id = ?", id).First(&request).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Request not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to fetch request"})
		return
	}

	// Update fields
	request.TradingName = input.TradingName
	request.ContactName = input.ContactName
	request.ContactEmail = input.ContactEmail
	request.ContactPhone = input.ContactPhone
	request.CompanyAddress = input.CompanyAddress
	request.Industry = input.Industry
	request.CompanySize = input.CompanySize
	request.RequestType = input.RequestType
	request.Region = input.Region
	request.Notes = input.Notes
	request.UpdatedAt = time.Now()

	if err := h.db.Save(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to update request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": request})
}

// UpdateStatus updates the status of a request
func (h *OnboardingHandler) UpdateStatus(c *gin.Context) {
	id := c.Param("id")

	var input UpdateStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Validation error", "details": err.Error()})
		return
	}

	var request models.OnboardingRequest
	if err := h.db.Where("id = ?", id).First(&request).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Request not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to fetch request"})
		return
	}

	oldStatus := request.Status

	// Update status
	request.Status = input.Status
	request.CompletionPercentage = getCompletionPercentage(input.Status)
	request.UpdatedAt = time.Now()

	if err := h.db.Save(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to update status"})
		return
	}

	// Log status change
	statusHistory := models.StatusHistory{
		ID:        uuid.New().String(),
		RequestID: id,
		OldStatus: oldStatus,
		NewStatus: input.Status,
		ChangedBy: c.GetHeader("X-User-ID"), // Or get from auth
		ChangedAt: time.Now(),
		Notes:     input.Notes,
	}
	h.db.Create(&statusHistory)

	c.JSON(http.StatusOK, gin.H{"success": true, "data": request})
}

// GetStats gets statistics about requests
func (h *OnboardingHandler) GetStats(c *gin.Context) {
	var total int64
	h.db.Model(&models.OnboardingRequest{}).Count(&total)

	var statusCounts []struct {
		Status string
		Count  int64
	}
	h.db.Model(&models.OnboardingRequest{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Scan(&statusCounts)

	var teamCounts []struct {
		Team  string
		Count int64
	}
	h.db.Model(&models.OnboardingRequest{}).
		Select("assigned_team as team, COUNT(*) as count").
		Where("assigned_team IS NOT NULL").
		Group("assigned_team").
		Scan(&teamCounts)

	byStatus := make(map[string]int64)
	for _, sc := range statusCounts {
		byStatus[sc.Status] = sc.Count
	}

	byTeam := make(map[string]int64)
	for _, tc := range teamCounts {
		byTeam[tc.Team] = tc.Count
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"total":    total,
			"byStatus": byStatus,
			"byTeam":   byTeam,
		},
	})
}

// Helper functions
func generateReferenceNumber() string {
	now := time.Now()
	dateStr := now.Format("20060102")
	random := uuid.New().String()[:8]
	return "ONB-" + dateStr + "-" + random
}

func getCompletionPercentage(status string) int {
	statusMap := map[string]int{
		"New":           0,
		"Under Review": 25,
		"In Progress":  50,
		"Completed":     100,
		"On Hold":      25,
	}
	if percentage, ok := statusMap[status]; ok {
		return percentage
	}
	return 0
}

func (h *OnboardingHandler) routeRequest(requestID string) {
	var request models.OnboardingRequest
	if err := h.db.Where("id = ?", requestID).First(&request).Error; err != nil {
		return
	}

	assignedTeam := "Sales" // Default

	// Simple routing rules
	if request.Region == "International" {
		assignedTeam = "Sales"
	} else if request.RequestType == "Upgrade" {
		assignedTeam = "Technical"
	} else if request.CompanySize == "Enterprise" {
		assignedTeam = "Accounts"
	}

	// Update request
	request.AssignedTeam = assignedTeam
	request.Status = "Under Review"
	request.CompletionPercentage = 25
	request.UpdatedAt = time.Now()
	h.db.Save(&request)

	// Create team assignment
	teamAssignment := models.TeamAssignment{
		ID:         uuid.New().String(),
		RequestID:  requestID,
		TeamName:   assignedTeam,
		Status:     "Pending",
		AssignedAt: time.Now(),
	}
	h.db.Create(&teamAssignment)
}

