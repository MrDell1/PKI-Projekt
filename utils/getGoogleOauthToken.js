require("dotenv").config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;

const getGoogleOauthToken = async (code) => {
  const rootURl = "https://oauth2.googleapis.com/token";
  const options = {
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URL,
    grant_type: "authorization_code",
  };

  const response = await fetch(rootURl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(options),
  });
  const result = await response.json();
  if (response.status === 200) {
    return result;
  } else {
    console.log("Failed to fetch Google Oauth Tokens");
    throw new Error(result.error);
  }
};
exports.getGoogleOauthToken = getGoogleOauthToken;
