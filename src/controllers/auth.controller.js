import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { generateToken } from '../lib/utils.js';

const signup = async (req, res, next) => {
  console.log('Request Body:', req.body);
  const { name, email, password, phone } = req.body;

  if (!email || !password || !name || !phone) {
    return res.status(400).json({ message: 'All fields are required!' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    await newUser.save();

    // send a verification email here

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required!' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, res);

    res.json({ message: 'Login successful', user: { id: user._id, name: user.name, role: user.role }, token });
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

import https from 'https';  

const initializePayment = async (req, res, next) => {
  const { amount, email, phone } = req.body;

  // Validate input fields
  if (!amount || !email || !phone) {
    return res.status(400).json({ message: 'Amount, email, and phone are required!' });
  }

  console.log("Initializing payment...");
  console.log("Paystack Secret Key:", process.env.PAYSTACK_SECRET_KEY);

  const params = JSON.stringify({
    email: email,
    amount: amount,
    // phone: phone,  // Include phone if it's part of your request
    currency: 'GHS',
    channels: ['mobile_money'],
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

  const reqPaystack = https.request(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    // Once response is completed
    response.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        console.log(parsedData); 

        if (parsedData.status) {
          const { authorization_url, reference,access_code } = parsedData.data;
          return res.json({
            success: true,
            message: 'Payment URL created successfully',
            authorizationUrl: authorization_url,
            reference: reference,
            access_code:{ accessCode: access_code }
          });
        } else {
          return res.status(500).json({ success: false, message: 'Failed to create payment URL' });
        }
      } catch (error) {
        console.error('Error parsing response:', error);
        return res.status(500).json({ success: false, message: 'Failed to parse response', error: error.message });
      }
    });
  });

  // Handle request error
  reqPaystack.on('error', (error) => {
    console.error('Request failed:', error);
    return res.status(500).json({ success: false, message: 'Payment initialization failed', error: error.message });
  });

  // Write parameters to the request body
  reqPaystack.write(params);

  // End the request
  reqPaystack.end();
};



const verifyPayment = async (req, res, next) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentStatus = response.data.data.status;
    if (paymentStatus === 'success') {
      // Payment was successful, update order status
      return res.json({ success: true, message: 'Payment successful', data: response.data.data });
    } else {
      return res.status(400).json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    console.error('Error verifying payment: ', error.response?.data || error.message);
    next(error);
  }
}

export { signin, signup, logout, initializePayment, verifyPayment };
