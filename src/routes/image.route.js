import express from 'express';
import { uploadSingleImage, uploadImage, uploadSingleVideo, uploadVideo } from '../controllers/images.controller.js';

const router = express.Router();

router.post('/upload-image', uploadSingleImage, uploadImage);
router.post('/upload-video', uploadSingleVideo, uploadVideo);

export default router;

