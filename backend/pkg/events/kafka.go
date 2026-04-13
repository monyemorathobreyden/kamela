package events

import (
	"context"
	"encoding/json"
	"log"
	"os"

	"github.com/segmentio/kafka-go"
)

var writer *kafka.Writer

type AuditLog struct {
	Action    string `json:"action"`
	EntityID  string `json:"entity_id"`
	Details   string `json:"details"`
	Timestamp string `json:"timestamp"`
}

// InitKafka initializes the Kafka writer
func InitKafka() {
	broker := os.Getenv("KAFKA_BROKER")
	if broker == "" {
		broker = "localhost:9092"
	}

	writer = &kafka.Writer{
		Addr:     kafka.TCP(broker),
		Topic:    "audit-logs",
		Balancer: &kafka.LeastBytes{},
	}
	log.Println("Kafka writer initialized for audit-logs")
}

// PublishAuditLog sends an audit log to Kafka asynchronously
func PublishAuditLog(logEntry AuditLog) {
	if writer == nil {
		log.Println("Warning: Kafka writer not initialized, skipping audit log")
		return
	}

	bytes, err := json.Marshal(logEntry)
	if err != nil {
		log.Printf("Failed to marshal audit log: %v\n", err)
		return
	}

	msg := kafka.Message{
		Key:   []byte(logEntry.EntityID), // Partition by entity ID
		Value: bytes,
	}

	// Publish asynchronously
	go func() {
		err := writer.WriteMessages(context.Background(), msg)
		if err != nil {
			log.Printf("Failed to write to kafka: %v\n", err)
		}
	}()
}

// Close gracefully closes the Kafka writer
func Close() {
	if writer != nil {
		err := writer.Close()
		if err != nil {
			log.Printf("Error closing kafka writer: %v\n", err)
		}
	}
}
