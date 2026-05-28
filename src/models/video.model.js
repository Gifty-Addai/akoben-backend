import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    default: 'Cooking Oils',
  },
  thumbnail: {
    type: String,
    required: true,
    default: '/thumbnails/cooking-1.jpg',
  },
  videoUrl: {
    type: String,
    required: false,
  },
  embedUrl: {
    type: String,
    required: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Video = mongoose.model('Video', videoSchema);

export default Video;
