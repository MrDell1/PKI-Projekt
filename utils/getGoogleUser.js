async function getGoogleUser(id_token, access_token) {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${id_token}`,
      },
    }
  );
  const result = await response.json();

  if (response.status === 200) {
    return result;
  } else {
    console.log(result.error);
    throw new Error(result.error.message);
  }
}

exports.getGoogleUser = getGoogleUser;
