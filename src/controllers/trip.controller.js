import { Trip } from "../models/trip.model.js";
import { validateTripData } from "../lib/validations.util.js";
import mongoose from "mongoose";
import ApiResponse from "../lib/api-reponse.util.js";

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
  const tripData = req.body;

  const validationErrors = validateTripData(tripData);
  if (validationErrors.length > 0) {
    return ApiResponse.sendError(res, "Validation error(s)", 400)

    // return res.status(400).json({ message: "Validation errors", errors: validationErrors });
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
      return ApiResponse.sendError(res, "A trip with the same name, location, and schedule already exists.", 409)
    }

    const trip = new Trip(tripData);
    await trip.save();
    return ApiResponse.sendSuccess(res, "Trip created successfully!", trip, 200)

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

    return ApiResponse.sendSuccess(res, "Available Trips", {
      trips,
      currentPage: Number(page),
      totalPages: Math.ceil(totalTrips / limit),
      totalTrips,
    }, 200)
  } catch (error) {
    next(error);
  }
};

export const getTripById = async (req, res, next) => {
  const { id } = req.params;

  // Validate the ObjectId
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

    const updatedDates = trip.schedule.dates.map(date => {
      const participantsCount = date.participants.length;
      const slotsRemaining = trip.groupSize.max - participantsCount;
      const isAvailable = participantsCount === trip.groupSize.max ? false : true

      return {
        ...date.toObject(),
        slotsRemaining: slotsRemaining >= 0 ? slotsRemaining : 0,
        isAvailable : isAvailable
      };
    });

    const tripObject = trip.toObject();
    tripObject.schedule.dates = updatedDates;

    return ApiResponse.sendSuccess(res, "Trip retrieved successfully.", tripObject, 200);
  } catch (error) {
    return next(error);
  }
};

export const searchTrips = async (req, res, next) => {
  try {
    const {
      type,
      difficulty,
      activityLevel,
      minDays,
      maxDays,
      minNights,
      maxNights,
      minGroupSize,
      maxGroupSize,
      mainLocation,
      pointsOfInterest,
      minPrice,
      maxPrice,
      status,
      startDate,
      endDate,
      search,
      sortBy = "startDate", // default sort
      order = "asc",        // default order
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by difficulty
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Filter by activity level
    if (activityLevel) {
      const levels = Array.isArray(activityLevel) ? activityLevel : [activityLevel];
      query.activityLevel = { $in: levels.map(Number) };
    }

    // Filter by duration
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

    // Filter by group size
    if (minGroupSize || maxGroupSize) {
      query["groupSize.min"] = {};
      if (minGroupSize) query["groupSize.min"].$gte = Number(minGroupSize);
      if (maxGroupSize) query["groupSize.min"].$lte = Number(maxGroupSize);
    }

    if (minGroupSize || maxGroupSize) {
      query["groupSize.max"] = {};
      if (minGroupSize) query["groupSize.max"].$gte = Number(minGroupSize);
      if (maxGroupSize) query["groupSize.max"].$lte = Number(maxGroupSize);
    }

    // Filter by location
    if (mainLocation) {
      query["location.mainLocation"] = { $regex: mainLocation, $options: "i" };
    }

    if (pointsOfInterest) {
      // pointsOfInterest can be a comma-separated list
      const poiArray = pointsOfInterest.split(",").map(poi => poi.trim());
      query["location.pointsOfInterest"] = { $in: poiArray };
    }

    // Filter by cost
    if (minPrice || maxPrice) {
      query["cost.basePrice"] = {};
      if (minPrice) query["cost.basePrice"].$gte = Number(minPrice);
      if (maxPrice) query["cost.basePrice"].$lte = Number(maxPrice);
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by schedule dates
    if (startDate || endDate) {
      query["schedule.dates.startDate"] = {};
      if (startDate) query["schedule.dates.startDate"].$gte = new Date(startDate);
      if (endDate) query["schedule.dates.startDate"].$lte = new Date(endDate);
    }

    // Text search on name and description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Sorting
    const sortOptions = {};
    const sortFields = ["name", "type", "difficulty", "activityLevel", "duration.days", "cost.basePrice", "schedule.dates.startDate"];
    if (sortFields.includes(sortBy)) {
      sortOptions[sortBy] = order === "desc" ? -1 : 1;
    } else {
      // Default sort
      sortOptions["schedule.dates.startDate"] = 1;
    }

    // Execute query
    const [trips, totalTrips] = await Promise.all([
      Trip.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber)
        .populate('participants'),
      Trip.countDocuments(query),
    ]);

    return ApiResponse.sendSuccess(res, "Searched found", {
      trips,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalTrips / limitNumber),
      totalTrips,
    }, 200)

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
