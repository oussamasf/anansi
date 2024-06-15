const redis = require("redis");
const logger = require("../utils/logger");
const { REDIS_URL } = require("../config");

const client = redis.createClient({ url: REDIS_URL });

client.on("error", (err) => logger.error(`Redis Client Error: ${err}`));
client.connect();

const saveNotification = async (userId, message) => {
  try {
    await client.lPush(`notifications:${userId}`, message);
  } catch (error) {
    logger.error(`Error saving notification: ${error}`);
  }
};

const getNotifications = async (userId) => {
  try {
    return await client.lRange(`notifications:${userId}`, 0, -1);
  } catch (error) {
    logger.error(`Error fetching notifications: ${error}`);
    return [];
  }
};

module.exports = {
  saveNotification,
  getNotifications,
};
