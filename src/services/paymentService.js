import axios from 'axios';
/**
 * Verifies a payment using Paystack API.
 *
 * @param {string} reference - The payment reference to verify.
 * @returns {Promise<Object>} - Resolves with payment verification details.
 * @throws {Error} - Throws an error if verification fails.
 */
const verifyPayment = async (reference) => {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('Paystack secret key is not defined in environment variables.');
  }

  const url = `https://api.paystack.co/transaction/verify/${reference}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 5000, // Optional: Set a timeout for the request
    });

    const { data } = response.data;

    if (!data) {
      throw new Error('No data returned from Paystack.');
    }

    const paymentStatus = data.status;

    return {
      success: data.status === 'success',
      message: data.status === 'success' ? 'Payment successful' : 'Payment failed',
      data,
    };
  } catch (error) {
    // Customize error messages based on error type
    if (error.response) {
      // Paystack responded with a status other than 2xx
      throw new Error(
        `Paystack API error: ${error.response.status} - ${error.response.data.message}`
      );
    } else if (error.request) {
      // No response received from Paystack
      throw new Error('No response received from Paystack.');
    } else {
      // Other errors
      throw new Error(`Payment verification error: ${error.message}`);
    }
  }
};

export default {
  verifyPayment,
};
