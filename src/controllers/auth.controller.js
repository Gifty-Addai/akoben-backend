import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { generateToken } from '../lib/utils.js';
import mongoose from 'mongoose';
import https from 'https';
import ApiResponse from '../lib/api-reponse.util.js';
import Booking from '../models/booking.model.js';
import verifyPayment from '../services/paymentService.js'


const signup = async (req, res, next) => {
  console.log('Request Body:', req.body);
  const { name, email, password, phone } = req.body;

  // Validate input fields
  if (!email || !password || !name || !phone) {
    return ApiResponse.sendError(res, 'All fields are required!', 400);
  }

  const normalizedEmail = email.toLowerCase();

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return ApiResponse.sendError(res, 'Email already in use', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
    });

    await newUser.save();

    // TODO: Implement email verification

    return ApiResponse.sendSuccess(res, 'User registered successfully!', 201);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return ApiResponse.sendError(res, 'Email and password are required!', 400);
  }

  const normalizedEmail = email.toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return ApiResponse.sendError(res, 'Invalid credentials', 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return ApiResponse.sendError(res, 'Invalid credentials', 400);
    }

    const token = generateToken(user._id, res);

    return ApiResponse.sendSuccess(res, 'Login successful', {
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const logout = (req, res, next) => {
  try {
    // Here we simply send a response, as JWT logout is client-side (by deleting the token)
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};



const initializePayment = async (req, res, next) => {
  const { amount, email, phone, isBooking, bookingId } = req.body;

  // Validate input fields
  if (!amount || !email || !phone) {
    return ApiResponse.sendError(res, 'Amount, email, and phone are required!', 400);
  }

  if (isBooking === true && !bookingId) { // Use strict comparison and corrected message
    return ApiResponse.sendError(res, 'Booking ID is required when isBooking is true', 400);
  }

  // Validate that amount is a number
  const parsedAmount = parseFloat(amount);
  // if (isNaN(parsedAmount) || parsedAmount <= 0) {
  //   return ApiResponse.sendError(res, 'Amount must be a positive number', 400);
  // }

  // Function to initialize payment with Paystack
  const paystackInitialize = (paymentAmount, customerEmail) => {
    const params = JSON.stringify({
      email: customerEmail,
      amount: paymentAmount * 100, // Convert to kobo if currency is NGN
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    return new Promise((resolve, reject) => {
      const reqPaystack = https.request(options, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            console.log('Paystack Response:', parsedData);
            resolve(parsedData);
          } catch (error) {
            console.error('Error parsing Paystack response:', error);
            reject(new Error('Failed to parse Paystack response'));
          }
        });
      });

      reqPaystack.on('error', (e) => {
        console.error(`Problem with Paystack request: ${e.message}`);
        reject(new Error('HTTPS request to Paystack failed'));
      });

      // Write data to request body
      reqPaystack.write(params);
      reqPaystack.end();
    });
  };

  try {
    // If isBooking is true, check existing Booking for reference and authorizationUrl
    if (isBooking === true) {
      // Validate bookingId format
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return ApiResponse.sendError(res, 'Invalid booking ID format', 400);
      }

      // Retrieve the Booking document
      const existingBooking = await Booking.findById(bookingId).exec();

      if (!existingBooking) {
        return ApiResponse.sendError(res, 'Booking not found', 404);
      }

      // Check if reference and authorizationUrl already exist
      if (existingBooking.payment === true && existingBooking.reference) {
        return ApiResponse.sendError(res, "Payment Done for this detail under review", 400);
      }
    }

    // Calculate total amount with additional fee (e.g., 35 units)
    const totalAmount = parsedAmount + 35;

    // Initialize payment with Paystack
    const parsedData = await paystackInitialize(totalAmount, email);

    if (parsedData.status) {
      const { authorization_url, reference, access_code } = parsedData.data;

      // If isBooking is true, update the Booking document
      if (isBooking === true) {
        const updatedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          { reference: reference, authorizationUrl: authorization_url },
          { new: true, runValidators: true }
        );

        if (!updatedBooking) {
          // This should not happen as we've already checked existence
          return ApiResponse.sendError(res, 'Booking not found or failed to update', 404);
        }
      }

      // Respond with payment initialization details
      return ApiResponse.sendSuccess(res, "Payment URL created successfully", {
        amount: totalAmount * 100, // Assuming Paystack expects the amount in kobo
        authorizationUrl: authorization_url,
        reference: reference,
        access_code: { accessCode: access_code },
      });
    } else {
      console.error('Paystack failed to initialize payment:', parsedData.message);
      return ApiResponse.sendError(res, 'Failed to create payment URL', 500);
    }
  } catch (error) {
    console.error('Error during payment initialization:', error);
    return ApiResponse.sendError(res, error.message || 'Internal Server Error', 500);
  }
};



const genVerifyPayment = (req, res, next) => {
  const { reference } = req.params;
  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    }
  };

  https.request(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        const paymentStatus = parsedData.data.status;

        if (paymentStatus === 'success') {
          res.json({ success: true, message: 'Payment successful' });
        } else {
          res.status(400).json({ success: false, message: 'Payment failed' });
        }
      } catch (error) {
        console.error('Error parsing response: ', error.message);
        next(error);
      }
    });
  }).on('error', (error) => {
    console.error('Error verifying payment: ', error.message);
    next(error);
  }).end();
};

/**
 * Controller to handle payment verification and update booking status accordingly.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const verifyBookingPayment = async (req, res, next) => {
  const { reference } = req.params;

  try {
    // Verify payment using the payment service
    const verificationResult = await paymentS.verifyPayment(reference);

    if (verificationResult.success) {
      // Payment was successful, update the corresponding booking
      // Assuming the reference is linked to a booking, adjust the logic as needed
      const booking = await Booking.findOne({ reference });

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }

      // Update booking status to 'confirmed' or any other relevant status
      booking.status = 'confirmed';
      booking.payment = true;
      booking.authorizationUrl = verificationResult.data.authorization_url || '';
      booking.reference = verificationResult.data.reference || '';

      await booking.save();

      return res.status(200).json({
        success: true,
        message: 'Payment verified and booking confirmed successfully.',
        data: booking,
      });
    } else {
      // Payment failed, handle accordingly
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed.',
      });
    }
  } catch (error) {
    logger.error(`Error in handlePaymentVerification: ${error.message}`);
    next(error); // Forward the error to the global error handler
  }
};

export { signin, signup, logout, initializePayment, verifyBookingPayment, genVerifyPayment };
