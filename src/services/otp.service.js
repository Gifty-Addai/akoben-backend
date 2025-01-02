import axios from 'axios';

export const sendOTP = async (number, messageTemplate = 'This is your OTP, %otp_code%') => {
  if (!/^\d{12}$/.test(number)) {
    throw new Error("Invalid phone number format.");
  }

  const data = {
    expiry: 5,
    length: 6,
    medium: 'sms',
    message: messageTemplate,
    number,
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

  if (!/^\d{12}$/.test(number)) {
    throw new Error("Invalid phone number format.");
  }

  const data = {
    api_key: process.env.ARKESEL_KEY,
    code,
    number,
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
