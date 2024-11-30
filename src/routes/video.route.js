import express from 'express';
import {
    createVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    searchVideos,
  } from '../controllers/video.controller.js';
  
const router = express.Router();

router.post('/createVideo', createVideo);

router.get('/getAllVideos', getAllVideos);

router.get('/searchVideos', searchVideos);

router.get('/getVideoById/:id', getVideoById);

router.put('/updateVideo/:id', updateVideo);

router.delete('/deleteVideo/:id', deleteVideo);

export default router;