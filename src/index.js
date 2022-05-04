require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");

const api = require("./api");

const boot = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

  const app = express();

  app.use(logger(process.env.NODE_ENV));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, "client/build")));

  app.use("/api", api);

  // start
  const port = process.env.PORT;
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
};

boot();
