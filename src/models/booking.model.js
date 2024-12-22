import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
  selectedDateId: {
    type: String,
    required: true,
  },
  participing: {
    type: Boolean,
    required: false,
    default: true
  },
  numberOfPeople: {
    type: Number,
    required: true,
    min: 1,
  },
  confirmed:{
    type : Boolean,
    required: false,
    default:false
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  payment: {
    type: Boolean,
    required: false,
    default: false
  },
  authorizationUrl: {
    type: String,
    required: false,
    default:""
  },
  reference: {
    type: String,
    required: false,
    default:""
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'reschedule'],
    default: 'pending',
  },
  rescheduleDate: {
    type: Date
  },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
