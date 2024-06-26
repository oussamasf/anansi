const Notification = require("../models/Notification");
const redisService = require("./redisService");
const eventBus = require("../utils/eventBus");
const { EVENT_BUS, NOTIFICATION_STATUS } = require("../config/constants");
const User = require("../models/User");

class NotificationService {
  constructor(notificationModel, cacheService) {
    eventBus.on(EVENT_BUS.USER_CONNECTED, this.handleUserConnected.bind(this));
    this.notificationModel = notificationModel;
    this.cacheService = cacheService;
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

    // extract topic from user account
    const user = await User.findOne({ _id: userId });
    if (!user) throw new Error("user not found");

    const sent = await new Promise((resolve) => {
      eventBus.emit(EVENT_BUS.SEND_NOTIFICATION, userId, message, resolve);
    });

    if (sent) {
      notification.status = NOTIFICATION_STATUS.DELIVERED;
    }

    await notification.save();
    await this.cacheService.cacheNotification(notification);
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
    let notifications = await this.cacheService.getCachedNotifications(userId);
    if (!notifications) {
      notifications = await this.notificationModel.find({ userId }).sort({
        timestamp: -1,
      });
      await this.cacheService.cacheNotification({ userId, notifications });
    }
    return notifications;
  }
}

module.exports = new NotificationService(Notification, redisService);
