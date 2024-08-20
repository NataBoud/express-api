const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const logger = require('morgan');
const fs = require('fs');
const mongoose = require('mongoose');
require("dotenv").config();

const app = express();
const mongoURI = process.env.DATABASE_URL;

mongoose.connect(mongoURI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Erreur de connexion à MongoBD"));
db.once("open", async () => {
  console.log("Connected to MongoBD");
});

app.use(logger('dev'));
// Middleware to parse JSON bodies
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'jade');
app.use('/uploads', express.static('uploads'));

app.use('/api', require('./src/routes'));

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
