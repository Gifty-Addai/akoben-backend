import Booking from '../models/booking.model.js';

// Create a new booking
export const createBooking = async (req, res, next) => {
  const { user, campsite, campingDate, numberOfPeople, totalCost, specialRequests } = req.body;

  if (!user || !campingDate || !numberOfPeople || !totalCost) {
    return res.status(400).json({ message: "User, campingDate, numberOfPeople, and totalCost are required." });
  }

  try {
    const newBooking = new Booking({
      user,
      campsite,
      campingDate,
      numberOfPeople,
      totalCost,
      specialRequests,
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booking created successfully!', booking: newBooking });
  } catch (error) {
    next(error);
  }
};

// Get all bookings
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate('user', 'name email');
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

// Get a single booking by ID
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'name email');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

// Update a booking
export const updateBooking = async (req, res, next) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.status(200).json({ message: 'Booking updated successfully!', booking: updatedBooking });
  } catch (error) {
    next(error);
  }
};

// Delete a booking
export const deleteBooking = async (req, res, next) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);

    if (!deletedBooking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.status(200).json({ message: 'Booking deleted successfully!' });
  } catch (error) {
    next(error);
  }
};
