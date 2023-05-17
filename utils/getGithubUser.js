const getGithubUser = async (access_token) => {
  const response = await fetch(`https://api.github.com/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  const result = await response.json();
  if (response.status !== 200) {
    throw new Error(result.message);
  }

  if (result.email === null) {
    const responseEmail = await fetch(`https://api.github.com/user/emails`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const resultEmail = await responseEmail.json();
    if (responseEmail.status !== 200) {
      throw new Error(result.message);
    }
    result.email = resultEmail[0].email;
  }
  console.log(result);

  return result;
};

exports.getGithubUser = getGithubUser;
