/* eslint-disable no-console */
require("dotenv-safe").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const api = require("./api/auth");
const oauth = require("./api/oauth");

const initCrons = require("./cron");
const modules = require("./modules");

const boot = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

  const app = express();

  app.use(
    cors({
      credentials: true,
      origin: process.env.CLIENT_URL,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(bodyParser.json());

  app.use("/api", api);
  app.use("/api/oauth", oauth);

  initCrons();
  modules();

  // start
  const port = process.env.PORT;
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
};

boot();
