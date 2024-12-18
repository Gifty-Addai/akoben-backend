import { Trip } from "../models/trip.model.js";
import { validateTripData } from "../lib/validations.util.js";
import mongoose from "mongoose";

export const createTrips = async (req, res, next) => {
  const trips = req.body;

  if (!Array.isArray(trips) || trips.length === 0) {
    return res.status(400).json({ message: "A valid array of trips must be provided." });
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
    res.status(201).json({ message: "Trips created successfully!", trips: createdTrips });
  }
  if (errors.length > 0) {
    res.status(400).json({ message: "Some trips could not be created due to validation errors.", errors });
  }
};

export const createTrip = async (req, res, next) => {
  const tripData = req.body;

  const validationErrors = validateTripData(tripData);
  if (validationErrors.length > 0) {
    return res.status(400).json({ message: "Validation errors", errors: validationErrors });
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
      return res.status(409).json({ message: "A trip with the same name, location, and schedule already exists." });
    }

    const trip = new Trip(tripData);
    await trip.save();
    res.status(201).json({ message: "Trip created successfully!", trip });
  } catch (error) {
    console.error("Error creating trip:", error);
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

    res.status(200).json({
      trips,
      currentPage: Number(page),
      totalPages: Math.ceil(totalTrips / limit),
      totalTrips,
    });
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Internal server error while fetching trips." });
    next(error);
  }
};

export const getTripById = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: `Invalid trip ID: ${id}` });
  }

  try {
    const trip = await Trip.findById(id).populate('participants');
    if (!trip) {
      return res.status(404).json({ message: `Trip with id: ${id} not found` });
    }

    trip.schedule.dates = trip.schedule.dates.map(date => ({
      ...date.toObject(),
      slotsRemaining: trip.groupSize.max - trip.participants.length
    }));

    res.status(200).json(trip);
  } catch (error) {
    console.error("Error fetching trip by ID:", error);
    res.status(500).json({ message: "Internal server error while fetching trip." });
    next(error);
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

    res.status(200).json({
      trips,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalTrips / limitNumber),
      totalTrips,
    });
  } catch (error) {
    console.error("Error searching trips:", error);
    res.status(500).json({ message: "Internal server error while searching trips." });
    next(error);
  }
};


export const updateTrip = async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: `Invalid trip ID: ${id}` });
  }

  const validationErrors = validateTripUpdateData(updates);
  if (validationErrors.length > 0) {
    return res.status(400).json({ message: "Validation errors", errors: validationErrors });
  }

  try {
    const trip = await Trip.findByIdAndUpdate(id, updates, { new: true });
    if (!trip) {
      return res.status(404).json({ message: `Trip with id: ${id} not found` });
    }
    res.status(200).json({ message: "Trip updated successfully!", trip });
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ message: "Internal server error while updating trip." });
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: `Invalid trip ID: ${id}` });
  }

  try {
    const trip = await Trip.findByIdAndDelete(id);
    if (!trip) {
      return res.status(404).json({ message: `Trip with id: ${id} not found` });
    }
    res.status(200).json({ message: "Trip deleted successfully!" });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ message: "Internal server error while deleting trip." });
    next(error);
  }
};
