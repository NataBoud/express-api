const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const logger = require('morgan');
const connectDB = require('./db');
const fs = require('fs');
const cors = require('cors');
require("dotenv").config();

const app = express();

// Connect to the database
connectDB();

// Ensure the uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Middleware
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Set view engine (if used)
app.set('view engine', 'jade');

// Routes
app.use('/api', require('./src/routes'));

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

// Start the server
const port = 5000;
app.listen(port, () => {
  console.log(`API server started on port ${port}`);
});

module.exports = app;
