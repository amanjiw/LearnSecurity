const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pulic", "index.html"));
});

app.get("/secret", (req, res) => {
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
