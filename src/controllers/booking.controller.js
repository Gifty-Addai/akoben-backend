import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import { validateBookingData } from "../lib/validations.util.js";
import { checkTempUser } from '../services/user-temp.service.js';
import { addParticipant } from '../services/trip.service.js';
import AppError from "../lib/app-error.util.js";
import { sendMail } from "../services/mail.service.js";
import paymentService from "../services/paymentService.js";
import { bookingPending } from "../html/htmls.js";
import ApiResponse from "../lib/api-reponse.util.js";
import { updateBookingSchema } from '../lib/validation/booking.validation.js';

/**
 * Controller to handle creating a booking (adding a participant).
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
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
    return ApiResponse.sendError(res, validationErrors.join(","), 400);
    // Alternatively, you can use: return next(new AppError(false, 400, validationErrors.join(",")));
  }

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
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

    const user = await checkTempUser(
      fullName,
      phone,
      email,
      dob,
      gender,
      streetAddress,
      address2,
      city,
      zipCode,
      idCard,
      session 
    );

    if (!user) {
      throw new AppError(false, 400, "Unable to use user details");
    }

    // Attempt to add participant
    const addParticipantResult = await addParticipant(tripId, user._id, selectedDate, session);

    if (addParticipantResult.existingBooking) {
      // User is already a participant and has an existing booking
      const { existingBooking } = addParticipantResult;

      // Commit the transaction before responding
      await session.commitTransaction();
      session.endSession();

      // Prepare response data
      const responseData = {
        bookingId: existingBooking._id,
        tripId: existingBooking.trip,
        selectedDateId: existingBooking.selectedDateId,
        participing: existingBooking.participing,
        numberOfPeople: existingBooking.numberOfPeople,
        bookingDate: existingBooking.bookingDate,
        paymentDone: existingBooking.payment,
        reference: existingBooking.reference,
        status: existingBooking.status,
        rescheduleDate: existingBooking.rescheduleDate,
      };

      // Optionally, you can populate additional fields if needed
      // await existingBooking.populate('trip').execPopulate();

      await session.abortTransaction();
      session.endSession();
      return ApiResponse.sendError(res, "User is already a participant with an existing booking.", responseData, 400);
    }

    // If user is not already a participant, proceed to create a new booking
    const updatedTripDate = addParticipantResult.tripDate;

    // Create a new Booking
    const booking = new Booking({
      user: user._id,
      trip: tripId,
      selectedDateId: selectedDate,
      participing: !notParticipating,
      numberOfPeople,
      status: 'pending',
    });

    await booking.save({ session });

    // Add the booking to the user's bookings array
    user.bookings.push(booking._id);
    await user.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Prepare email content
    const htmlBody = bookingPending({
      fullName,
      bookingId: booking._id,
      tripId,
      selectedDate,
      numberOfPeople
    });

    // Send confirmation email
    await sendMail(personalInfo.email, "Booking Pending - Fie Ne Fie", htmlBody);

    // Prepare response data with payment details
    const responseBooking = {
      bookingId: booking._id,
      tripId: booking.trip,
      selectedDateId: booking.selectedDateId,
      participing: booking.participing,
      numberOfPeople: booking.numberOfPeople,
      bookingDate: booking.bookingDate,
      paymentDone: booking.payment,
      reference: booking.reference,
      status: booking.status,
      rescheduleDate: booking.rescheduleDate,
    };

    // Respond with the updated booking
    return ApiResponse.sendSuccess(res, "Booking created successfully!", responseBooking, 201);
  } catch (error) {
    // Abort the transaction in case of error
    await session.abortTransaction();
    session.endSession();

    // Pass the error to the global error handling middleware
    next(error);
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

    return ApiResponse.sendSuccess(res,"",{
      bookings,
      currentPage: Number(page),
      totalPages: Math.ceil(totalBookings / limit),
      totalBookings,
    },200)
  } catch (error) {
    next(error);
  }
};


export const getBookingById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id).populate('trip user');

    if (!booking) {
      return ApiResponse.sendError(res, `Booking with id: ${id} not found`, 400);
    }

    return ApiResponse.sendSuccess(res,"Success",booking,200)
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req, res, next) => {
  const { id, verify, reference } = req.params;
  const updates = req.body;

  // Define allowed fields
  const allowedUpdates = [
    'selectedDateId',
    'participing',
    'numberOfPeople',
    'payment',
    'authorizationUrl',
    'reference',
    'status',
    'rescheduleDate',
  ];

  try {
    // Handle Payment Verification if 'verify' is true
    if (verify === 'true') { // Assuming 'verify' is passed as a string in params
      // Validate that 'reference' is provided
      if (!reference) {
        return ApiResponse.sendError(res, "Reference can't be empty when verify is true", 400);
      }

      // Verify payment using the paymentService
      const verificationResult = await paymentService.verifyPayment(reference);

      if (verificationResult.success) {
        // Find the booking associated with this reference
        const booking = await Booking.findOne({ reference });

        if (!booking) {
          return ApiResponse.sendError(res, 'Booking not found.', 404);
        }

        // Update only the 'payment' field to true
        booking.payment = true;
        await booking.save();

        // Optionally, you can populate related fields if necessary
        await booking.populate('user', 'name email').populate('trip', 'destination duration');

        // Send success response
        return ApiResponse.sendSuccess(res, 'Payment verified successfully!', booking, 200);
      } else {
        // Payment verification failed
        return ApiResponse.sendError(res, verificationResult.message || 'Payment verification failed.', 400);
      }
    }

    // If not verifying payment, proceed with regular update

    // Extract the keys from the updates
    const updateKeys = Object.keys(updates);

    // Check if all update fields are allowed
    const isValidOperation = updateKeys.every((key) => allowedUpdates.includes(key));

    if (!isValidOperation) {
      return ApiResponse.sendError(
        res,
        `Invalid updates! Allowed fields: ${allowedUpdates.join(', ')}`,
        400
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.sendError(res, 'Invalid booking ID.', 400);
    }

    // Validate updates using Joi
    const { error } = updateBookingSchema.validate(updates);
    if (error) {
      return ApiResponse.sendError(res, error.details[0].message, 400);
    }

    // Perform the update
    const booking = await Booking.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'name email')
      .populate('trip', 'destination duration');

    if (!booking) {
      return ApiResponse.sendError(res, 'Booking not found.', 404);
    }

    return ApiResponse.sendSuccess(res, 'Booking updated successfully!', booking, 200);
  } catch (error) {
    // Log the error for debugging purposes
    logger.error(`Error updating booking with ID ${id}: ${error.message}`);

    // Forward the error to the global error handler
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
