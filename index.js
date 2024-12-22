// app.js

import express from "express";
import dotenv from "dotenv";
import path from 'path';
import cors from 'cors';

// Import routes
import authRoutes from "./src/routes/auth.route.js";
import productRouter from "./src/routes/product.route.js";
import bookinRoute from "./src/routes/booking.route.js";
import galleryRoute from "./src/routes/gallery.route.js";
import userRoute from "./src/routes/user.route.js";
import tripRoute from "./src/routes/trip.route.js";
import videoRoute from "./src/routes/video.route.js";
import testimonyRoute from "./src/routes/testimony.route.js";

// Import middleware
import errorHandler from "./src/middlewares/exceptionHandler.middleware.js";
import cookieParser from 'cookie-parser';

// Import database connection
import { connectDb } from "./src/lib/db.js";
import ApiResponse from "./src/lib/api-reponse.util.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const __dirname = path.resolve();

// Middleware to handle CORS
app.use(cors({
    origin: process.env.FRONTEND_URL, 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
    preflightContinue: false,  
    credentials: true,
    optionsSuccessStatus: 204 
}));

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse cookies
app.use(cookieParser());

// Define your routes
app.use("/api/auth", authRoutes);
app.use("/api/product", productRouter);
app.use("/api/booking", bookinRoute);
app.use("/api/user", userRoute);
app.use("/api/trip", tripRoute);
app.use("/api/gallery", galleryRoute);
app.use("/api/video", videoRoute);
app.use("/api/testimony", testimonyRoute);

// Handle 404 for undefined routes
app.use((req, res, next) => {
  ApiResponse.sendError(res, "Endpoint not found", 404);
});

// Centralized Error Handling Middleware (should be last)
app.use(errorHandler);

// Start the server and connect to the database
app.listen(port, () => {
    console.log(`Server started on port ${port}, ${process.env.FRONTEND_URL}`);
    connectDb();
});
