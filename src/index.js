const express = require("express");
const { WebSocketServer } = require("ws");
const { PORT, WS_PORT } = require("./config");
const logger = require("./utils/logger");
const notificationController = require("./controllers/notificationController");

const app = express();
app.use(express.json());

// WebSocket Server
const wss = new WebSocketServer({ port: WS_PORT });
const wsClients = new Map();

wss.on("connection", (ws, req) => {
  const userId = req.url.split("/").pop();
  wsClients.set(userId, ws);

  ws.on("close", () => {
    wsClients.delete(userId);
  });
});

app.set("wsClients", wsClients);

// Routes
app.post("/notify", notificationController.sendNotification);
app.get("/notifications/:userId", notificationController.fetchNotifications);

app.listen(PORT, () => {
  logger.info(`Notification Service running on port ${PORT}`);
  logger.info(`WebSocket Server running on port ${WS_PORT}`);
});
