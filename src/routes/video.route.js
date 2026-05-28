import express from 'express';
import {
    createVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    searchVideos,
  } from '../controllers/video.controller.js';
import { verifyAccessToken } from '../middlewares/verify-token.middleware.js';
import authorize from '../middlewares/authorization.middleware.js';
  
const router = express.Router();

// Public routes
router.get('/getAllVideos', getAllVideos);
router.get('/searchVideos', searchVideos);
router.get('/getVideoById/:id', getVideoById);

// Protected Admin-only routes
router.post('/createVideo', verifyAccessToken, authorize('admin'), createVideo);
router.put('/updateVideo/:id', verifyAccessToken, authorize('admin'), updateVideo);
router.delete('/deleteVideo/:id', verifyAccessToken, authorize('admin'), deleteVideo);

export default router;