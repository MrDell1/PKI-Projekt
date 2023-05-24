var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
let connection = require("../database").databaseConnection;

router.get("/databaseName", function (req, res) {
  connection.query("SELECT DATABASE() AS `Name`", (err, result) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ error: err });
    }
    console.log(result[0].Name);
    return res.status(200).send({
      name: result[0].Name,
    });
  });
});

router.get("/tablesNames", function (req, res) {
  connection.query(
    "SELECT TABLE_NAME AS `tableName` FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()",
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(400).send({ error: err });
      }
      console.log(result);
      return res.status(200).send(result);
    }
  );
});

router.get("/tableValue", function (req, res) {
  const tableName = req.query.tableName;
  connection.query(`SELECT * FROM ${tableName}`, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ error: err.sqlMessage });
    }
    console.log(result);
    return res.status(200).send(result);
  });
});

router.get("/SQLRequest", function (req, res) {
  const request = req.query.request;
  connection.query(`${request}`, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ error: err.sqlMessage });
    }
    console.log(result);
    return res.status(200).send(result);
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
