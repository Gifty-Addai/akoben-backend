import Video from '../models/video.model.js';
import ApiResponse from '../lib/api-reponse.util.js';
import User from '../models/user.model.js';

// Default initial videos to seed if database is empty
const defaultVideos = [
  {
    title: "Cooking with Goat Tallow",
    description: "Learn how goat tallow elevates traditional recipes with unique health benefits and taste.",
    category: "Cooking Oils",
    thumbnail: "/thumbnails/cooking-1.jpg",
    videoUrl: "",
    embedUrl: ""
  },
  {
    title: "Beef Tallow Recipes",
    description: "Discover the high smoke point and rich savory taste of cooking with grass-fed beef tallow.",
    category: "Cooking Oils",
    thumbnail: "/thumbnails/cooking-2.jpg",
    videoUrl: "",
    embedUrl: ""
  },
  {
    title: "Tallow Skin Care Routine",
    description: "A natural skincare approach using whipped tallow to nourish and revitalize sensitive skin.",
    category: "Skin Care",
    thumbnail: "/thumbnails/skincare-1.jpg",
    videoUrl: "",
    embedUrl: "https://player.cloudinary.com/embed/?cloud_name=dyua9sfez&public_id=Snapchat-926365825_skyuqb&player[muted]=true&player[autoplay]=true&player[loop]=true"
  },
  {
    title: "Hair Treatment",
    description: "Deep conditioning tallow hair mask recipe for soft, shiny, and strong hair strands.",
    category: "Hair Care",
    thumbnail: "/thumbnails/hair-1.jpg",
    videoUrl: "",
    embedUrl: ""
  }
];

export const createVideo = async (req, res, next) => {
  const { title, description, category, thumbnail, videoUrl, embedUrl } = req.body;
  const createdBy = req.user ? req.user.id : null;

  if (!title || !description || !category || !thumbnail) {
    return ApiResponse.sendError(res, "Title, description, category, and thumbnail are required.", 400);
  }

  try {
    const videoCount = await Video.countDocuments();
    if (videoCount >= 4) {
      return ApiResponse.sendError(res, "Maximum of 4 videos allowed.", 400);
    }

    const video = new Video({
      title,
      description,
      category,
      thumbnail,
      videoUrl: videoUrl || "",
      embedUrl: embedUrl || "",
      createdBy,
    });

    await video.save();
    return ApiResponse.sendSuccess(res, 'Video created successfully!', video, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllVideos = async (req, res, next) => {
  try {
    let videos = await Video.find().populate('createdBy', 'name email');

    if (videos.length === 0) {
      // Find an admin user to associate the seeded videos with, if any exists
      const adminUser = await User.findOne({ role: 'admin' }) || await User.findOne();
      const creatorId = adminUser ? adminUser._id : null;

      const seededVideos = defaultVideos.map(vid => ({
        ...vid,
        createdBy: creatorId
      }));

      await Video.insertMany(seededVideos);
      videos = await Video.find().populate('createdBy', 'name email');
    }

    return ApiResponse.sendSuccess(res, "Videos fetched successfully", videos);
  } catch (error) {
    next(error);
  }
};

export const getVideoById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const video = await Video.findById(id).populate('createdBy', 'name email');

    if (!video) {
      return ApiResponse.sendError(res, `Video with id: ${id} not found`, 404);
    }

    return ApiResponse.sendSuccess(res, "Video fetched successfully", video);
  } catch (error) {
    next(error);
  }
};

export const updateVideo = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, category, thumbnail, videoUrl, embedUrl } = req.body;

  // Build update object — only include fields that were explicitly sent
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (category !== undefined) updates.category = category;
  if (thumbnail !== undefined) updates.thumbnail = thumbnail;
  // Allow clearing videoUrl/embedUrl by passing "" explicitly,
  // but never let undefined wipe an existing value
  if (videoUrl !== undefined) updates.videoUrl = videoUrl;
  if (embedUrl !== undefined) updates.embedUrl = embedUrl;

  if (Object.keys(updates).length === 0) {
    return ApiResponse.sendError(res, "At least one field must be provided to update.", 400);
  }

  try {
    const updatedVideo = await Video.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!updatedVideo) {
      return ApiResponse.sendError(res, `Video with id: ${id} not found`, 404);
    }

    return ApiResponse.sendSuccess(res, 'Video updated successfully!', updatedVideo);
  } catch (error) {
    next(error);
  }
};


export const deleteVideo = async (req, res, next) => {
  const { id } = req.params;

  try {
    const videoCount = await Video.countDocuments();
    if (videoCount <= 2) {
      return ApiResponse.sendError(res, "Minimum of 2 videos required. Cannot delete.", 400);
    }

    const deletedVideo = await Video.findByIdAndDelete(id);

    if (!deletedVideo) {
      return ApiResponse.sendError(res, `Video with id: ${id} not found`, 404);
    }

    return ApiResponse.sendSuccess(res, 'Video deleted successfully!', null);
  } catch (error) {
    next(error);
  }
};

export const searchVideos = async (req, res, next) => {
  const { title, description, category, createdBy } = req.query;

  try {
    const filters = {};

    if (title) filters.title = { $regex: title, $options: 'i' };
    if (description) filters.description = { $regex: description, $options: 'i' };
    if (category) filters.category = { $regex: category, $options: 'i' };
    if (createdBy) filters.createdBy = createdBy;

    const videos = await Video.find(filters).populate('createdBy', 'name email');
    return ApiResponse.sendSuccess(res, "Videos searched successfully", videos);
  } catch (error) {
    next(error);
  }
};

  