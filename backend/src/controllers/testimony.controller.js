import Testimony from '../models/testimony.model.js';

export const createTestimony = async (req, res, next) => {
  const { user, message, rating, location } = req.body;

  if (!message || !rating) {
    return res.status(400).json({ message: "Message and rating are required." });
  }

  if (message.length < 10) {
    return res.status(400).json({ message: "Message must be at least 10 characters long." });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  try {
    const testimony = new Testimony({
      user,
      message,
      rating,
      location,
    });

    await testimony.save();
    res.status(201).json({ message: 'Testimony created successfully!', testimony });
  } catch (error) {
    next(error);
  }
};


export const getAllTestimonies = async (req, res, next) => {
    try {
      const testimonies = await Testimony.find().populate('user', 'name email');
      res.status(200).json(testimonies);
    } catch (error) {
      next(error);
    }
  };

  
  export const getTestimonyById = async (req, res, next) => {
    const { id } = req.params;
  
    try {
      const testimony = await Testimony.findById(id).populate('user', 'name email');
  
      if (!testimony) {
        return res.status(404).json({ message: `Testimony with id: ${id} not found` });
      }
  
      res.status(200).json(testimony);
    } catch (error) {
      next(error);
    }
  };

  
  export const updateTestimony = async (req, res, next) => {
    const { id } = req.params;
    const { message, rating, location } = req.body;
  
    if (message && message.length < 10) {
      return res.status(400).json({ message: "Message must be at least 10 characters long." });
    }
  
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }
  
    try {
      const updatedTestimony = await Testimony.findByIdAndUpdate(
        id,
        { $set: { message, rating, location } },
        { new: true }
      );
  
      if (!updatedTestimony) {
        return res.status(404).json({ message: `Testimony with id: ${id} not found` });
      }
  
      res.status(200).json({ message: 'Testimony updated successfully!', testimony: updatedTestimony });
    } catch (error) {
      next(error);
    }
  };

  
  export const deleteTestimony = async (req, res, next) => {
    const { id } = req.params;
  
    try {
      const deletedTestimony = await Testimony.findByIdAndDelete(id);
  
      if (!deletedTestimony) {
        return res.status(404).json({ message: `Testimony with id: ${id} not found` });
      }
  
      res.status(200).json({ message: 'Testimony deleted successfully!' });
    } catch (error) {
      next(error);
    }
  };

  
  export const searchTestimonies = async (req, res, next) => {
    const { user, location, minRating, maxRating } = req.query;
  
    try {
      const filters = {};
  
      if (user) filters.user = user;
      if (location) filters.location = { $regex: location, $options: 'i' }; // Case-insensitive search
      if (minRating) filters.rating = { ...filters.rating, $gte: Number(minRating) };
      if (maxRating) filters.rating = { ...filters.rating, $lte: Number(maxRating) };
  
      const testimonies = await Testimony.find(filters).populate('user', 'name email');
      res.status(200).json(testimonies);
    } catch (error) {
      next(error);
    }
  };
  