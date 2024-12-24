import { Trip } from "../models/trip.model.js";
import { validateTripData } from "../lib/validations.util.js";
import mongoose from "mongoose";
import ApiResponse from "../lib/api-reponse.util.js";
import { validateSingleTripData } from "../lib/validation/trip.validation.js";

export const createTrips = async (req, res, next) => {
  const trips = req.body;

  if (!Array.isArray(trips) || trips.length === 0) {
    return ApiResponse.sendError(res, "A valid array of trips must be provided", 400)
  }

  const createdTrips = [];
  const errors = [];

  for (const tripData of trips) {
    const validationErrors = validateTripData(tripData);
    if (validationErrors.length > 0) {
      errors.push({ tripData, errors: validationErrors });
      continue;
    }

    try {
      const existingTrip = await Trip.findOne({
        name: tripData.name,
        'location.mainLocation': tripData.location.mainLocation,
        'schedule.dates.startDate': { $gte: tripData.schedule.dates[0].startDate },
        'schedule.dates.endDate': { $lte: tripData.schedule.dates[0].endDate },
        type: tripData.type
      });

      if (existingTrip) {
        errors.push({ tripData, error: "Duplicate trip found." });
        continue;
      }

      const trip = new Trip(tripData);
      const savedTrip = await trip.save();
      createdTrips.push(savedTrip);
    } catch (error) {
      console.error("Error saving trip:", error);
      errors.push({ tripData, error: "Error saving trip." });
    }
  }

  if (createdTrips.length > 0) {
    return ApiResponse.sendSuccess(res, "A valid array of trips must be provided", createdTrips, 200)
  }
  if (errors.length > 0) {
    return ApiResponse.sendError(res, "Some trips could not be created due to validation errors.", 400)

    // res.status(400).json({ message: "Some trips could not be created due to validation errors.", errors });
  }
};

export const createTrip = async (req, res, next) => {
  const {
    basicInfo,
    typeAndDifficulty,
    duration,
    cost,
    groupSize,
    activityLevel,
    location,
    schedule,
    logistics,
    images
  } = req.body;

  // Combine all nested data into a single object for validation and saving
  const tripData = {
    name: basicInfo?.name,
    description: basicInfo?.description,
    type: typeAndDifficulty?.type,
    difficulty: typeAndDifficulty?.difficulty,
    activityLevel: activityLevel?.activityLevel,
    duration: {
      days: duration?.days,
      nights: duration?.nights
    },
    groupSize: {
      min: groupSize?.min,
      max: groupSize?.max
    },
    cost: {
      basePrice: cost?.basePrice,
      discount: cost?.discount
    },
    location: {
      mainLocation: location?.mainLocation,
      pointsOfInterest: location?.pointsOfInterest?.map(poi => poi.value)
    },
    schedule: {
      dates: schedule?.dates,
      itinerary: schedule?.itinerary
    },
    logistics: {
      transportation: logistics?.transportation,
      gearProvided: logistics?.gearProvided,
      accommodation: logistics?.accommodation
    },
    images: images?.map(image => image.url)
  };

  // Validate the data
  const validationErrors = validateSingleTripData(tripData);
  if (validationErrors.length > 0) {
    return ApiResponse.sendError(res, validationErrors.map(err => `${err.field}: ${err.message}`).join(", "), 400);
  }

  try {
    // Check if a similar trip already exists
    const existingTrip = await Trip.findOne({
      name: tripData.name,
      'location.mainLocation': tripData.location.mainLocation,
      'schedule.dates.startDate': { $gte: tripData.schedule.dates[0]?.startDate },
      'schedule.dates.endDate': { $lte: tripData.schedule.dates[0]?.endDate },
      type: tripData.type
    });

    if (existingTrip) {
      return ApiResponse.sendError(
        res,
        "A trip with the same name, location, and schedule already exists.",
        409
      );
    }

    // Create and save the new trip
    const trip = new Trip(tripData);
    await trip.save();

    return ApiResponse.sendSuccess(res, "Trip created successfully!", trip, 200);
  } catch (error) {
    next(error);
  }
};


export const getTripById = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return ApiResponse.sendError(res, "Invalid Trip ID provided.", 400);
  }

  try {
    const trip = await Trip.findById(id)
      .populate({
        path: 'schedule.dates.participants',
        select: 'name email'
      })
      .exec();

    if (!trip) {
      return ApiResponse.sendError(res, "Trip not found.", 404);
    }

    const tripObject = trip.toObject();
    tripObject.images = tripObject.images.map(image => ({ url: image }));

    const updatedDates = trip.schedule.dates.map(date => {
      const participantsCount = date.participants.length;
      const slotsRemaining = trip.groupSize.max - participantsCount;
      const isAvailable = participantsCount < trip.groupSize.max;

      return {
        ...date.toObject(),
        slotsRemaining: slotsRemaining >= 0 ? slotsRemaining : 0,
        isAvailable,
      };
    });

    tripObject.schedule.dates = updatedDates;

    return ApiResponse.sendSuccess(res, "Trip retrieved successfully.", tripObject, 200);
  } catch (error) {
    next(error);
  }
};

export const getAllTrips = async (req, res, next) => {
  const { page = 1, limit = 10, type, difficulty } = req.query;

  try {
    const filters = {};
    if (type) filters.type = type;
    if (difficulty) filters.difficulty = difficulty;

    const skip = (page - 1) * limit;
    const trips = await Trip.find(filters).skip(skip).limit(Number(limit));
    const totalTrips = await Trip.countDocuments(filters);

    const tripsWithFormattedImages = trips.map(trip => {
      const tripObject = trip.toObject();
      tripObject.images = tripObject.images.map(image => ({ url: image }));
      return tripObject;
    });

    return ApiResponse.sendSuccess(res, "Available Trips", {
      trips: tripsWithFormattedImages,
      currentPage: Number(page),
      totalPages: Math.ceil(totalTrips / limit),
      totalTrips,
    }, 200);
  } catch (error) {
    next(error);
  }
};

export const searchTrips = async (req, res, next) => {
  try {
    const {
      type, difficulty, activityLevel, minDays, maxDays, minNights, maxNights,
      minGroupSize, maxGroupSize, mainLocation, pointsOfInterest, minPrice, maxPrice,
      status, startDate, endDate, search, sortBy = "startDate", order = "asc",
      page = 1, limit = 10
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (activityLevel) query.activityLevel = { $in: [].concat(activityLevel).map(Number) };
    if (minDays || maxDays) {
      query["duration.days"] = {};
      if (minDays) query["duration.days"].$gte = Number(minDays);
      if (maxDays) query["duration.days"].$lte = Number(maxDays);
    }
    if (minNights || maxNights) {
      query["duration.nights"] = {};
      if (minNights) query["duration.nights"].$gte = Number(minNights);
      if (maxNights) query["duration.nights"].$lte = Number(maxNights);
    }
    if (minGroupSize || maxGroupSize) {
      query["groupSize.max"] = {};
      if (minGroupSize) query["groupSize.max"].$gte = Number(minGroupSize);
      if (maxGroupSize) query["groupSize.max"].$lte = Number(maxGroupSize);
    }
    if (mainLocation) {
      query["location.mainLocation"] = { $regex: mainLocation, $options: "i" };
    }
    if (pointsOfInterest) {
      const poiArray = pointsOfInterest.split(",").map(poi => poi.trim());
      query["location.pointsOfInterest"] = { $in: poiArray };
    }
    if (minPrice || maxPrice) {
      query["cost.basePrice"] = {};
      if (minPrice) query["cost.basePrice"].$gte = Number(minPrice);
      if (maxPrice) query["cost.basePrice"].$lte = Number(maxPrice);
    }
    if (status) query.status = status;
    if (startDate || endDate) {
      query["schedule.dates.startDate"] = {};
      if (startDate) query["schedule.dates.startDate"].$gte = new Date(startDate);
      if (endDate) query["schedule.dates.startDate"].$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const sortOptions = {};
    if (["name", "type", "difficulty", "activityLevel", "duration.days", "cost.basePrice", "schedule.dates.startDate"].includes(sortBy)) {
      sortOptions[sortBy] = order === "desc" ? -1 : 1;
    } else {
      sortOptions["schedule.dates.startDate"] = 1;
    }

    const [trips, totalTrips] = await Promise.all([
      Trip.find(query).sort(sortOptions).skip(skip).limit(limitNumber),
      Trip.countDocuments(query),
    ]);

    const tripsWithFormattedImages = trips.map(trip => {
      const tripObject = trip.toObject();
      tripObject.images = tripObject.images.map(image => ({ url: image }));
      return tripObject;
    });

    return ApiResponse.sendSuccess(res, "Searched trips found", {
      trips: tripsWithFormattedImages,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalTrips / limitNumber),
      totalTrips,
    }, 200);
  } catch (error) {
    next(error);
  }
};



export const updateTrip = async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return ApiResponse.sendError(res, "Invalid Id", 400)
  }

  const validationErrors = validateTripUpdateData(updates);
  if (validationErrors.length > 0) {
    return ApiResponse.sendError(res, "Validation error(s)", 400)
  }

  try {
    const trip = await Trip.findByIdAndUpdate(id, updates, { new: true });
    if (!trip) {
      return ApiResponse.sendError(res, "Trip not found", 404)
    }

    return ApiResponse.sendSuccess(res, "Trip uppdated successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return ApiResponse.sendError(res, "Invalid trip ID", 400)
  }

  try {
    const trip = await Trip.findByIdAndDelete(id);
    if (!trip) {
      return ApiResponse.sendError(res, "Trip not found", 404)
    }
    return ApiResponse.sendSuccess(res, "Trip deleted successfully", 200)
  } catch (error) {
    next(error);
  }
};
