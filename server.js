const fs = require("fs");
require("dotenv/config");
const path = require("path");
const http = require("http");
const https = require("https");
const helmet = require("helmet");
const express = require("express");
const passports = require("passport");
const { Strategy } = require("passport-google-oauth20");
const cookieSession = require("cookie-session");

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
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

passports.serializeUser((user, done) => {
  done(null, user.id);
});

passports.deserializeUser((id, done) => {
  done(null, id);
});

const app = express();

app.use(helmet());

app.use(
  cookieSession({
    name: "sessionTest",
    maxAge: 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
  })
);

app.use(passports.initialize());
app.use(passports.session());

const checkedLoggedIn = (req, res, next) => {
  const isLoggedIn = req.isAuthenticated() && req.user;
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
    session: true,
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
