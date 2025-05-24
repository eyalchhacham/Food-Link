//נועה התקינה npm install google-auth-library
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
const { getAddressFromCoordinates } = require("./Services/geolocationService");
const bucketName = "foodlink-uploads"; 
const { loginWithGoogle } = require("./Services/googleLoginService"); //  googleLoginService.js מייבא את 

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

app.post("/login/google", async (req, res) => {
  const { access_token } = req.body;

  try {
    const user = await loginWithGoogle(access_token);

    res.json({
      message: "Google login successful",
      user,
    });
  } catch (err) {
    console.error("Error during Google login:", err.message);
    res.status(500).json({ message: err.message });
  }
});



app.post("/users", async (req, res) => {
  const { email, password, name, phoneNumber } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const newUser = await prisma.user.create({
      data: { email, password, name, phoneNumber },
    });

    res.json(newUser);
  } catch (err) {
    console.error("Error creating user:", err);
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

    let address = null;

    // If coordinates are available, fetch the full address
    if (donation.latitude && donation.longitude) {
      try {
        const apiKey = process.env.GOOGLE_GEO_LOCATION; // משתנה סביבה שהגדרת
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${donation.latitude},${donation.longitude}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
          address = data.results[0].formatted_address; // Use the full formatted address
        } else {
          console.warn("Geocoding API returned no results or an error:", data.status);
          address = "Address not found";
        }
      } catch (err) {
        console.warn("Could not get address from coordinates:", err.message);
        address = "Error fetching address";
      }
    } else {
      address = "Coordinates not available";
    }

    // Return the donation details along with the full address
    res.json({
      ...donation,
      address,
    });
  } catch (err) {
    console.error("Error fetching donation:", err);
    res.status(500).json({ error: "Error fetching donation" });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/user-location", async (req, res) => {
  const { userId, latitude, longitude, address } = req.body;

  try {
    // קודם לבדוק אם כבר יש מיקום קיים למשתמש
    const existingLocation = await prisma.UserLocation.findFirst({
      where: { user_id: parseInt(userId) },
    });

    if (existingLocation) {
      // אם יש מיקום ➔ נעדכן אותו
      const updatedLocation = await prisma.UserLocation.update({
        where: { id: existingLocation.id },
        data: {
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          address,
        },
      });
      res.status(200).json(updatedLocation);
    } else {
      // אם אין מיקום ➔ ניצור חדש
      const newLocation = await prisma.UserLocation.create({
        data: {
          user_id: parseInt(userId),
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          address,
        },
      });
      res.status(201).json(newLocation);
    }
  } catch (error) {
    console.error("Error handling user location:", error);
    res.status(500).json({ error: "Failed to handle user location" });
  }
});

app.get("/user-location/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const location = await prisma.UserLocation.findUnique({
      where: {
        user_id: parseInt(userId),
      },
    });

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.json(location);
  } catch (error) {
    console.error("Error fetching user location:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add this endpoint to handle user profile photo uploads
app.post("/upload-profile-image", upload.single("image"), async (req, res) => {
  const { userId } = req.body;

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

          // Update the user's profile image URL in the database
          const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { image_url: imageUrl },
          });

          res.json({
            message: "Profile image uploaded successfully",
            imageUrl,
            user: updatedUser,
          });
        } catch (err) {
          console.error("Error making file public or updating user:", err);
          res
            .status(500)
            .json({ error: "Error finalizing image upload or updating user" });
        }
      });

      blobStream.end(req.file.buffer);
    } else {
      res.status(400).json({ error: "No image file provided" });
    }
  } catch (err) {
    console.error("Error uploading profile image:", err);
    res.status(500).json({ error: "Error uploading profile image" });
  }
});

app.get("/messages/:donationId", async (req, res) => {
  const { donationId } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        donation_id: parseInt(donationId),
        OR: [
          { from_user_id: parseInt(userId) },
          { to_user_id: parseInt(userId) },
        ],
      },
      orderBy: { created_at: "asc" },
    });
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});


app.post("/messages", async (req, res) => {
  const { from_user_id, to_user_id, donation_id, text } = req.body;
  try {
    const message = await prisma.message.create({
      data: {
        from_user_id: parseInt(from_user_id),
        to_user_id: parseInt(to_user_id),
        donation_id: parseInt(donation_id),
        text,
      },
    });
    console.log("Created message:", message);
    res.status(201).json(message);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});


app.get("/user-chats/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // שלב 1: הודעות קיימות
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { from_user_id: parseInt(userId) },
          { to_user_id: parseInt(userId) },
        ],
      },
      orderBy: { created_at: "desc" },
      include: {
        from_user: true,
        to_user: true,
      },
    });

    const chatMap = new Map();

    messages.forEach((msg) => {
      const otherUser =
        msg.from_user_id === parseInt(userId) ? msg.to_user : msg.from_user;
      const key = `${msg.donation_id}-${otherUser.id}`;

      if (!chatMap.has(key)) {
        chatMap.set(key, {
          donationId: msg.donation_id,
          otherUserId: otherUser.id,
          otherUserName: otherUser.name,
          otherUserImage: otherUser.image_url,
          lastMessage: msg.text,
          lastMessageTime: msg.created_at,
        });
      }
    });

    // שלב 2: תרומות שנעשו עליהן Claim ועדיין אין צ'אט
    const claimedDonations = await prisma.foodDonation.findMany({
      where: {
        claimed_by: parseInt(userId),
      },
      include: {
        user: true, // בעל התרומה
      },
    });

    claimedDonations.forEach((donation) => {
      const key = `${donation.id}-${donation.user.id}`;

      // רק אם עדיין אין צ'אט קיים על התרומה הזאת
      if (!chatMap.has(key)) {
        chatMap.set(key, {
          donationId: donation.id,
          otherUserId: donation.user.id,
          otherUserName: donation.user.name,
          otherUserImage: donation.user.image_url,
          lastMessage: "You claimed this donation. Start a conversation!",
          lastMessageTime: donation.updatedAt || donation.createdAt,
        });
      }
    });

    // הפוך למערך ומיין לפי זמן
    const chatArray = Array.from(chatMap.values()).sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.json(chatArray);
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({ error: "Failed to load chats" });
  }
});



app.post("/api/claim-donation/:id", async (req, res) => {
  const { id } = req.params; // Donation ID
  const { userId, amount } = req.body; // Current user ID and amount to claim
  console.log("amount", amount);

  try {
    // Find the donation
    const donation = await prisma.foodDonation.findUnique({
      where: { id: parseInt(id) },
    });

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.status === "unavailable" || donation.amount <= 0) {
      return res.status(400).json({ message: "Donation is already claimed or unavailable" });
    }

    if (amount > donation.amount) {
      return res.status(400).json({ message: "Not enough amount available" });
    }

    // Calculate new amount
    const newAmount = donation.amount - amount;
    console.log("New amount after claim:", newAmount);

    // Update the donation: reduce amount, set claimed_by and status if needed
    await prisma.foodDonation.update({
      where: { id: parseInt(id) },
      data: {
        amount: newAmount,
        claimed_by: userId,
        status: newAmount === 0 ? "claimed" : "available", // <-- This line does what you want
      },
    });

    // Increment the credit of the user who created the donation
    await prisma.user.update({
      where: { id: donation.userId },
      data: {
        credit: { increment: 1 },
      },
    });

    res.status(200).json({ message: "Donation claimed successfully!" });
  } catch (error) {
    console.error("Error claiming donation:", error);
    res.status(500).json({ message: "Internal server error" });
  }

});

