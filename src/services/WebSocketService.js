const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const logger = require("../utils/Logger");
const notificationService = require("./notificationService");

class WebSocketService {
  constructor() {
    this.server = null;
    this.clients = new Map();
  }

  start(port) {
    this.server = new WebSocket.Server({ port });

    this.server.on("connection", (ws, req) => {
      // const token = this.getTokenFromHeaders(req);
      // TODO from db
      var token = jwt.sign(
        {
          password: "1234567890",
          userId: "1516239022",
          iat: 1516239022,
        },
        JWT_SECRET
      );

      if (!token) {
        ws.close(1008, "Authentication token is missing");
        return;
      }

      jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
          ws.close(1008, "Authentication token is invalid");
          return;
        }

        const userId = decoded.userId;
        this.clients.set(userId, ws);
        logger.info(`Client connected: ${userId}`);

        const unreadNotifications =
          await notificationService.getUnreadNotifications(userId);
        unreadNotifications.forEach((notification) => {
          ws.send(JSON.stringify({ message: notification.message }));
        });

        await notificationService.markNotificationsAsRead(userId);

        ws.on("message", (message) => {});

        ws.on("close", () => {
          this.clients.delete(userId);
          logger.info(`Client disconnected: ${userId}`);
        });
      });
    });

    logger.info(`WebSocket Server running on port ${port}`);
  }

  getTokenFromHeaders(req) {
    const authHeader = req.headers["sec-websocket-protocol"];
    if (!authHeader) {
      return null;
    }
    return authHeader;
  }

  sendMessage(userId, message) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ message }));
      return true;
    }
    return false;
  }
}

module.exports = new WebSocketService();
