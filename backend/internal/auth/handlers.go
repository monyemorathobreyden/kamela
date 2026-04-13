package auth

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"

	"paydayloan/pkg/db"
)

// GetCollection returns the auth mongodb collection
func GetCollection() *mongo.Collection {
	return db.Client.Database("paydayloan").Collection("users")
}

// GetTokenCollection returns the refresh token mongodb collection
func GetTokenCollection() *mongo.Collection {
	return db.Client.Database("paydayloan").Collection("refresh_tokens")
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
	Role     Role   `json:"role" binding:"required"`
}

// Register registers a new user (Admin or Support)
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Role != RoleAdmin && req.Role != RoleSupport {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role, must be Admin or Support"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	collection := GetCollection()

	// Check if user exists
	count, err := collection.CountDocuments(ctx, bson.M{"username": req.Username})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "username already exists"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	user := User{
		ID:           primitive.NewObjectID(),
		Username:     req.Username,
		PasswordHash: string(hashedPassword),
		Role:         req.Role,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	_, err = collection.InsertOne(ctx, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
		return
	}

	// Do not return password hash
	c.JSON(http.StatusCreated, user)
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Login authenticates a user and returns a standard JWT token pair.
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	collection := GetCollection()

	var user User
	err := collection.FindOne(ctx, bson.M{"username": req.Username}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	// Generate standard token pair
	tokens, err := GenerateTokenPair(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate tokens"})
		return
	}

	// Store refresh token in db (for revocation)
	tokenRecord := RefreshTokenRecord{
		ID:        primitive.NewObjectID(),
		TokenHint: tokens.RefreshToken[len(tokens.RefreshToken)-8:], // basic hint
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
		Revoked:   false,
	}

	_, err = GetTokenCollection().InsertOne(ctx, tokenRecord)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to store refresh token record"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  tokens.AccessToken,
		"refresh_token": tokens.RefreshToken,
		"user":          user,
	})
}

// SeedAdminUser creates a default admin user if the database is empty
func SeedAdminUser() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := GetCollection()
	count, err := collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		log.Printf("Failed to count users for seeding: %v\n", err)
		return
	}

	if count == 0 {
		log.Println("No users found, seeding default admin...")
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		admin := User{
			ID:           primitive.NewObjectID(),
			Username:     "admin",
			PasswordHash: string(hashedPassword),
			Role:         RoleAdmin,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}
		_, err := collection.InsertOne(ctx, admin)
		if err != nil {
			log.Printf("Failed to seed admin user: %v\n", err)
		} else {
			log.Println("Default admin user created: admin / password123")
		}
	}
}

// ListUsers returns all system users (Admin only)
func ListUsers(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := GetCollection().Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	defer cursor.Close(ctx)

	var users []User
	if err = cursor.All(ctx, &users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode users"})
		return
	}

	c.JSON(http.StatusOK, users)
}
