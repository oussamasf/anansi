const Notification = require("../models/Notification");
const redisService = require("./RedisService");
const webSocketService = require("./WebSocketService");

class NotificationService {
  async sendNotification(userId, message) {
    const notification = new Notification({ userId, message });
    const sent = webSocketService.sendMessage(userId, message);

    if (sent) {
      notification.status = "delivered";
    }

    await notification.save();
    await redisService.cacheNotification(notification);
    return sent;
  }

  async getNotifications(userId) {
    let notifications = await redisService.getCachedNotifications(userId);
    if (!notifications) {
      notifications = await Notification.find({ userId }).sort({
        timestamp: -1,
      });
      await redisService.cacheNotification({ userId, notifications });
    }
    return notifications;
  }
}

module.exports = new NotificationService();
