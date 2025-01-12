import express from 'express';
import {
    createTrip,
    createTrips,
    updateTrip,
    deleteTrip,
    getAllTrips,
    getTripById,
    searchTrips
} from '../controllers/trip.controller.js';
import {
    createRequest,
    getRequestById,
    getAllRequests,
  } from "../controllers/request_date.controller.js";
    


const router = express.Router();

// Routes
router.post('/createTrip', createTrip);
router.post('/createTrips', createTrips);
router.get('/getAllTrips', getAllTrips);
router.get('/searchTrip', searchTrips);
router.get('/getTripById/:id', getTripById);
router.delete('/deleteTrip/:id', deleteTrip);
router.patch('/updateTrip/:id', updateTrip);
router.post("/requestDate/:tripId", createRequest);
  
router.get("/getRequestById/:id", getRequestById);

router.get("/getAllRequests", getAllRequests);
// router.post('/updateProduct/:id', updateProduct);

export default router;
