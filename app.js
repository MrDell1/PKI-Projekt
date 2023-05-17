var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("cookie-session");
var fileUpload = require("express-fileupload");
var bodyParser = require("body-parser");
var cors = require("cors");

var authRouter = require("./routes/auth");
var resourcesRoute = require("./routes/resources");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(
  cors({
    origin: ["https://pki-esj4.vercel.app", "http://localhost:5173"],
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({ secret: "secret", resave: true, saveUninitialized: true }));
app.use(fileUpload());

app.use("/auth", authRouter);
app.use("/resources", resourcesRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
