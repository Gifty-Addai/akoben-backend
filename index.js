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
import mailRoute from "./src/routes/mailing.route.js";
import imageRoute from "./src/routes/image.route.js";
import videoRoute from "./src/routes/video.route.js";
import testimonyRoute from "./src/routes/testimony.route.js";
import orderRoutes from "./src/routes/order.route.js";
import adminRoute from './src/routes/admin.route.js';
import settingsRoute from './src/routes/settings.route.js';

import errorHandler from "./src/middlewares/exceptionHandler.middleware.js";
import cookieParser from 'cookie-parser';

import { connectDb } from "./src/lib/db.js";
import ApiResponse from "./src/lib/api-reponse.util.js";

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const port = process.env.PORT || 3000;
const __dirname = path.resolve();

const parseOrigins = (originsString) => {
  if (!originsString) return [];
  return originsString.split(',').map(origin => origin.trim());
};

const allowedOrigins = [
  ...parseOrigins(process.env.FRONTEND_URL),
  ...parseOrigins(process.env.PRODUCTION_FRONTEND_URL),
  ...parseOrigins(process.env.ALLOWED_ORIGINS)
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'x-refresh-token'],
  preflightContinue: false,
  credentials: true,
  optionsSuccessStatus: 204
}));

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse cookies
app.use(cookieParser());

// Global Serverless DB Connection Middleware
app.use(async (req, res, next) => {
  try {
    const { connectDbServerless } = await import('./src/lib/db-serverless.js');
    await connectDbServerless();
    next();
  } catch (error) {
    console.error('Database connection failed in global middleware:', error);
    next(error);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/product", productRouter);
app.use("/api/booking", bookinRoute);
app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/mail", mailRoute);
app.use("/api/trip", tripRoute);
app.use("/api/gallery", galleryRoute);
app.use("/api/video", videoRoute);
app.use("/api/image", imageRoute);
app.use("/api/testimony", testimonyRoute);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoute);

app.use((req, res, next) => {
  ApiResponse.sendError(res, "Endpoint not found", 404);
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server started on port ${port}, ${process.env.FRONTEND_URL}`);
  connectDb();
});

export default app;
