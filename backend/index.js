const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const app = express();
const prisma = new PrismaClient();
const { Storage } = require("@google-cloud/storage");
const storage = new Storage({
  keyFilename: "./googleCloudStorage.json",
});
const { getCoordinates } = require("./Services/geolocationService"); // Import the geolocation service
// Assumes GOOGLE_APPLICATION_CREDENTIALS is set
const bucketName = "foodlink-uploads"; // Replace with your Google Cloud Storage bucket name

app.use(express.json());
app.use(cors());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

app.post("/api/geolocation", async (req, res) => {
  const { address } = req.body;

  try {
    const coordinates = await getCoordinates(address);
    res.json(coordinates);
  } catch (error) {
    console.error("Error in geolocation API:", error.message);
    res.status(500).json({ message: "Failed to fetch coordinates" });
  }
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

// Upload image to Google Cloud Storage and create food donation
app.post("/food-donation", upload.single("image"), async (req, res) => {
  const {
    productName,
    category,
    amount,
    description,
    pickupDate,
    pickupHours,
    expirationDate,
    userId,
    latitude, // Added latitude
    longitude, // Added longitude
  } = req.body;
  

  try {
    let imageUrl = null;

    // Upload image to Google Cloud Storage if an image is provided
    if (req.file) {
      const blob = storage
        .bucket(bucketName)
        .file(`${uuidv4()}-${req.file.originalname}`);

      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      blobStream.on("error", (err) => {
        console.error("Error uploading to GCS:", err);
        res
          .status(500)
          .json({ error: "Error uploading image to Google Cloud Storage" });
      });

      blobStream.on("finish", async () => {
        try {
          // Make the file public
          await blob.makePublic();
          console.log("Image uploaded and made public!");

          imageUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;

          // Save food donation with image URL
          const foodDonation = await prisma.foodDonation.create({
            data: {
              productName,
              category,
              amount: parseFloat(amount),
              description,
              pickupDate: new Date(pickupDate),
              pickupHours,
              expirationDate: new Date(expirationDate),
              image_url: imageUrl,
              latitude: latitude ? parseFloat(latitude) : null, // Save latitude
              longitude: longitude ? parseFloat(longitude) : null, // Save longitude
              userId: parseInt(userId),
            },
          });

          res.json(foodDonation);
        } catch (err) {
          console.error(
            "Error making file public or saving food donation:",
            err
          );
          res
            .status(500)
            .json({
              error: "Error finalizing image upload or creating food donation",
            });
        }
      });

      blobStream.end(req.file.buffer);
    } else {
      // Save food donation without image
      const foodDonation = await prisma.foodDonation.create({
        data: {
          productName,
          category,
          amount: parseFloat(amount),
          description,
          pickupDate: new Date(pickupDate),
          pickupHours,
          expirationDate: new Date(expirationDate),
          latitude: latitude ? parseFloat(latitude) : null, // Save latitude
          longitude: longitude ? parseFloat(longitude) : null, // Save longitude
          userId: parseInt(userId),
        },
      });

      res.json(foodDonation);
    }
  } catch (err) {
    console.error("Error creating food donation:", err);
    res
      .status(500)
      .json({ error: "Error creating food donation in the database" });
  }
});
app.get("/food-donations", async (req, res) => {
  const { searchQuery, category, latitude, longitude, radius } = req.query;

  const categoriesArray = category
    ? category.includes(",")
      ? category.split(",").map((cat) => cat.trim())
      : [category]
    : [];

  try {
    const donations = await prisma.foodDonation.findMany({
      where: {
        AND: [
          searchQuery
            ? {
                OR: [
                  {
                    productName: { contains: searchQuery, mode: "insensitive" },
                  },
                  {
                    description: { contains: searchQuery, mode: "insensitive" },
                  },
                ],
              }
            : {},
          categoriesArray.length > 0
            ? {
                category: {
                  in: categoriesArray,
                },
              }
            : {},
          latitude && longitude
            ? {
                latitude: {
                  gte: parseFloat(latitude) - parseFloat(radius) / 111,
                  lte: parseFloat(latitude) + parseFloat(radius) / 111,
                },
                longitude: {
                  gte: parseFloat(longitude) - parseFloat(radius) / (111 * Math.cos(parseFloat(latitude) * (Math.PI / 180))),
                  lte: parseFloat(longitude) + parseFloat(radius) / (111 * Math.cos(parseFloat(latitude) * (Math.PI / 180))),
                },
              }
            : {},
        ],
      },
    });

    res.json(donations);
  } catch (err) {
    console.error("Error fetching food donations:", err);
    res.status(500).json({ error: "Error fetching food donations" });
  }
});
app.get("/food-donations/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const donation = await prisma.foodDonation.findUnique({
      where: { id: parseInt(id) },
    });

    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.json(donation);
  } catch (err) {
    console.error("Error fetching donation:", err);
    res.status(500).json({ error: "Error fetching donation" });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
