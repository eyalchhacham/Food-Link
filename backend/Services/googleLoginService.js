const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fetch = require("node-fetch"); // אם לא עובד לך – תריצי: npm install node-fetch

async function loginWithGoogle(accessToken) {
  try {
    console.log(" accessToken:", accessToken);

    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = await response.json();
    console.log("google user details:", profile);

    if (!profile.email) {
      throw new Error("No email received from Google");
    }

    let user = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      console.log("create new user");
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name || "",
          phoneNumber: "",
          password: "GOOGLE_USER", //  זה החלק החדש
        },
      });
    } else {
      console.log("user at database- countinue");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
    };
  } catch (error) {
    console.error("Eroor login google", error.message);
    throw new Error("Google login failed");
  }
}

module.exports = { loginWithGoogle };
