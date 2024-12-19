import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import { validateBookingData } from "../lib/validations.util.js";
import { checkTempUser } from '../services/user-temp.service.js';
import { addParticipant } from '../services/trip.service.js';
import AppError from "../lib/app-error.util.js";

export const createBooking = async (req, res, next) => {
  const {
    personalInfo,
    travelDetails,
    tripId,
    selectedDate,
    numberOfPeople,
  } = req.body;

  // Validate input data
  const validationErrors = validateBookingData(req.body);
  if (validationErrors.length > 0) {
    return next(new AppError(400, "Validation errors"));
  }

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Destructure necessary fields from personalInfo and travelDetails
    const {
      firstName,
      lastName,
      email,
      phone,
      idCard,
      notParticipating
    } = personalInfo;

    const {
      dob,
      gender,
      streetAddress,
      address2,
      city,
      zipCode
    } = travelDetails;

    // Combine first and last name
    const fullName = `${firstName} ${lastName}`;

    // If user does not exist, create a new TempUser
    const tempUser = await checkTempUser(
      fullName,
      phone,
      email,
      dob,
      gender,
      streetAddress,
      address2,
      city,
      zipCode,
      idCard
    );

    if(!tempUser){
      throw new AppError(400, `Unable to use user details`);
    }

    await addParticipant(tripId, tempUser._id);

    // Create a new Booking
    const booking = new Booking({
      tempUser: tempUser._id,
      trip: tripId,
      selectedDateId: selectedDate,
      participing: !notParticipating,
      numberOfPeople,
      status: 'pending',
    });

    await booking.save({ session });

    // Add the booking to the user's bookings array
    tempUser.bookings.push(booking._id);
    await tempUser.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Optionally, send a confirmation email or notification here
    // sendConfirmationEmail(tempUser, booking); // Implement this function as needed

    res.status(201).json({ success: true, message: "Booking created successfully!", booking });
  } catch (error) {
    // Abort the transaction in case of error
    await session.abortTransaction();
    session.endSession();

    console.error("Error creating booking:", error);
    next(error); // Pass the error to the centralized error handler
  }
};

export const getAllBookings = async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;

  try {
    const filters = {};
    if (status) filters.status = status;

    const skip = (page - 1) * limit;
    const bookings = await Booking.find(filters)
      .populate('trip user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalBookings = await Booking.countDocuments(filters);

    res.status(200).json({
      bookings,
      currentPage: Number(page),
      totalPages: Math.ceil(totalBookings / limit),
      totalBookings,
    });
  } catch (error) {
    next(error);
  }
};


export const getBookingById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id).populate('trip user');

    if (!booking) {
      return res.status(404).json({ message: `Booking with id: ${id} not found` });
    }

    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const booking = await Booking.findByIdAndUpdate(id, updates, { new: true });

    if (!booking) {
      return res.status(404).json({ message: `Booking with id: ${id} not found` });
    }

    res.status(200).json({ message: "Booking updated successfully!", booking });
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req, res, next) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ message: `Booking with id: ${id} not found` });
    }

    res.status(200).json({ message: "Booking deleted successfully!" });
  } catch (error) {
    next(error);
  }
};
