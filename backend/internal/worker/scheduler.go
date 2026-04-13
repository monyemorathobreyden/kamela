package worker

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"

	"paydayloan/internal/loan"
	"paydayloan/pkg/events"
)

// StartLoanStatusScheduler starts a background ticker that checks for missed repayments
// every 24 hours (simulated here with a 1-minute ticker for development/testing).
func StartLoanStatusScheduler(ctx context.Context) {
	ticker := time.NewTicker(1 * time.Minute) // In production: 24 * time.Hour
	defer ticker.Stop()

	log.Println("Loan status scheduler started")

	for {
		select {
		case <-ctx.Done():
			log.Println("Loan status scheduler stopping...")
			return
		case <-ticker.C:
			checkMissedRepayments()
		}
	}
}

func checkMissedRepayments() {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	collection := loan.GetCollection()

	// Find loans that are 'Active' but past their repayment date
	filter := bson.M{
		"status":         loan.StatusActive,
		"repayment_date": bson.M{"$lt": time.Now()},
	}

	update := bson.M{
		"$set": bson.M{
			"status":     loan.StatusMissedRepayment,
			"updated_at": time.Now(),
		},
	}

	result, err := collection.UpdateMany(ctx, filter, update)
	if err != nil {
		log.Printf("Scheduler error: failed to update missed repayments: %v\n", err)
		return
	}

	if result.ModifiedCount > 0 {
		log.Printf("Scheduler: Marked %d loans as Missed Repayment\n", result.ModifiedCount)

		// Create an audit log for the system action
		events.PublishAuditLog(events.AuditLog{
			Action:    "SYSTEM_STATUS_UPDATE",
			EntityID:  "system-scheduler",
			Details:   fmt.Sprintf("Moved %d loans to Missed Repayment status", result.ModifiedCount),
			Timestamp: time.Now().Format(time.RFC3339),
		})
	}
}
