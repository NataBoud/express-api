const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const logger = require('morgan');
const connectDB = require('./db')
const fs = require('fs');
const cors = require('cors');
require("dotenv").config();

const app = express();

connectDB();

// Middleware
app.use(cors()); 

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

const port = 5000;

app.listen(port, () => {
  console.log("API server started on port 5000");
})

module.exports = app;
