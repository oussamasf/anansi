const express = require("express");
const { PORT, WS_PORT } = require("./config");
const logger = require("./utils/Logger");
const connectDB = require("./utils/db");
const notificationController = require("./controllers/notificationsController");
// const authController = require("./controllers/authController");
const webSocketService = require("./services/webSocketService");

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Start WebSocket Server
webSocketService.start(WS_PORT);

// Authentication routes
// app.post("/register", (req, res) => authController.register(req, res));
// app.post("/login", (req, res) => authController.login(req, res));

// Notification routes (secured)
app.post("/notify", (req, res) =>
  notificationController.sendNotification(req, res)
);
app.get("/notifications/:userId", (req, res) =>
  notificationController.fetchNotifications(req, res)
);

app.listen(PORT, () => {
  logger.info(`Notification Service running on port ${PORT}`);
});
