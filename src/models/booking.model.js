import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  tempUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TempUser',
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
  participing :{
    type : Boolean,
    required : false,
    default : true
  },
  numberOfPeople: {
    type: Number,
    required: true,
    min: 1,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  payment:{
    type : Boolean,
    required: false,
    default : false
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled','reschedule'],
    default: 'pending',
  },
  rescheduleDate:{
    type: Date
  },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
