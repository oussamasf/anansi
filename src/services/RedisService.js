const redis = require("redis");
const { REDIS_URL } = require("../config");
const logger = require("../utils/Logger");

class RedisService {
  constructor() {
    this.client = redis.createClient({ url: REDIS_URL });
    this.client.on("error", (err) =>
      logger.error(`Redis Client Error: ${err}`)
    );
    this.client.connect();
  }

  async cacheNotification(notification) {
    try {
      const key = `notifications:${notification.userId}`;
      await this.client.set(key, JSON.stringify(notification), { EX: 60 * 5 }); // Cache for 5 minutes
    } catch (error) {
      logger.error(`Error caching notification: ${error}`);
    }
  }

  async getCachedNotifications(userId) {
    try {
      const key = `notifications:${userId}`;
      const data = await this.client.get(key);
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Error fetching cached notifications: ${error}`);
      return null;
    }
  }

  async storeClientConnection(userId) {
    try {
      await this.client.set(`ws:${userId}`, userId);
    } catch (error) {
      logger.error(`Error storing client connection: ${error}`);
    }
  }

  async getClientConnection(userId) {
    try {
      return await this.client.get(`ws:${userId}`);
    } catch (error) {
      logger.error(`Error retrieving client connection: ${error}`);
      return null;
    }
  }

  async removeClientConnection(userId) {
    try {
      await this.client.del(`ws:${userId}`);
    } catch (error) {
      logger.error(`Error removing client connection: ${error}`);
    }
  }
}

module.exports = new RedisService();
