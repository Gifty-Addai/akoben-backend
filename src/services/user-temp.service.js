import User from '../models/user.model.js';
import { calculateAge, generateRandomPassword, hashValue, parseAndValidateDate } from "../lib/utils.js";
import { diceCoefficient } from 'dice-coefficient';

/**
 * Function to check for a temporary user or create a new one based on similarity.
 *
 * @param {string} fullName - Full name of the user.
 * @param {string} phone - Phone number of the user.
 * @param {string} email - Email address of the user.
 * @param {string|Date} [dob] - Date of birth of the user.
 * @param {string} [gender] - Gender of the user.
 * @param {string} [streetAddress] - Street address of the user.
 * @param {string} [address2] - Additional address information.
 * @param {string} [city] - City of the user.
 * @param {string} [zipCode] - ZIP code of the user.
 * @param {string} [idCard] - ID card information (optional).
 *
 * @returns {Promise<Object>} - The existing or newly created user.
 * @throws {Error} - If `dob` is invalid.
 */
export const checkTempUser = async (
  fullName,
  phone,
  email,
  dob = null,
  gender = null,
  streetAddress = null,
  address2 = null,
  city = null,
  zipCode = null,
  idCard = null
) => {
  try {
    // Normalize and trim inputs
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedPhone = phone.trim();
    const trimmedFullName = fullName.trim();

    // Define the fields that can be updated
    const fieldsToUpdate = ['dob', 'gender', 'streetAddress', 'address2', 'city', 'zipCode', 'idCard'];

    // Prepare a map of new values
    const newValues = { dob, gender, streetAddress, address2, city, zipCode, idCard };

    // Search for existing users based on name, email, or phone
    const existingUsers = await User.find({
      $or: [
        { name: trimmedFullName },
        { email: normalizedEmail },
        { phone: trimmedPhone }
      ]
    });

    // Iterate through existing users to find a similar one
    for (const user of existingUsers) {
      const nameSimilarity = diceCoefficient(trimmedFullName.toLowerCase(), user.name.toLowerCase());
      const emailSimilarity = diceCoefficient(normalizedEmail, user.email.toLowerCase());
      const phoneSimilarity = diceCoefficient(trimmedPhone, user.phone.trim());

      if (nameSimilarity >= 0.8 && emailSimilarity >= 0.8 && phoneSimilarity >= 0.8) {
        let isUpdated = false;

        // Iterate through each field to check and update if necessary
        for (const field of fieldsToUpdate) {
          if (user[field] === null && newValues[field] !== null) {
            if (field === 'dob') {
              const dobDate = parseAndValidateDate(newValues[field]);
              user[field] = dobDate;
              user.age = calculateAge(dobDate);
            } else {
              user[field] = newValues[field].trim();
            }
            isUpdated = true;
          }
        }

        // Save the user if any field was updated
        if (isUpdated) {
          await user.save();
        }

        return user;
      }
    }

    // If no similar user is found, create a new user
    let parsedDob = null;
    let calculatedAge = null;

    if (dob) {
      parsedDob = parseAndValidateDate(dob);
      calculatedAge = calculateAge(parsedDob);
    }

    const plainPassword = generateRandomPassword();
    const hashedPassword = await hashValue(plainPassword);

    const newUser = new User({
      name: trimmedFullName,
      email: normalizedEmail,
      password: hashedPassword,
      phone: trimmedPhone,
      bookings: [],
      streetAddress: streetAddress ? streetAddress.trim() : null,
      address2: address2 ? address2.trim() : null,
      city: city ? city.trim() : null,
      zipCode: zipCode ? zipCode.trim() : null,
      dob: parsedDob,
      age: calculatedAge,
      gender: gender ? gender.trim() : null,
      idCard: idCard ? idCard.trim() : null,
    });

    await newUser.save();

    // Optionally, you might want to send the plainPassword to the user securely here

    return newUser;
  } catch (error) {
    // Handle or propagate the error as needed
    throw error;
  }
};
