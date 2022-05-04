const express = require("express");
const router = express.Router();

const { generateNonce } = require("siwe");
const { ethers } = require("ethers");
const jwt = require("jsonwebtoken");

const userModel = require("./repository/models");

const signJwt = (user) => {
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  return token;
};
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

router.post("/nonce", async (req, res, next) => {
  const nonce = generateNonce();
  const walletAddress = req.body.walletAddress;

  try {
    await userModel.create(
      { walletAddress, nonce },
      {
        new: true,
        upsert: true, // updates if exist
      }
    );
    res.send(nonce);
  } catch (e) {
    res.status(500).send("An error occured, please contact administrator");
  }
});

router.post("/validate_signature", async (req, res, next) => {
  let walletAddress = req.body.walletAddress;
  const signature = req.body.signature;
  const nonce = req.body.nonce;
  walletAddress = walletAddress.toLowerCase();

  try {
    const signerAddress = ethers.utils.verifyMessage(nonce, signature);
    if (signerAddress.toLocaleLowerCase() !== walletAddress) {
      throw new Error("Signature validation failed");
    }
    const user = await userModel.findOne({ walletAddress, nonce }).lean();
    if (!user) {
      throw new Error("User not found");
    }
    // set jwt to the user's browser cookies
    const token = signJwt(user);
    const secure = process.env.NODE_ENV !== "development";
    res.cookie("token", token, {
      secure,
      httpOnly: true,
      maxAge: 720 * 60 * 60 * 1000, // 30 days
    });
    res.send("success");
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get("/isAuthenticated", authenticateUser, (req, res) => {
  if (req?.walletAddress) {
    res.status(200).send({ walletAddress: req?.walletAddress });
  } else {
    res.status(401).send("nein");
  }
});

module.exports = router;
