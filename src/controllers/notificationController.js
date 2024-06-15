const notificationService = require("../services/notificationService");
const logger = require("../utils/Logger");
class NotificationController {
  constructor() {}
  async sendNotification(req, res) {
    const { userId, message } = req.body;
    try {
      const sent = await notificationService.sendNotification(userId, message);

      if (sent) {
        res.status(200).send("Notification sent");
      } else {
        res.status(404).send("User not connected");
      }
    } catch (error) {
      logger.error(`Error sending notification: ${error}`);
      res.status(500).send("Internal Server Error");
    }
  }

  async fetchNotifications(req, res) {
    const { userId } = req.params;
    try {
      const notifications = await notificationService.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      logger.error(`Error fetching notifications: ${error}`);
      res.status(500).send("Internal Server Error");
    }
  }
}

module.exports = new NotificationController();
