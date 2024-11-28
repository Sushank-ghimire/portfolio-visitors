import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import { Visitors } from "./models/visitors.model.js";
import cookieParser from "cookie-parser";

configDotenv();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "https://ghimiresushank.com.np",
    credentials: true,
  })
);

// Error handling middleware
app.use((err, req, res, next) => {
  const allowedOrigin = [
    "https://ghimiresushank.com.np",
    "www.ghimiresushank.com.np",
  ];
  const origin = req.get("origin");

  if (origin && !allowedOrigin.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: "Access forbidden: Invalid origin.",
    });
  }
  if (err) {
    return res.status(500).json({
      success: false,
      message: "An error occurred.",
      error: err.message,
    });
  }
  next();
});

// Route to increment visit count
app.get("/api/v1/visitors", async (req, res, next) => {
  try {
    const hasVisited = req.cookies.visited;

    if (hasVisited) {
      return res
        .status(200)
        .json({ message: "You have already visited the site." });
    }

    const visitor = await Visitors.findOneAndUpdate(
      {}, // No filter to find the first document
      { $inc: { visits: 1 } }, // Increment visits by 1
      { new: true, upsert: true } // Create if not found, return the updated document
    );

    // Set a cookie to indicate the user has visited
    res.cookie("visited", "true", {
      httpOnly: true, // Prevent client-side access to the cookie
      secure: true, // Only send over HTTPS
      maxAge: 50 * 24 * 60 * 60 * 1000, // Cookie expires in 50 days
      sameSite: "strict", // Mitigate CSRF
    });
    res.status(200).json({
      success: true,
      message: "Visits count incremented successfully.",
      data: visitor,
    });
  } catch (error) {
    next(error); // Pass errors to the error-handling middleware
  }
});

// Connect to MongoDB and start the server
mongoose
  .connect(`${process.env.MONGO_URI}`)
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is listening at port: ${process.env.PORT || 3000}`);
    });
  })
  .catch((error) => {
    console.log(`Failed to connect database due to: ${error.message}`);
  });
