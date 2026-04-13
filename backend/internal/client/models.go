package client

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Coordinates struct {
	Latitude  float64 `bson:"latitude" json:"latitude"`
	Longitude float64 `bson:"longitude" json:"longitude"`
}

type EmploymentType string

const (
	Permanent EmploymentType = "Permanent"
	Temporary EmploymentType = "Temporary"
	Contract  EmploymentType = "Contract"
	Unemployed EmploymentType = "Unemployed"
)

// Client represents a borrower in the system.
type Client struct {
	ID                     primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FirstName              string             `bson:"first_name" json:"first_name"`
	LastName               string             `bson:"last_name" json:"last_name"`
	IdentityNumber         string             `bson:"identity_number" json:"identity_number"` // Unique ID
	HomeCoordinates        Coordinates        `bson:"home_coordinates" json:"home_coordinates"`
	WorkCoordinates        Coordinates        `bson:"work_coordinates" json:"work_coordinates"`
	WorkplaceAddress       string             `bson:"workplace_address" json:"workplace_address"`
	EmploymentType         EmploymentType     `bson:"employment_type" json:"employment_type"`
	NQFLevel               int                `bson:"nqf_level" json:"nqf_level"` // 1-10
	Salary                 float64            `bson:"salary" json:"salary"`
	FareToWorkPerDay       float64            `bson:"fare_to_work_per_day" json:"fare_to_work_per_day"`
	AlternativeContactName string             `bson:"alt_contact_name" json:"alt_contact_name"`
	AlternativeContactNum  string             `bson:"alt_contact_num" json:"alt_contact_num"`
	IdentityDocURL         string             `bson:"identity_doc_url" json:"identity_doc_url"`
	SalaryAdviceURL        string             `bson:"salary_advice_url" json:"salary_advice_url"`
	SelfieURL              string             `bson:"selfie_url" json:"selfie_url"`
	CreatedAt              time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt              time.Time          `bson:"updated_at" json:"updated_at"`
}
