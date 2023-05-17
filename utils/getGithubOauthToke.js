require("dotenv").config();
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

const getGithubOauthToke = async (code) => {
  const rootURl = "https://github.com/login/oauth/access_token";
  const options = {
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  };

  const queryString = Object.entries(options)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const response = await fetch(`${rootURl}?${queryString}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const result = await response.text();
  const decoded = Object.fromEntries(new URLSearchParams(result).entries());
  console.log(decoded);
  if (response.status === 200) {
    return decoded;
  } else {
    console.log("Failed to fetch Google Oauth Tokens");
    throw new Error(result.error);
  }
};
exports.getGithubOauthToke = getGithubOauthToke;
