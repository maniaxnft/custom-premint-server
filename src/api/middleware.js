const jwt = require("jsonwebtoken");

const userModel = require("./repository/models");

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

module.exports = {
  authenticateUser,
};
