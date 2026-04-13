package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	// In production, these should be securely injected via environment variables.
	AccessTokenSecret  = []byte("super-secret-access-key-here")
	RefreshTokenSecret = []byte("super-secret-refresh-key-here")
)

type Claims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// GenerateTokenPair creates both an short-lived access token and a long-lived refresh token.
func GenerateTokenPair(user *User) (*TokenPair, error) {
	// 1. Access Token
	expirationTimeAccess := time.Now().Add(15 * time.Minute)
	accessClaims := &Claims{
		UserID: user.ID.Hex(),
		Role:   string(user.Role),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTimeAccess),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "payday-auth-service",
		},
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString(AccessTokenSecret)
	if err != nil {
		return nil, fmt.Errorf("failed to sign access token: %w", err)
	}

	// 2. Refresh Token
	expirationTimeRefresh := time.Now().Add(7 * 24 * time.Hour)
	refreshClaims := &Claims{
		UserID: user.ID.Hex(),
		Role:   string(user.Role),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTimeRefresh),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "payday-auth-service",
		},
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString(RefreshTokenSecret)
	if err != nil {
		return nil, fmt.Errorf("failed to sign refresh token: %w", err)
	}

	return &TokenPair{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
	}, nil
}

// ValidateToken parses and validates a standard JWT token.
func ValidateToken(tokenString string, isRefresh bool) (*Claims, error) {
	secret := AccessTokenSecret
	if isRefresh {
		secret = RefreshTokenSecret
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return secret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, fmt.Errorf("invalid token claims")
}
