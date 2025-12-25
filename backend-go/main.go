package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"onboarding-backend/internal/config"
	"onboarding-backend/internal/database"
	"onboarding-backend/internal/handlers"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run migrations
	if err := database.Migrate(db); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Initialize handlers
	onboardingHandler := handlers.NewOnboardingHandler(db)

	// Setup router
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Server is running",
		})
	})

	// API routes
	api := r.Group("/api")
	{
		onboarding := api.Group("/onboarding")
		{
			onboarding.POST("", onboardingHandler.CreateRequest)
			onboarding.GET("", onboardingHandler.GetRequests)
			onboarding.GET("/stats", onboardingHandler.GetStats)
			onboarding.GET("/:id", onboardingHandler.GetRequestByID)
			onboarding.PUT("/:id", onboardingHandler.UpdateRequest)
			onboarding.PATCH("/:id/status", onboardingHandler.UpdateStatus)
		}
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

