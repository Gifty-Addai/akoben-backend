import express from "express";
import authRoutes from "./src/routes/auth.route.js";
import productRouter from "./src/routes/product.route.js";
import bookinRoute from "./src/routes/booking.route.js";
import galleryRoute from "./src/routes/gallery.route.js";
import userRoute from "./src/routes/user.route.js";
import videoRoute from "./src/routes/video.route.js";
import testimonyRoute from "./src/routes/testimony.route.js";
import dotenv from "dotenv";
import path from 'path';
import { connectDb } from "./src/lib/db.js";
import cors from 'cors';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL,  // Ensure FRONTEND_URL is correctly set
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'], // Allow specific headers
    preflightContinue: false,  // Ensure the CORS response is sent automatically for preflight requests
    optionsSuccessStatus: 204  // Some older browsers (like IE) may require this status
}));

const port = process.env.PORT || 3000;

const __dirname = path.resolve();

// Middleware to parse JSON requests
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/product", productRouter);
app.use("/api/booking", bookinRoute);
app.use("/api/user", userRoute);
app.use("/api/gallery", galleryRoute);
app.use("/api/video", videoRoute);
app.use("/api/testimony", testimonyRoute);

// Start the server and connect to the database
app.listen(port, () => {
    console.log(`Server started on port ${port}, ${process.env.FRONTEND_URL}`);
    connectDb(); // Make sure the DB connection happens when the app starts
});
