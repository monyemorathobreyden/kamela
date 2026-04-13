# Payday Loan Management System

A full-stack web application for managing payday loans. Features comprehensive client management, document processing, robust form validations, and an admin-only feature set with loan statistics dashboards.

## Technology Stack

- **Backend**: Go with Kafka for event streaming and MongoDB for data storage
- **Frontend**: Angular 17+ with Tailwind CSS
- **Infrastructure**: Containerized using Docker Compose

## Quick Start

### Prerequisites
Make sure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

### Starting the Application

1. Clone the repository and navigate into the root directory:
```bash
git clone https://github.com/monyemorathobreyden/kamela.git
cd kamela
```

2. Start all services using Docker Compose:
```bash
docker-compose up -d --build
```
This will pull the required images, build the custom frontend and backend images, and start the necessary containers (MongoDB, Kafka, Backend, Frontend).

3. Access the application:
- **Frontend App**: [http://localhost:4200](http://localhost:4200)
- **Backend API**: [http://localhost:8080](http://localhost:8080)

### Stopping / Restarting
To stop the application:
```bash
docker-compose down
```

To view logs:
```bash
docker-compose logs -f
```
