// services/participantService.js

import {Trip} from '../models/trip.model.js';
import TempUser from '../models/temp.user.model.js';
import { validateObjectId } from '../lib/validations.util.js';
import AppError from '../lib/app-error.util.js';

export const addParticipant = async (tripId, userId) => {
  // Validate ObjectIds
  if (!validateObjectId(tripId)) {
    throw new AppError(400, `Invalid trip ID: ${tripId}`);
  }

  if (!validateObjectId(userId)) {
    throw new AppError(400, `Invalid user ID: ${userId}`);
  }

  // Check if user exists
  const user = await TempUser.findById(userId);
  if (!user) {
    throw new AppError(404, `User with id: ${userId} not found`);
  }

  // Check if trip exists
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError(404, `Trip with id: ${tripId} not found`);
  }

  // Check if user is already a participant
  if (trip.participants.includes(userId)) {
    throw new AppError(400, "User is already a participant of this trip.");
  }

  // Optionally, check for available slots
  const totalSlots = trip.schedule.dates.reduce((acc, date) => acc + date.slotsRemaining, 0);
  if (totalSlots <= trip.participants.length) {
    throw new AppError(400, "No available slots for this trip.");
  }

  // Add participant using $addToSet to prevent duplicates
  const updatedTrip = await Trip.findByIdAndUpdate(
    tripId,
    { $addToSet: { participants: userId } },
    { new: true, runValidators: true }
  ).populate('participants', '-password');

  return updatedTrip;
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
  const user = await TempUser.findById(userId);
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
