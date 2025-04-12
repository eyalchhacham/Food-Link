const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// Basic route
app.get("/", (req, res) => {
  res.send("Hello from Express + Prisma + PostgreSQL");
});

app.post("/users", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.create({
      data: { password, email },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error creating user" });
  }
});

// Example: Get all users
app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
