require("dotenv").config();
const joi = require("joi");

const envVarsSchema = joi
  .object()
  .keys({
    NODE_ENV: joi
      .string()
      .valid("production", "development", "test")
      .required(),
    PORT: joi.number().positive().default(4000),
    WS_PORT: joi.number().positive().default(8080),
    JWT_SECRET: joi.string().default("my-very-secret-key"),
    REDIS_URL: joi.string().default("redis://localhost:6379"),
    MONGODB_URI: joi.string().required(),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  NODE_ENV: envVars.NODE_ENV,
  PORT: envVars.PORT,
  WS_PORT: envVars.WS_PORT,
  JWT_SECRET: envVars.JWT_SECRET,
  REDIS_URL: envVars.REDIS_URL,
  MONGODB_URI: envVars.MONGODB_URI,
};
