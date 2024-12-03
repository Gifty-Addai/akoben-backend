// index.js
import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import serverless from 'serverless-http';

// Import your routes
import authRoutes from "./src/routes/auth.route.js";
import productRouter from "./src/routes/product.route.js";
import bookingRoute from "./src/routes/booking.route.js";
import galleryRoute from "./src/routes/gallery.route.js";
import userRoute from "./src/routes/user.route.js";
import videoRoute from "./src/routes/video.route.js";
import testimonyRoute from "./src/routes/testimony.route.js";

// Import the optimized connectDb function
import { connectDb } from "./src/lib/db.js";

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

// Middleware to parse JSON requests with increased limit if necessary
app.use(express.json({ limit: '1mb' })); // Adjust the limit based on your needs

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/product", productRouter);
app.use("/api/booking", bookingRoute);
app.use("/api/user", userRoute);
app.use("/api/gallery", galleryRoute);
app.use("/api/video", videoRoute);
app.use("/api/testimony", testimonyRoute);

// Handle favicon.ico requests to prevent unnecessary processing
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Default route to ensure the function responds promptly
app.get('/', async (req, res) => {
    try {
        await connectDb(); // Ensure DB connection is established
        res.status(200).send('Hello from Akoben Backend!');
    } catch (error) {
        console.error('Error in default route:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).send('Internal Server Error');
});

// Export the app as a serverless handler (default export)
export default serverless(app);
