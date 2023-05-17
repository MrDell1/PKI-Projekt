const getGithubOauthToke =
  require("../utils/getGithubOauthToke.js").getGithubOauthToke;
const getGithubUser = require("../utils/getGithubUser.js").getGithubUser;
const jwt = require("jsonwebtoken");
let connection = require("../database").databaseConnection;

const githubOauthHandler = async (req, res, next) => {
  // Get the code from the query
  const code = req.query.code;

  try {
    if (!code) {
      return next(new Error("Authorization code not provided!", 401));
    }

    // Use the code to get the id and access tokens
    const { access_token } = await getGithubOauthToke(code);

    //const has_user_email_scope = scope === "user:email";
    // Use the token to get the User
    const { login, email } = await getGithubUser(access_token);

    // Update user if user already exist or create new user
    connection.query(
      `SELECT idusers, username, email, provider, roles.role FROM users LEFT JOIN roles ON roles.idrole = users.role WHERE users.email=${connection.escape(
        email
      )}`,
      (err, result) => {
        if (err) {
          return res.status(400).send({ error: err });
        }

        if (!result.length) {
          connection.query(
            `INSERT INTO users (username, email, provider) VALUES (${connection.escape(
              login
            )}, ${connection.escape(email)}, 'github')`,
            (err) => {
              if (err) {
                console.log(err);
                return res.status(400).send({
                  error: err,
                });
              }
            }
          );

          connection.query(
            `SELECT idusers, username, email, provider, roles.role FROM users LEFT JOIN roles ON roles.idrole = users.role WHERE users.email=${connection.escape(
              email
            )}`,
            (errSignUp, resultSignUp) => {
              if (errSignUp) {
                throw new Error(errSignUp);
              }

              const token = jwt.sign(
                { id: resultSignUp[0].customer_id },
                "rsa",
                {
                  expiresIn: "1h",
                }
              );
              return res.status(200).send({
                msg: "Logged in!",
                token,
                user: resultSignUp[0],
              });
            }
          );
        } else {
          if (result[0].provider !== "github") {
            return res.status(400).send({ error: "It's not github account" });
          }
          const token = jwt.sign({ id: result[0].customer_id }, "rsa", {
            expiresIn: "1h",
          });
          return res.status(200).send({
            msg: "Logged in!",
            token,
            user: result[0],
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: error });
  }
};

exports.githubOauthHandler = githubOauthHandler;
