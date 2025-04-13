const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello from Express + Prisma + PostgreSQL");
});

app.post("/users", async (req, res) => {
  const data = req.body;

  try {
    const user = await prisma.user.create({
      data,
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error creating user" });
  }
});
app.put("/users/:id", async (req, res) => {
  const { id } = req.params; 
  const data = req.body; 

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) }, 
      data,
    });
    res.json(updatedUser); 
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Error updating user" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Internal server error" });
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
