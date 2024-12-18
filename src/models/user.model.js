import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  phone: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  preferences: {
    type: Map,
    of: String,
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  }],
  address: {
    type: String,
    required: false,
  },
  isEmailConfirmed: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  dateJoined: {
    type: Date,
    default: Date.now,
  },
  age: {
    type: Number,
    required: false,
  },
  isMember: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    required: false,
  },
  recentTrip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
  },
  nextRenewalDate: {
    type: Date,
    required: false,
  },
  latestPaymentDate: {
    type: Date,
    required: false,
  },
  latestPaymentAmount: {
    type: Number,
    required: false,
  },
  nextTrip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
  },
  hasDiscount: {
    type: Boolean,
    default: false,
  },
  idCard: {
    type: String,
    required: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
