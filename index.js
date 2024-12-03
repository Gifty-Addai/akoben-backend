// index.js
import express from "express";
import authRoutes from "./src/routes/auth.route.js";
import productRouter from "./src/routes/product.route.js";
import bookingRoute from "./src/routes/booking.route.js";
import galleryRoute from "./src/routes/gallery.route.js";
import userRoute from "./src/routes/user.route.js";
import videoRoute from "./src/routes/video.route.js";
import testimonyRoute from "./src/routes/testimony.route.js";
import dotenv from "dotenv";
import { connectDb } from "./src/lib/db.js";
import cors from 'cors';
import serverless from 'serverless-http';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL, 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
    preflightContinue: false,  
    optionsSuccessStatus: 204 
}));

// Middleware to parse JSON requests
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/product", productRouter);
app.use("/api/booking", bookingRoute);
app.use("/api/user", userRoute);
app.use("/api/gallery", galleryRoute);
app.use("/api/video", videoRoute);
app.use("/api/testimony", testimonyRoute);

// Connect to the database
connectDb();

// Export the app as a serverless handler (default export)
export default serverless(app);
