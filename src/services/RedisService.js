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
}

module.exports = new RedisService();
