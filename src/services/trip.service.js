// services/participantService.js

import { Trip } from '../models/trip.model.js';
import User from '../models/user.model.js';
import { validateObjectId } from '../lib/validations.util.js';
import AppError from '../lib/app-error.util.js';
import mongoose from 'mongoose';
import Booking from '../models/booking.model.js';

/**
 * Adds a participant to a specific trip date.
 * @param {String} tripId - The ID of the trip.
 * @param {String} userId - The ID of the user to add.
 * @param {String} dateId - The ID of the trip date.
 * @param {Object} session - The Mongoose session object.
 * @returns {Object} - The updated trip date or existing booking.
 * @throws {AppError} - If any validation or operation fails.
 */
export const addParticipant = async (tripId, userId, dateId, session) => {
  // Validate ObjectIds (optional if already validated in controller)
  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    throw new AppError(false, 400, `Invalid trip ID: ${tripId}`);
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError(false, 400, `Invalid user ID: ${userId}`);
  }

  if (!mongoose.Types.ObjectId.isValid(dateId)) {
    throw new AppError(false, 400, `Invalid date ID: ${dateId}`);
  }

  // Fetch the trip with the specified tripId and include the specific TripDate
  const trip = await Trip.findById(tripId)
    .populate({
      path: 'schedule.dates.participants',
      select: 'name email', // Adjust fields as needed
    })
    .session(session);

  if (!trip) {
    throw new AppError(false, 404, `Trip with id: ${tripId} not found`);
  }

  // Find the specific TripDate
  const tripDate = trip.schedule.dates.id(dateId);
  if (!tripDate) {
    throw new AppError(false, 404, `Trip date with id: ${dateId} not found`);
  }

  // Check if trip date is available
  if (!tripDate.isAvailable) {
    throw new AppError(false, 400, `Trip date with id: ${dateId} is no longer available.`);
  }

  // Check if user exists
  const user = await User.findById(userId).session(session);
  if (!user) {
    throw new AppError(false, 404, `User with id: ${userId} not found`);
  }

  // Check if user is already a participant
  const isAlreadyParticipant = tripDate.participants.some(participant => 
    participant._id.toString() === userId.toString()
  );

  if (isAlreadyParticipant) {
    // Retrieve the existing booking
    const existingBooking = await Booking.findOne({
      user: userId,
      trip: tripId,
      selectedDateId: dateId,
    }).session(session);

    if (existingBooking) {
      return { tripDate, existingBooking };
    } else {
      throw new AppError(false, 400, "User is a participant but no booking found.");
    }
  }

  // Add participant
  tripDate.participants.push(userId);
  tripDate.slotsRemaining -= 1;

  // If slots are full, set isAvailable to false
  if (tripDate.slotsRemaining === 0) {
    tripDate.isAvailable = false;
  }

  // Save the Trip document with the session
  await trip.save({ session });

  // Return the updated TripDate
  const updatedTripDate = trip.schedule.dates.id(dateId);
  return { tripDate: updatedTripDate };
};



/**
 * Removes a participant from a trip.
 * @param {String} tripId - The ID of the trip.
 * @param {String} userId - The ID of the user to remove.
 * @returns {Object} - The updated trip document.
 */
export const removeParticipant = async (tripId, userId) => {
  // Validate ObjectIds
  if (!validateObjectId(tripId)) {
    throw { status: 400, message: `Invalid trip ID: ${tripId}` };
  }

  if (!validateObjectId(userId)) {
    throw { status: 400, message: `Invalid user ID: ${userId}` };
  }

  // Check if trip exists
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw { status: 404, message: `Trip with id: ${tripId} not found` };
  }

  // Check if user is a participant
  if (!trip.participants.includes(userId)) {
    throw { status: 400, message: "User is not a participant of this trip." };
  }

  // Remove participant using $pull
  const updatedTrip = await Trip.findByIdAndUpdate(
    tripId,
    { $pull: { participants: userId } },
    { new: true, runValidators: true }
  ).populate('participants', '-password');

  return updatedTrip;
};

/**
 * Toggles a participant in a trip.
 * Adds the participant if not present; removes if present.
 * @param {String} tripId - The ID of the trip.
 * @param {String} userId - The ID of the user to toggle.
 * @returns {Object} - The updated trip document.
 */
export const toggleParticipant = async (tripId, userId) => {
  // Validate ObjectIds
  if (!validateObjectId(tripId)) {
    throw { status: 400, message: `Invalid trip ID: ${tripId}` };
  }

  if (!validateObjectId(userId)) {
    throw { status: 400, message: `Invalid user ID: ${userId}` };
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw { status: 404, message: `User with id: ${userId} not found` };
  }

  // Check if trip exists
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw { status: 404, message: `Trip with id: ${tripId} not found` };
  }

  let updatedTrip;
  if (trip.participants.includes(userId)) {
    // User is already a participant; remove them
    updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      { $pull: { participants: userId } },
      { new: true, runValidators: true }
    ).populate('participants', '-password');
    return { message: "Participant removed successfully!", trip: updatedTrip };
  } else {
    // User is not a participant; add them
    // Optionally, check for available slots
    const totalSlots = trip.schedule.dates.reduce((acc, date) => acc + date.slotsRemaining, 0);
    if (totalSlots <= trip.participants.length) {
      throw { status: 400, message: "No available slots for this trip." };
    }

    updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      { $addToSet: { participants: userId } },
      { new: true, runValidators: true }
    ).populate('participants', '-password');
    return { message: "Participant added successfully!", trip: updatedTrip };
  }
};
