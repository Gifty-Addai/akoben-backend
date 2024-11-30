import express from 'express';
import {
    createTestimony,
    getAllTestimonies,
    getTestimonyById,
    updateTestimony,
    deleteTestimony,
    searchTestimonies,
  } from '../controllers/testimony.controller.js';
  

const router = express.Router();

router.post('/createTestimony', createTestimony);

router.get('/getAllTestimonies', getAllTestimonies);

router.get('/searchTestimonies', searchTestimonies);

router.get('/getTestimonyById/:id', getTestimonyById);

router.put('/updateTestimony/:id', updateTestimony);

router.delete('/deleteTestimony/:id', deleteTestimony);

export default router;