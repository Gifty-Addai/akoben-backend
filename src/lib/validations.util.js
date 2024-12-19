// export const validateBookingData = (data) => {
//   const errors = [];

//   if (!data.user) errors.push("User ID is required.");
//   if (!data.trip) errors.push("Trip ID is required.");
//   if (!data.campingDate) errors.push("Camping date is required.");
//   if (!data.numberOfPeople || data.numberOfPeople <= 0) errors.push("Number of people must be greater than zero.");
//   if (!data.totalCost || data.totalCost < 0) errors.push("Total cost must be a valid number.");

//   return errors;
// };

// lib/validations.util.js

import mongoose from 'mongoose';

/**
 * Validates whether a given string is a valid MongoDB ObjectId.
 *
 * @param {String} id - The ID to validate.
 * @returns {Boolean} - Returns true if valid, false otherwise.
 */
export const validateObjectId = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);

  if (!isValid) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Invalid ObjectId detected: ${id}`);
    }
    return false;
  }

  return true;
};


export const validateTripData = (data) => {
  const errors = [];

  if (!data.name) errors.push("Trip name is required.");
  if (!data.description) errors.push("Trip description is required.");

  if (!data.type || !['hiking', 'camping', 'mountaineering', 'other'].includes(data.type)) {
    errors.push("Trip type must be one of the following: hiking, camping, mountaineering, other.");
  }

  if (!data.difficulty || !['easy', 'moderate', 'hard', 'expert'].includes(data.difficulty)) {
    errors.push("Trip difficulty must be one of the following: easy, moderate, hard, expert.");
  }

  if (!data.duration || typeof data.duration !== 'object' || !data.duration.days || !data.duration.nights) {
    errors.push("Trip duration with valid days and nights is required.");
  }

  if (!data.groupSize || typeof data.groupSize !== 'object' || !data.groupSize.min || !data.groupSize.max) {
    errors.push("Group size with valid minimum and maximum numbers is required.");
  }

  if (!data.location || !data.location.mainLocation) {
    errors.push("Main location is required.");
  }

  if (!data.cost || typeof data.cost !== 'object' || !data.cost.basePrice) {
    errors.push("Base price for the trip is required.");
  }

  if (!data.schedule || !Array.isArray(data.schedule.dates) || data.schedule.dates.length === 0) {
    errors.push("Trip schedule with at least one start and end date is required.");
  } else {
    data.schedule.dates.forEach((date, index) => {
      if (!date.startDate) {
        errors.push(`Start date is required for schedule at index ${index}.`);
      }
      if (!date.endDate) {
        errors.push(`End date is required for schedule at index ${index}.`);
      }
      if (date.startDate && date.endDate && new Date(date.startDate) >= new Date(date.endDate)) {
        errors.push(`End date must be after start date for schedule at index ${index}.`);
      }
      if (!('slotsRemaining' in date) || date.slotsRemaining < 0) {
        errors.push(`Slots remaining must be a non-negative number for schedule at index ${index}.`);
      }
    });
  }

  return errors;
};


export const validateBookingData = (data) => {
  const errors = [];
  
  // Validate personalInfo
  if (!data.personalInfo) {
    errors.push("Personal information is required.");
  } else {
    const { firstName, lastName, email, phone } = data.personalInfo;
    if (!firstName || !lastName) {
      errors.push("First name and last name are required.");
    }
    if (!email) {
      errors.push("Email is required.");
    } else {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(email)) {
        errors.push("Invalid email format.");
      }
    }
    if (!phone) {
      errors.push("Phone number is required.");
    }
  }

  // Validate travelDetails
  if (!data.travelDetails) {
    errors.push("Travel details are required.");
  } else {
    const { streetAddress, city } = data.travelDetails;
    if (!streetAddress) {
      errors.push("Street address is required.");
    }
    if (!city) {
      errors.push("City is required.");
    }
  }

  // Validate tripId and selectedDate
  if (!data.tripId) {
    errors.push("Trip ID is required.");
  }
  if (!data.selectedDate) {
    errors.push("Selected date ID is required.");
  }

  // Validate numberOfPeople and totalCost
  if (!data.numberOfPeople || data.numberOfPeople < 1) {
    errors.push("Number of people must be at least 1.");
  }
  // if (!data.totalCost || data.totalCost < 0) {
  //   errors.push("Total cost must be a positive number.");
  // }

  return errors;
};

