const Notification = require("../models/Notification");
const redisService = require("./redisService");
const eventBus = require("../utils/eventBus");

class NotificationService {
  constructor() {
    eventBus.on("userConnected", this.handleUserConnected.bind(this));
  }

  async handleUserConnected(userId) {
    const unreadNotifications = await this.getUnreadNotifications(userId);
    unreadNotifications.forEach((notification) => {
      eventBus.emit("sendNotification", userId, notification.message);
    });
    await this.markNotificationsAsRead(userId);
  }

  async sendNotification(userId, message) {
    const notification = new Notification({
      userId,
      message,
      status: "sent",
      read: false,
    });

    const sent = await new Promise((resolve) => {
      eventBus.emit("sendNotification", userId, message, resolve);
    });

    if (sent) {
      notification.status = "delivered";
    }

    await notification.save();
    await redisService.cacheNotification(notification);
    return sent;
  }

  async getUnreadNotifications(userId) {
    return await Notification.find({ userId, read: false }).sort({
      timestamp: -1,
    });
  }

  async markNotificationsAsRead(userId) {
    await Notification.updateMany({ userId, read: false }, { read: true });
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
