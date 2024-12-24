import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ApiResponse from '../lib/api-reponse.util.js';
import cloudinary from '../configs/cloudinary.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const sanitizedFilename = file.originalname.replace(/\s+/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedFilename}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype.toLowerCase());
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
  },
});

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
        return ApiResponse.sendError(res,"No file uploaded",400);
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'trip_images',
    });

    // Remove the file from the server after uploading to Cloudinary
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error('Failed to delete local image:', err);
      }
    });

    // Respond with the Cloudinary image URL
    return ApiResponse.sendSuccess(res,"",{ url: result.secure_url },200)
  } catch (error) {
    console.error('Upload Error:', error);
    next(error);
  }
};

// Middleware to handle Multer upload
export const uploadSingleImage = upload.single('file');
