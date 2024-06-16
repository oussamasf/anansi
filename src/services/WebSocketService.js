const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const logger = require("../utils/Logger");
const redisService = require("./redisService");
const eventBus = require("../utils/eventBus");

class WebSocketService {
  constructor() {
    this.server = null;
    eventBus.on("sendNotification", this.sendMessage.bind(this));
  }

  start(port) {
    this.server = new WebSocket.Server({ port });

    this.server.on("connection", (ws, req) => {
      const token = this.getTokenFromHeaders(req);

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
        await redisService.storeClientConnection(userId);
        logger.info(`Client connected: ${userId}`);

        // Emit userConnected event to handle unread notifications
        eventBus.emit("userConnected", userId);

        ws.on("message", (message) => {
          // Handle incoming messages if needed
        });

        ws.on("close", () => {
          redisService.removeClientConnection(userId);
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

  async sendMessage(userId, message, callback) {
    const wsId = await redisService.getClientConnection(userId);
    let sent = false;
    if (wsId) {
      this.server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ message }));
          sent = true;
        }
      });
    }
    if (callback) {
      callback(sent);
    }
  }
}

module.exports = new WebSocketService();
