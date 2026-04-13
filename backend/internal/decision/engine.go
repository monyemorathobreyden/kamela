package decision

import (
	"paydayloan/internal/client"
)

const (
	BaseScore        = 500
	MaxScore         = 1000
	ApprovalThreshold = 650
)

type DecisionResult struct {
	Approved bool    `json:"approved"`
	Score    int     `json:"score"`
	Reason   string  `json:"reason"`
}

// EvaluateCreditRisk processes dummy socio-economic and geographical points to formulate a credit decision score.
func EvaluateCreditRisk(c *client.Client, requestedAmount float64) DecisionResult {
	score := BaseScore

	// 1. Employment Type Weighting
	switch c.EmploymentType {
	case client.Permanent:
		score += 200
	case client.Contract:
		score += 100
	case client.Temporary:
		score += 30
	case client.Unemployed:
		score -= 150
	}

	// 2. NQF Level (Proxy for socio-economic stability)
	// Example: NQF 1 (+10) -> NQF 10 (+100)
	score += c.NQFLevel * 10

	// 3. Affordability Check (Salary vs Requested Amount)
	// If requested loan is more than 30% of their salary, penalise.
	if c.Salary > 0 {
		ratio := requestedAmount / c.Salary
		if ratio > 0.3 {
			score -= 150
		} else if ratio < 0.1 {
			score += 50
		}
	} else {
		score -= 200
	}

	// 4. Transport Limit Rule (Must not exceed fare * days)
	// This is checked at application level but we reflect general good standing here.
	if c.FareToWorkPerDay > 0 && c.FareToWorkPerDay < 100 {
		score += 20
	}

	// Boundary Constraints
	if score > MaxScore {
		score = MaxScore
	}
	if score < 0 {
		score = 0
	}

	approved := score >= ApprovalThreshold
	reason := "Approved based on socio-economic profile."
	if !approved {
		reason = "Credit score below threshold due to risk profile."
	}

	return DecisionResult{
		Approved: approved,
		Score:    score,
		Reason:   reason,
	}
}
