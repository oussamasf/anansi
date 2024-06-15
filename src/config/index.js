require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 4000,
  WS_PORT: process.env.WS_PORT || 8080,
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || "my-very-secret-key",
};
