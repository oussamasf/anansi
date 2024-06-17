const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const logger = require("../utils/Logger");
const redisService = require("./redisService");
const eventBus = require("../utils/eventBus");
const { EVENT_BUS } = require("../config/constants");

class WebSocketService {
  constructor(cacheService) {
    this.server = null;
    this.cacheService = cacheService;
    eventBus.on(EVENT_BUS.SEND_NOTIFICATION, this.sendMessage.bind(this));
  }

  start(port) {
    this.server = new WebSocket.Server({ port });

    this.server.on("connection", async (ws, req) => {
      const token = this.getTokenFromHeaders(req);

      if (!token) {
        ws.close(1008, "Authentication token is missing");
        return;
      }

      try {
        const { userId } = await this.verifyToken(token);

        await this.cacheService.storeClientConnection(userId);
        logger.info(`Client connected: ${userId}`);

        eventBus.emit(EVENT_BUS.USER_CONNECTED, userId);

        ws.on("message", (message) => {});

        ws.on("close", async () => {
          await this.cacheService.removeClientConnection(userId);
          logger.info(`Client disconnected: ${userId}`);
        });
      } catch (err) {
        ws.close(1008, "Authentication token is invalid");
      }
    });

    logger.info(`WebSocket Server running on port ${port}`);
  }

  getTokenFromHeaders(req) {
    const authHeader = req.headers["sec-websocket-protocol"];
    if (!authHeader) return null;
    return authHeader;
  }

  async sendMessage(userId, message, callback) {
    const wsId = await this.cacheService.getClientConnection(userId);
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

  verifyToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      });
    });
  }
}

module.exports = new WebSocketService(redisService);
