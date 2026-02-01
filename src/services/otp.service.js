import axios from 'axios';

export const sendOTP = async (number, messageTemplate = 'This is your OTP, %otp_code%') => {
  // Normalize: Remove invalid chars
  let formattedNumber = number.toString().replace(/\D/g, '');

  // Handle local Ghana numbers (024... -> 23324...)
  if (formattedNumber.length === 10 && formattedNumber.startsWith('0')) {
    formattedNumber = '233' + formattedNumber.substring(1);
  }

  if (!/^\d{12}$/.test(formattedNumber)) {
    console.error(`Invalid phone format received: ${number} -> ${formattedNumber}`);
    throw new Error("Invalid phone number format. Must be 12 digits (e.g. 233...)");
  }

  // Use the formatted number for the request
  const data = {
    expiry: 5,
    length: 6,
    medium: 'sms',
    message: messageTemplate,
    number: formattedNumber,
    sender_id: 'Fie ne Fie',
    type: 'numeric',
  };

  const headers = {
    'api-key': process.env.ARKESEL_KEY,
  };

  try {
    const response = await axios.post('https://sms.arkesel.com/api/otp/generate', data, { headers });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to send OTP.");
  }
};

export const verifyOTP = async (number, code) => {

  // Normalize: Remove invalid chars
  let formattedNumber = number.toString().replace(/\D/g, '');

  // Handle local Ghana numbers (024... -> 23324...)
  if (formattedNumber.length === 10 && formattedNumber.startsWith('0')) {
    formattedNumber = '233' + formattedNumber.substring(1);
  }

  if (!/^\d{12}$/.test(formattedNumber)) {
    throw new Error("Invalid phone number format.");
  }

  const data = {
    api_key: process.env.ARKESEL_KEY,
    code,
    number: formattedNumber,
  };

  const headers = {
    'api-key': process.env.ARKESEL_KEY,
  };

  try {
    const response = await axios.post('https://sms.arkesel.com/api/otp/verify', data, { headers });

    return response.data;
  } catch (error) {
    console.log("error", error)
    throw new Error(error.response?.data?.message || "Failed to verify OTP.");
  }
};
