const express = require("express");
const { PORT, WS_PORT } = require("./config");
const logger = require("./utils/Logger");
const connectDB = require("./utils/db");
const notificationController = require("./controllers/NotificationController");
const webSocketService = require("./services/WebSocketService");

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Start WebSocket Server
webSocketService.start(WS_PORT);

// Routes
app.post("/notify", (req, res) =>
  notificationController.sendNotification(req, res)
);
app.get("/notifications/:userId", (req, res) =>
  notificationController.fetchNotifications(req, res)
);

app.listen(PORT, () => {
  logger.info(`Notification Service running on port ${PORT}`);
});
