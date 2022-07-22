const fs = require("fs");
require("dotenv/config");
const path = require("path");
const http = require("http");
const https = require("https");
const helmet = require("helmet");
const express = require("express");
const passports = require("passport");
const { Strategy } = require("passport-google-oauth20");

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
};

const AUTH_OPTIONS = {
  callbackURL: "/auth/google/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

const verifyCallback = (accessToken, refreshToken, profile, done) => {
  console.log("google profile :", profile);
  done(null, profile);
};

passports.use(new Strategy(AUTH_OPTIONS, verifyCallback));

const app = express();

app.use(helmet());
app.use(passports.initialize());

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

app.get(
  "/auth/google",
  passports.authenticate("google", {
    scope: ["email"],
  })
);

app.get(
  "/auth/google/callback",
  passports.authenticate("google", {
    failureRedirect: "/failure",
    successRedirect: "/",
    session: false,
  }),
  (req, res) => {
    console.log("google call us back");
  }
);

app.get("/auth/logout", (req, res) => {});

app.get("/secret", checkedLoggedIn, (req, res) => {
  res.send("this is your secret 23 :)");
});

app.get("/failure", (req, res) => {
  return res.send("Faild to login :(");
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
