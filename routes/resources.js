var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
let connection = require("../database").databaseConnection;

router.get("/databaseName", function (req, res) {
  const jwtToken = req.headers.authorization;
  if (!jwtToken) {
    return res.status(400).send({ error: "No token" });
  }
  jwt.verify(jwtToken, "rsa", (err, decoded) => {
    if (err) {
      return res.status(400).send({ error: err });
    }
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
});

router.get("/tablesNames", function (req, res) {
  const jwtToken = req.headers.authorization;
  if (!jwtToken) {
    return res.status(400).send({ error: "No token" });
  }
  jwt.verify(jwtToken, "rsa", (err, decoded) => {
    if (err) {
      return res.status(400).send({ error: err });
    }
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
});

router.get("/tableValue", function (req, res) {
  const jwtToken = req.headers.authorization;
  if (!jwtToken) {
    return res.status(400).send({ error: "No token" });
  }
  jwt.verify(jwtToken, "rsa", (err, decoded) => {
    if (err) {
      return res.status(400).send({ error: err });
    }
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
});

router.get("/SQLRequest", function (req, res) {
  const jwtToken = req.headers.authorization;
  if (!jwtToken) {
    return res.status(400).send({ error: "No token" });
  }
  jwt.verify(jwtToken, "rsa", (err, decoded) => {
    if (err) {
      return res.status(400).send({ error: err });
    }
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
});

module.exports = router;
