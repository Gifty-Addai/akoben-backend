import Booking from "../models/booking.model.js";
import { validateBookingData } from "../lib/validations.util.js";

export const createBooking = async (req, res, next) => {
  const { user, trip, campsite, campingDate, numberOfPeople, totalCost, specialRequests } = req.body;

  // Validate input data
  const validationErrors = validateBookingData(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ message: "Validation errors", errors: validationErrors });
  }

  try {
    const booking = new Booking({
      user,
      trip,
      campsite,
      campingDate,
      numberOfPeople,
      totalCost,
      specialRequests,
    });

    // Save booking
    await booking.save();

    // Send confirmation email or notification (Optional)
    // sendConfirmationEmail(user, booking); // Implement this function as needed

    res.status(201).json({ message: "Booking created successfully!", booking });
  } catch (error) {
    console.error("Error creating booking:", error); // Log error details
    res.status(500).json({ message: "Internal server error. Please try again." });
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
