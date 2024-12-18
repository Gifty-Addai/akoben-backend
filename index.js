import express from "express";
import authRoutes from "./src/routes/auth.route.js";
import productRouter from "./src/routes/product.route.js";
import bookinRoute from "./src/routes/booking.route.js";
import galleryRoute from "./src/routes/gallery.route.js";
import userRoute from "./src/routes/user.route.js";
import tripRoute from "./src/routes/trip.route.js";
import videoRoute from "./src/routes/video.route.js";
import testimonyRoute from "./src/routes/testimony.route.js";
import dotenv from "dotenv";
import path from 'path';
import { connectDb } from "./src/lib/db.js";
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL, 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
    preflightContinue: false,  
    optionsSuccessStatus: 204 
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
app.use("/api/trip", tripRoute);
app.use("/api/gallery", galleryRoute);
app.use("/api/video", videoRoute);
app.use("/api/testimony", testimonyRoute);

// Start the server and connect to the database
app.listen(port, () => {
    console.log(`Server started on port ${port}, ${process.env.FRONTEND_URL}`);
    connectDb(); // Make sure the DB connection happens when the app starts
});
