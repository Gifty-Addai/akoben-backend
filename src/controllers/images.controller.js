import multer from 'multer';
import path from 'path';
import { Readable } from 'stream';
import ApiResponse from '../lib/api-reponse.util.js';
import cloudinary from '../configs/cloudinary.config.js';

// Configure Multer storage to keep files in memory (essential for serverless read-only filesystems)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 },
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
      return ApiResponse.sendError(res, "No file uploaded", 400);
    }

    // Helper to upload a buffer to Cloudinary using upload_stream
    const uploadFromBuffer = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'trip_images' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        Readable.from(fileBuffer).pipe(stream);
      });
    };

    const result = await uploadFromBuffer(req.file.buffer);

    // Respond with the Cloudinary image URL
    return ApiResponse.sendSuccess(res, "", { url: result.secure_url }, 200)
  } catch (error) {
    console.error('Upload Error:', error);
    next(error);
  }
};

// Middleware to handle Multer upload
export const uploadSingleImage = upload.single('file');
