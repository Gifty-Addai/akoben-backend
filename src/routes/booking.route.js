import express from 'express';
import {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
  } from '../controllers/booking.controller.js';

const route = express.Router();


route.post("/createBooking",createBooking)
route.get("/getAllBookings",getAllBookings)
route.get("/getBookingById/:id",getBookingById)
route.post("/updateBooking/:id",updateBooking)
route.delete("/deleteBooking/:id",deleteBooking)

export default route;