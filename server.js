const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const helmet = require("helmet");
const express = require("express");
require("dotenv/config");

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
};

console.log(config)

const app = express();

app.use(helmet());

const checkedLoggedIn = (req, res, next) => {
  const isLoggedIn = true; //TODO
  if (!isLoggedIn) {
    res.status(401).json({ error: "you must login !" });
  }
  next();
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pulic", "index.html"));
});

app.get("/auth/google", (req, res) => {});

app.get("/auth/google/callback", (req, res) => {});

app.get("/auth/logout", (req, res) => {});

app.get("/secret", checkedLoggedIn, (req, res) => {
  res.send("this is your secret 23 :)");
});

const server = https.createServer(
  {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
  },
  app
);

server.listen(3000, () => {
  console.log("server is run");
});
