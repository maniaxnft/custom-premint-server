require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const logger = require("morgan");

const indexRouter = require("./src/index");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "client/build")));

app.use("/api", indexRouter);

// start
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

module.exports = app;
