const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// WebSocket
const ws = require("ws");

// Express Connection
const app = express();
const authRouter = require("./rotutes/authentication");

// Port
const port = process.env.PORT || 8081;

// DB Connection
mongoose.connect("mongodb://127.0.0.1:27017/ChartBot").then(res => {
  console.log("DB CONNECTED");
});

//using Routes
app.use("/api", authRouter);

// My Parser's
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
  }),
);

const jwtSecret = process.env.SECRET;

// Fire
const server = app.listen(port);
const wss = new ws.WebSocketServer({ server });

wss.on("connection", (connection, req) => {
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find(str => str.startsWith("token="));
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const { userName, iat } = userData;
          connection.userName = userName;
          connection.iat = iat;
        });
      }
    }
  }
  console.log("wss.clients", wss.clients);

  wss.clients;
});
