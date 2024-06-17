# Anansi

## Overview

Anansi is a backend service designed to send real-time notifications to users via WebSockets. It supports user authentication and delivery/read receipts, ensuring that notifications are sent and acknowledged. The service uses MongoDB for persistent storage and Redis for caching and managing WebSocket connections.

## Features

- User registration and login with JWT authentication
- Real-time notifications via WebSockets
- Delivery and read receipts

## Technologies

- Node.js
- Express.js
- WebSocket
- MongoDB
- Redis
- JWT (JSON Web Tokens)
- Mongoose
- Bcrypt

## Architecture

**Note:** This project emphasizes the functionality of WebSocket notifications rather than the overall API architecture.

The architecture follows a service-oriented approach with the following components:

1. **Controllers**: Handle HTTP-specific logic and delegate business logic to services.
2. **Services**: Encapsulate business logic and can be reused across different parts of the application.
3. **Models**: Define the structure of data in MongoDB using Mongoose.
4. **WebSocketService**: Manages WebSocket connections, message broadcasting, and receipt handling.
5. **RedisService**: Manages caching using Redis.
6. **EventBus**: Decouples services by using an event-driven approach.

## Setup

### Prerequisites

- Node.js (>= 12.x)
- MongoDB
- Redis
- Docker (for running MongoDB and Redis in containers)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/anansi.git
   cd anansi
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure the environment variables:

   ```env
   PORT=4000
   WS_PORT=8080
   MONGODB_URI=mongodb://localhost:27021/notification_service
   JWT_SECRET=your_jwt_secret
   REDIS_URL=redis://localhost:6378
   ```

4. **Using Docker**

   If you prefer to run MongoDB and Redis using Docker, create a `docker-compose.yml` file in the root directory with the following content:

   Create a `.env` file to specify the Docker volume paths:

   ```env
   MONGO_DATA=./data/mongo
   MONGO_DUMP=./data/dump
   REDIS_DATA=./data/redis
   ```

   Start the MongoDB and Redis containers:

   ```bash
   docker-compose up -d
   ```

5. Start the application:

   ```bash
   npm start
   ```

## Usage

### Endpoints

#### Authentication

- **Register**: `POST /api/register`

  - Request Body: `{ "username": "string", "password": "string" }`
  - Response: `{ "success": true, "message": "User registered" }`

- **Login**: `POST /api/login`
  - Request Body: `{ "username": "string", "password": "string" }`
  - Response: `{ "success": true, "token": "jwt_token" }`

#### Notifications

- **Send Notification**: `POST /api/notify`

  - Request Body: `{ "userId": "string", "message": "string" }`
  - Response: `{ "success": true, "message": "Notification sent" }`

- **Fetch Notifications**: `GET /api/notifications/:userId`

  - Response: `[ { "id": "string", "message": "string", "status": "string", "read": "boolean" } ]`

## Postman Collection

You can find a Postman collection to test the API endpoints at the following link:

[Anansi Postman Collection](https://red-flare-724255.postman.co/workspace/1f85727f-f324-439d-991d-12d6b9150dd1)

### Summary

Anansi focuses on providing real-time WebSocket notifications with support for user authentication and delivery/read receipts. The project is designed to be decoupled, with an emphasis on WebSocket functionality over overall API architecture.

