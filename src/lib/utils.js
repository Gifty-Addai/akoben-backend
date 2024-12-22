import { parseISO, isValid, isFuture } from 'date-fns';
import { differenceInYears } from 'date-fns';
import jwt from 'jsonwebtoken';
import  bcrypt  from 'bcryptjs';
import crypto from 'crypto';


export const generateToken = (userId, res) => {
  const token = jwt.sign(
    { userId: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};


export const toProperCase = (str) => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};



/**
 * Parses and validates a date input.
 *
 * @param {string|Date} dateInput - The date to parse.
 * @returns {Date} - A valid Date object.
 * @throws {Error} - If the date is invalid or in the future.
 */
export const parseAndValidateDate = (dateInput) => {
  let date;
  if (typeof dateInput === 'string') {
    date = parseISO(dateInput);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    throw new TypeError(`Invalid type for dateInput: ${typeof dateInput}`);
  }

  if (!isValid(date)) {
    throw new Error('Invalid date format.');
  }

  if (isFuture(date)) {
    throw new Error('Date of birth cannot be in the future.');
  }

  return date;
};

/**
 * Calculates age based on date of birth.
 *
 * @param {Date} dob - Date of birth.
 * @returns {number} - Calculated age.
 * @throws {TypeError} - If dob is not a valid Date object.
 */
export const calculateAge = (dob) => {
  if (!(dob instanceof Date) || isNaN(dob)) {
    throw new TypeError('Invalid Date object provided to calculateAge');
  }
  return differenceInYears(new Date(), dob);
};


/**
 * 
 * @returns - Random 16 hex value
 */
export const generateRandomPassword = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Hashes a given value using bcrypt.
 *
 * @param {string} value - The value to hash.
 * @returns {Promise<string>} - The hashed value.
 */
export const hashValue = async (value) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(value, salt);
};   
