import express from 'express';
import { uploadSingleImage, uploadImage } from '../controllers/images.controller.js';

const router = express.Router();


router.post('/upload-image', uploadSingleImage, uploadImage);

export default router;
