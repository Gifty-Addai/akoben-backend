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

    console.log("send opt response",response)
    if (response.data.code !== "1000") {
      throw new Error(response.data.message);
    }
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
    if (response.data.message !== "Successful") {
      throw new Error(response.data.message);
    }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to verify OTP.");
  }
};
