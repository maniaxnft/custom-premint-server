const axios = require("axios");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const userModel = require("./auth/models");

const verifyJwtAndReturnUser = (token) => {
  try {
    const result = jwt.verify(token, process.env.JWT_SECRET);
    return result;
  } catch (e) {
    throw new Error(e);
  }
};

const authenticateUser = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send("Token could not be found");
  }
  try {
    const user = verifyJwtAndReturnUser(token);
    req.walletAddress = user.walletAddress;
    const userInDb = await userModel
      .findOne({ walletAddress: user.walletAddress })
      .lean();
    if (!userInDb) {
      throw new Error("User not found");
    }
    next();
  } catch (e) {
    res.clearCookie("token");
    res.status(401).send(`Unauthenticated`);
  }
};

const checkCaptcha = async (req, res, next) => {
  const captchaToken = req.body?.captchaToken;
  try {
    const res = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${captchaToken}`
    );
    if (res.data?.success) {
      next();
    } else {
      res.status(401).send("Unauthenticated");
    }
  } catch (e) {
    res.status(500).send("Something went wrong");
  }
};

const rateLimiter = rateLimit({
  windowMs: 30 * 1000, // 30 seconds in milliseconds
  max: 10,
  message:
    "You have reached maximum retries. Please try again after 30 seconds",
  statusCode: 429,
  headers: true,
});

module.exports = {
  authenticateUser,
  checkCaptcha,
  rateLimiter,
};
