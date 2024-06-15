const Notification = require("../models/Notification");
const redisService = require("./redisService");
const webSocketService = require("./webSocketService");

class NotificationService {
  async sendNotification(userId, message) {
    const notification = new Notification({
      userId,
      message,
      status: "sent",
      read: false,
    });

    const sent = webSocketService.sendMessage(userId, message);
    if (sent) {
      notification.status = "delivered";
    }

    await notification.save();
    await redisService.cacheNotification(notification);
    return sent;
  }

  async getUnreadNotifications(userId) {
    return await Notification.find({ userId, status: { $ne: "read" } }).sort({
      timestamp: -1,
    });
  }

  async markNotificationsAsRead(userId) {
    await Notification.updateMany(
      { userId, status: { $ne: "read" } },
      { status: "read" }
    );
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
