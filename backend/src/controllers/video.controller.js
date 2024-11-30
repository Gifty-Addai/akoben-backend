import Video from '../models/video.model.js';

export const createVideo = async (req, res, next) => {
  const { title, description, videoUrl, createdBy } = req.body;

  if (!title || !description || !videoUrl || !createdBy) {
    return res.status(400).json({ message: "Title, description, videoUrl, and createdBy are required." });
  }

  try {
    const video = new Video({
      title,
      description,
      videoUrl,
      createdBy,
    });

    await video.save();
    res.status(201).json({ message: 'Video created successfully!', video });
  } catch (error) {
    next(error);
  }
};


export const getAllVideos = async (req, res, next) => {
    try {
      const videos = await Video.find().populate('createdBy', 'name email');
      res.status(200).json(videos);
    } catch (error) {
      next(error);
    }
  };

  
  export const getVideoById = async (req, res, next) => {
    const { id } = req.params;
  
    try {
      const video = await Video.findById(id).populate('createdBy', 'name email');
  
      if (!video) {
        return res.status(404).json({ message: `Video with id: ${id} not found` });
      }
  
      res.status(200).json(video);
    } catch (error) {
      next(error);
    }
  };

  
  export const updateVideo = async (req, res, next) => {
    const { id } = req.params;
    const { title, description, videoUrl } = req.body;
  
    if (!title && !description && !videoUrl) {
      return res.status(400).json({ message: "At least one field (title, description, videoUrl) must be provided to update." });
    }
  
    try {
      const updatedVideo = await Video.findByIdAndUpdate(
        id,
        { $set: { title, description, videoUrl } },
        { new: true }
      );
  
      if (!updatedVideo) {
        return res.status(404).json({ message: `Video with id: ${id} not found` });
      }
  
      res.status(200).json({ message: 'Video updated successfully!', video: updatedVideo });
    } catch (error) {
      next(error);
    }
  };

  
  export const deleteVideo = async (req, res, next) => {
    const { id } = req.params;
  
    try {
      const deletedVideo = await Video.findByIdAndDelete(id);
  
      if (!deletedVideo) {
        return res.status(404).json({ message: `Video with id: ${id} not found` });
      }
  
      res.status(200).json({ message: 'Video deleted successfully!' });
    } catch (error) {
      next(error);
    }
  };

  
  export const searchVideos = async (req, res, next) => {
    const { title, description, createdBy } = req.query;
  
    try {
      const filters = {};
  
      if (title) filters.title = { $regex: title, $options: 'i' }; // Case-insensitive search
      if (description) filters.description = { $regex: description, $options: 'i' };
      if (createdBy) filters.createdBy = createdBy;
  
      const videos = await Video.find(filters).populate('createdBy', 'name email');
      res.status(200).json(videos);
    } catch (error) {
      next(error);
    }
  };

  