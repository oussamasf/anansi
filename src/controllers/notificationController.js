const {
  saveNotification,
  getNotifications,
} = require("../services/notificationService");
const logger = require("../utils/logger");

const sendNotification = async (req, res) => {
  const { userId, message } = req.body;
  const client = req.app.get("wsClients").get(userId);

  if (client && client.readyState === client.OPEN) {
    client.send(JSON.stringify({ message }));
    await saveNotification(userId, message);
    res.status(200).send("Notification sent");
  } else {
    res.status(404).send("User not connected");
  }
};

const fetchNotifications = async (req, res) => {
  const { userId } = req.params;
  const notifications = await getNotifications(userId);
  res.json(notifications);
};

module.exports = {
  sendNotification,
  fetchNotifications,
};
