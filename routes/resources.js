var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
let connection = require("../database").databaseConnection;

router.get("/public", function (req, res) {
  connection.query("SELECT data FROM publicdata", (err, result) => {
    if (err) {
      return res.status(400).send({ error: err });
    }
    return res.status(200).send({
      user: result,
    });
  });
});

router.get("/user", function (req, res) {
  const jwtToken = req.headers.authorization;
  if (!jwtToken) {
    return res.status(400).send({ error: "No token" });
  }
  jwt.verify(jwtToken, "rsa", (err, decoded) => {
    if (err) {
      return res.status(400).send({ error: err });
    }

    connection.query(
      `SELECT roles.role FROM users LEFT JOIN roles ON roles.idrole = users.role WHERE idusers='${decoded.id}'`,
      (err, result) => {
        if (err) {
          return res.status(400).send({ error: err });
        }

        if (result[0].role !== "user") {
          return res.status(400).send({ error: "No access" });
        }
        connection.query("SELECT data FROM userdata", (err, result) => {
          if (err) {
            return res.status(400).send({ error: err });
          }
          return res.status(200).send({
            user: result,
          });
        });
      }
    );
  });
});

router.get("/admin", function (req, res) {
  const jwtToken = req.headers.authorization;
  if (!jwtToken) {
    return res.status(400).send({ error: "No token" });
  }
  jwt.verify(jwtToken, "rsa", (err, decoded) => {
    if (err) {
      return res.status(400).send({ error: err });
    }

    connection.query(
      `SELECT roles.role FROM users LEFT JOIN roles ON roles.idrole = users.role WHERE idusers='${decoded.id}'`,
      (err, result) => {
        if (err) {
          return res.status(400).send({ error: err });
        }

        if (result[0].role !== "admin") {
          return res.status(400).send({ error: "No access" });
        }
        connection.query("SELECT data FROM admindata", (err, result) => {
          if (err) {
            return res.status(400).send({ error: err });
          }
          connection.query(
            "SELECT idusers, username, email, roles.role, isActive FROM users LEFT JOIN roles ON roles.idrole = users.role",
            (err, listUsers) => {
              if (err) {
                return res.status(400).send({ error: err });
              }
              return res.status(200).send({
                user: result,
                users: listUsers,
              });
            }
          );
        });
      }
    );
  });
});

router.post("/admin/active", function (req, res) {
  const jwtToken = req.headers.authorization;
  if (!jwtToken) {
    return res.status(400).send({ error: "No token" });
  }
  jwt.verify(jwtToken, "rsa", (err, decoded) => {
    if (err) {
      return res.status(400).send({ error: err });
    }

    connection.query(
      `SELECT roles.role FROM users LEFT JOIN roles ON roles.idrole = users.role WHERE idusers='${decoded.id}'`,
      (err, result) => {
        if (err) {
          return res.status(400).send({ error: err });
        }

        if (result[0].role !== "admin") {
          return res.status(400).send({ error: "No access" });
        }
        connection.query(
          `UPDATE lab4.users SET isActive = '1' WHERE (idusers = '${req.body.id}')`,
          (err, result) => {
            console.log(req.body);
            if (err) {
              return res.status(400).send({ error: err });
            }

            return res.status(200).send({});
          }
        );
      }
    );
  });
});

router.post("/admin/deactive", function (req, res) {
  const jwtToken = req.headers.authorization;
  if (!jwtToken) {
    return res.status(400).send({ error: "No token" });
  }
  jwt.verify(jwtToken, "rsa", (err, decoded) => {
    if (err) {
      return res.status(400).send({ error: err });
    }

    connection.query(
      `SELECT roles.role FROM users LEFT JOIN roles ON roles.idrole = users.role WHERE idusers='${decoded.id}'`,
      (err, result) => {
        if (err) {
          return res.status(400).send({ error: err });
        }

        if (result[0].role !== "admin") {
          return res.status(400).send({ error: "No access" });
        }
        connection.query(
          `UPDATE lab4.users SET isActive = '0' WHERE (idusers = '${req.body.id}')`,
          (err, result) => {
            console.log(req.body);
            if (err) {
              return res.status(400).send({ error: err });
            }

            return res.status(200).send({});
          }
        );
      }
    );
  });
});

module.exports = router;
