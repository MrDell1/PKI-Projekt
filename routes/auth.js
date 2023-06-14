const { json } = require("express");
var express = require("express");
var router = express.Router();
const { check, body } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const googleOauthHandler =
  require("../controller/googleOauthHandler.js").googleOauthHandler;
let connection = require("../database").databaseConnection;

router.get("/oauth/google", googleOauthHandler);

router.post("/signin", function (req, res, next) {
  check(req.body.email, "Wrong email").isEmail();
  check(req.body.password, "Wrong password").isLength({ min: 2 });
  console.log(req.body);
  connection.query(
    ` SELECT customer_id, first_name, last_name, email, password FROM customers WHERE email=${connection.escape(
      req.body.email
    )}`,
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(400).send(err.sqlMessage);
      }
      if (!result.length) {
        return res.status(401).send({
          error: "Email or password is incorrect!",
        });
      }
      bcrypt.compare(
        req.body.password,
        result[0]["password"],
        (bErr, bResult) => {
          // wrong password
          if (bErr) {
            return res.status(401).send({
              error: bErr,
            });
          }
          if (bResult) {
            console.log(result[0].customer_id);
            const token = jwt.sign({ id: result[0].customer_id }, "rsa", {
              expiresIn: "1h",
            });
            return res.status(200).send({
              msg: "Logged in!",
              token,
              user: result[0],
            });
          }
          return res.status(401).send({
            error: "Username or password is incorrect!",
          });
        }
      );
    }
  );
});

router.post("/signup", function (req, res, next) {
  check(req.body.email, "Wrong email").isEmail();
  check(req.body.password, "Wrong password").isLength({ min: 2 });
  check(req.body.firstName, "Wrong first name").isLength({ min: 1 });
  check(req.body.lastName, "Wrong last name").isLength({ min: 1 });
  console.log(req.body);
  connection.query(
    ` SELECT * FROM customers WHERE email=${connection.escape(req.body.email)}`,
    (err, result) => {
      if (err) {
        return res.status(400).send({ error: err });
      }

      if (result.length) {
        return res.status(401).send({
          error: "This user is already in use!",
        });
      }

      bcrypt.hash(req.body.password, 10, (err, hash) => {
        connection.query(
          `INSERT INTO customers (first_name, last_name, email, password, provider) VALUES (${connection.escape(
            req.body.firstName
          )},${connection.escape(req.body.lastName)}, ${connection.escape(
            req.body.email
          )}, '${hash}', 'local')`,
          (err, result) => {
            if (err) {
              console.log(err);
              return res.status(400).send({
                error: err,
              });
            }

            return res.status(201).send({
              msg: "The user has been registered!",
            });
          }
        );
      });
    }
  );
});
module.exports = router;
