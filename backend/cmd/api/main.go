package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"paydayloan/internal/auth"
	"paydayloan/internal/client"
	"paydayloan/internal/loan"
	"paydayloan/internal/worker"
	"paydayloan/pkg/db"
	"paydayloan/pkg/events"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize MongoDB connection
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}
	if err := db.Connect(mongoURI); err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v\n", err)
	}
	defer func() {
		if err := db.Disconnect(); err != nil {
			log.Printf("Error disconnecting from MongoDB: %v\n", err)
		}
	}()

	// Seed default admin user
	auth.SeedAdminUser()

	// Initialize Kafka
	events.InitKafka()

	// Initialise Background Worker context (tied to server lifecycle)
	workerCtx, workerCancel := context.WithCancel(context.Background())
	go worker.StartLoanStatusScheduler(workerCtx)

	// Initialize Gin router
	r := gin.Default()

	// CORS Middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:4200"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With", "Cache-Control", "Accept-Language", "Content-Length"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Setup simple ping route
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	// Static file serving for uploads
	r.Static("/uploads", "./uploads")

	// Auth routes
	authGroup := r.Group("/auth")
	{
		authGroup.POST("/login", auth.Login)
	}

	// User Management (Admin Only)
	userGroup := r.Group("/users")
	userGroup.Use(auth.AuthMiddleware())
	userGroup.Use(auth.RoleMiddleware(auth.RoleAdmin))
	{
		userGroup.GET("/", auth.ListUsers)
		userGroup.POST("/register", auth.Register)
	}

	// Client routes (Requires Auth)
	clientGroup := r.Group("/clients")
	clientGroup.Use(auth.AuthMiddleware())
	clientGroup.Use(auth.RoleMiddleware(auth.RoleAdmin, auth.RoleSupport))
	{
		clientGroup.POST("/upload", client.UploadDocument)
		clientGroup.POST("/", client.CreateClient)
		clientGroup.GET("/:id", client.GetClient)
		clientGroup.GET("/", client.ListClients)
		clientGroup.PUT("/:id", client.UpdateClient)
	}

	// Loan routes (Requires Auth)
	loanGroup := r.Group("/loans")
	loanGroup.Use(auth.AuthMiddleware())
	loanGroup.Use(auth.RoleMiddleware(auth.RoleAdmin, auth.RoleSupport))
	{
		loanGroup.GET("/statistics", loan.GetStatistics)
		loanGroup.POST("/apply", loan.ApplyLoan)
		loanGroup.GET("/", loan.ListLoans)
		loanGroup.PUT("/:id/status", loan.UpdateLoanStatus)
	}

	// Setup Server
	srv := &http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	// Start server in a goroutine so that it doesn't block
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	log.Println("Server started on :8080")

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// The context is used to inform the server it has 5 seconds to finish
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Stop background workers
	workerCancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown: ", err)
	}

	// Close Kafka connection gracefully
	events.Close()

	log.Println("Server exiting")
}
