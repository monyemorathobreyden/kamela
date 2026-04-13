package loan

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type LoanStatus string

const (
	StatusPending          LoanStatus = "Pending"
	StatusActive           LoanStatus = "Active"
	StatusMissedRepayment LoanStatus = "Missed Repayment"
	StatusPaid             LoanStatus = "Fully Paid"
	StatusRejected         LoanStatus = "Rejected"
)

type Loan struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ClientID      primitive.ObjectID `bson:"client_id" json:"client_id"`
	Principal     float64            `bson:"principal" json:"principal"`
	Interest      float64            `bson:"interest" json:"interest"`
	AdminFee      float64            `bson:"admin_fee" json:"admin_fee"`
	TotalDue      float64            `bson:"total_due" json:"total_due"`
	RepaymentDate time.Time          `bson:"repayment_date" json:"repayment_date"`
	Status        LoanStatus         `bson:"status" json:"status"`
	CreatedAt     time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt     time.Time          `bson:"updated_at" json:"updated_at"`
}
