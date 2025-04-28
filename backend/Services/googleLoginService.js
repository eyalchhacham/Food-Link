const { OAuth2Client } = require('google-auth-library');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const client = new OAuth2Client();

/**
 * מאמת את טוקן הגוגל ויוצר/מאחזר משתמש
 * @param {string} accessToken
 */
async function loginWithGoogle(accessToken) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: accessToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name;

    if (!email) {
      throw new Error("No email found in Google account");
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          phoneNumber: "",
        },
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
    };
  } catch (error) {
    console.error("Error in Google Login Service:", error);
    throw new Error("Google login failed");
  }
}

module.exports = { loginWithGoogle };
