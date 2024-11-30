import mongoose from 'mongoose';

const testimonySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  message: {
    type: String,
    required: true,
    minlength: 10,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  location: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Testimony = mongoose.model('Testimony', testimonySchema);

export default Testimony;
