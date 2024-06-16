const Notification = require("../models/Notification");
const redisService = require("./redisService");
const eventBus = require("../utils/eventBus");
const { EVENT_BUS, NOTIFICATION_STATUS } = require("../config/constants");

class NotificationService {
  constructor(notificationModel) {
    eventBus.on(EVENT_BUS.USER_CONNECTED, this.handleUserConnected.bind(this));
    this.notificationModel = notificationModel;
  }

  async handleUserConnected(userId) {
    const unreadNotifications = await this.getUnreadNotifications(userId);
    unreadNotifications.forEach((notification) => {
      eventBus.emit(EVENT_BUS.SEND_NOTIFICATION, userId, notification.message);
    });
    await this.markNotificationsAsRead(userId);
  }

  async sendNotification(userId, message) {
    const notification = new this.notificationModel({
      userId,
      message,
      status: NOTIFICATION_STATUS.SENT,
    });

    const sent = await new Promise((resolve) => {
      eventBus.emit(EVENT_BUS.SEND_NOTIFICATION, userId, message, resolve);
    });

    if (sent) {
      notification.status = NOTIFICATION_STATUS.DELIVERED;
    }

    await notification.save();
    await redisService.cacheNotification(notification);
    return sent;
  }

  async getUnreadNotifications(userId) {
    return await this.notificationModel
      .find({ userId, status: { $ne: NOTIFICATION_STATUS.READ } })
      .sort({
        timestamp: -1,
      });
  }

  async markNotificationsAsRead(userId) {
    await this.notificationModel.updateMany(
      { userId, status: { $ne: NOTIFICATION_STATUS.READ } },
      { status: NOTIFICATION_STATUS.READ }
    );
  }

  async getNotifications(userId) {
    let notifications = await redisService.getCachedNotifications(userId);
    if (!notifications) {
      notifications = await this.notificationModel.find({ userId }).sort({
        timestamp: -1,
      });
      await redisService.cacheNotification({ userId, notifications });
    }
    return notifications;
  }
}

module.exports = new NotificationService(Notification);
