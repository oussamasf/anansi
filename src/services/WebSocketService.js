const { WebSocketServer } = require("ws");
const logger = require("../utils/Logger");

class WebSocketService {
  constructor() {
    this.clients = new Map();
  }

  start(port) {
    this.wss = new WebSocketServer({ port });
    this.wss.on("connection", (ws, req) => {
      const userId = req.url.split("/").pop();
      this.clients.set(userId, ws);

      ws.on("close", () => {
        this.clients.delete(userId);
      });
    });

    logger.info(`WebSocket Server running on port ${port}`);
  }

  sendMessage(userId, message) {
    const client = this.clients.get(userId);
    if (client && client.readyState === client.OPEN) {
      client.send(JSON.stringify({ message }));
      return true;
    }
    return false;
  }
}

module.exports = new WebSocketService();
