const getGoogleOauthToken =
  require("../utils/getGoogleOauthToken.js").getGoogleOauthToken;
const getGoogleUser = require("../utils/getGoogleUser.js").getGoogleUser;
const jwt = require("jsonwebtoken");
let connection = require("../database").databaseConnection;

const googleOauthHandler = async (req, res, next) => {
  // Get the code from the query
  const code = req.query.code;

  try {
    if (!code) {
      return next(new Error("Authorization code not provided!", 401));
    }

    // Use the code to get the id and access tokens
    const { id_token, access_token } = await getGoogleOauthToken(code);

    // Use the token to get the User
    const { name, verified_email, email } = await getGoogleUser(
      id_token,
      access_token
    );

    // Check if user is verified
    if (!verified_email) {
      return next(new AppError("Google account not verified", 403));
    }

    // Update user if user already exist or create new user
    connection.query(
      ` SELECT customer_id, email, provider FROM customers WHERE customers.email=${connection.escape(
        email
      )}`,
      (err, result) => {
        if (err) {
          return res.status(400).send({ error: err });
        }

        if (!result.length) {
          const nameArray = name.split(" ");
          connection.query(
            `INSERT INTO customers (firstName, lastName, email, provider) VALUES (${connection.escape(
              nameArray[0]
            )},${connection.escape(nameArray[1])}, ${connection.escape(
              email
            )}, 'google')`,
            (err) => {
              if (err) {
                console.log(err);
                throw new Error(err);
              }
            }
          );
          connection.query(
            ` SELECT customer_id, firstName, lastName, email, provider, FROM customers WHERE customers.email=${connection.escape(
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
          if (result[0].provider !== "google") {
            return res.status(400).send({ error: "It's not google account" });
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

exports.googleOauthHandler = googleOauthHandler;
