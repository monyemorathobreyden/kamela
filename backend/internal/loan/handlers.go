package loan

import (
	"context"
	"math"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"paydayloan/internal/client"
	"paydayloan/internal/decision"
	"paydayloan/pkg/db"
)

func GetCollection() *mongo.Collection {
	return db.Client.Database("paydayloan").Collection("loans")
}

type ApplyLoanRequest struct {
	ClientID      string  `json:"client_id" binding:"required"`
	Principal     float64 `json:"principal" binding:"required,gt=0"`
	RepaymentDate string  `json:"repayment_date" binding:"required"` // Format: YYYY-MM-DD
}

// ApplyLoan handles loan creation with transport fare rules and credit decision checks.
func ApplyLoan(c *gin.Context) {
	var req ApplyLoanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	clientID, err := primitive.ObjectIDFromHex(req.ClientID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid client ID"})
		return
	}

	repaymentDate, err := time.Parse("2006-01-02", req.RepaymentDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid repayment date format, use YYYY-MM-DD"})
		return
	}

	if repaymentDate.Before(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "repayment date must be in the future"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. Fetch Client Profile
	var borrower client.Client
	err = client.GetCollection().FindOne(ctx, bson.M{"_id": clientID}).Decode(&borrower)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "client not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error fetching client"})
		return
	}

	// 2. Transport Fare Constraint
	daysUntilRepayment := repaymentDate.Sub(time.Now()).Hours() / 24
	maxAllowedAmount := borrower.FareToWorkPerDay * math.Ceil(daysUntilRepayment)

	if req.Principal > maxAllowedAmount {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":              "loan principal exceeds the transport fare restriction",
			"max_allowed_amount": maxAllowedAmount,
			"requested_amount":   req.Principal,
		})
		return
	}

	// 3. Credit Decision Engine
	decisionResult := decision.EvaluateCreditRisk(&borrower, req.Principal)
	if !decisionResult.Approved {
		// Store rejected loan history
		storeLoan(ctx, clientID, req.Principal, repaymentDate, StatusRejected)
		c.JSON(http.StatusForbidden, gin.H{
			"error":    "loan application rejected by credit decision engine",
			"decision": decisionResult,
		})
		return
	}

	// 4. Calculate Interest & Admin Fees
	// Flat 10% interest for payday loans, $50 admin fee
	interest := req.Principal * 0.10
	adminFee := 50.00
	totalDue := req.Principal + interest + adminFee

	loan := storeLoan(ctx, clientID, req.Principal, repaymentDate, StatusActive)
	loan.Interest = interest
	loan.AdminFee = adminFee
	loan.TotalDue = totalDue

	// Update DB with calculated fees
	_, err = GetCollection().UpdateOne(ctx, bson.M{"_id": loan.ID}, bson.M{"$set": loan})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to finalise loan record"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "loan approved securely",
		"decision": decisionResult,
		"loan":     loan,
	})
}

// storeLoan creates the initial loan document
func storeLoan(ctx context.Context, clientID primitive.ObjectID, principal float64, repaymentDate time.Time, status LoanStatus) Loan {
	loan := Loan{
		ID:            primitive.NewObjectID(),
		ClientID:      clientID,
		Principal:     principal,
		RepaymentDate: repaymentDate,
		Status:        status,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}
	GetCollection().InsertOne(ctx, loan)
	return loan
}

// ListLoans fetches all loans or filters by client ID
func ListLoans(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{}
	if clientID := c.Query("client_id"); clientID != "" {
		id, err := primitive.ObjectIDFromHex(clientID)
		if err == nil {
			filter["client_id"] = id
		}
	}

	cursor, err := GetCollection().Find(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	defer cursor.Close(ctx)

	var loans []Loan
	if err = cursor.All(ctx, &loans); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode loans"})
		return
	}

	c.JSON(http.StatusOK, loans)
}

// UpdateLoanStatus allows admin or system workers to change a loan status
func UpdateLoanStatus(c *gin.Context) {
	idParam := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid loan ID"})
		return
	}

	var req struct {
		Status LoanStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{"$set": bson.M{
		"status":     req.Status,
		"updated_at": time.Now(),
	}}

	result, err := GetCollection().UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update loan status"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "loan not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "loan status updated to " + string(req.Status)})
}

// GetStatistics returns monthly loan statistics
func GetStatistics(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Aggregate by month using CreatedAt
	// We want: month, total borrowed (Principal), total repaid (TotalDue where status is Fully Paid)
	pipeline := mongo.Pipeline{
		{{Key: "$project", Value: bson.M{
			"month":     bson.M{"$dateToString": bson.M{"format": "%Y-%m", "date": "$created_at"}},
			"principal": 1,
			"total_due": 1,
			"status":    1,
		}}},
		{{Key: "$group", Value: bson.M{
			"_id":            "$month",
			"total_borrowed": bson.M{"$sum": "$principal"},
			"count_borrowed": bson.M{"$sum": 1},
			"total_repaid": bson.M{"$sum": bson.M{
				"$cond": []interface{}{
					bson.M{"$eq": []interface{}{"$status", StatusPaid}},
					"$total_due",
					0,
				},
			}},
			"count_repaid": bson.M{"$sum": bson.M{
				"$cond": []interface{}{
					bson.M{"$eq": []interface{}{"$status", StatusPaid}},
					1,
					0,
				},
			}},
		}}},
		{{Key: "$sort", Value: bson.M{"_id": -1}}}, // Newest first
	}

	cursor, err := GetCollection().Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to aggregate statistics: " + err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var stats []bson.M
	if err = cursor.All(ctx, &stats); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode statistics"})
		return
	}

	c.JSON(http.StatusOK, stats)
}
