// src/controllers/AuthController.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../config");
const logger = require("../utils/Logger");

class AuthController {
  async register(req, res) {
    try {
      const { username, password } = req.body;
      const user = new User({ username, password });
      await user.save();
      res.status(201).send("User registered");
    } catch (error) {
      logger.error(`Error registering user: ${error}`);
      res.status(500).send("Internal Server Error");
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).send("Invalid username or password");
      }
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token });
    } catch (error) {
      logger.error(`Error logging in: ${error}`);
      res.status(500).send("Internal Server Error");
    }
  }
}

module.exports = new AuthController();
