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

    res.json({ message: 'Login successful', user:{id:user._id, name:user.name,role:user.role}, token });
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

export { signin, signup, logout };
