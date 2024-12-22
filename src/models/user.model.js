import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  },
  password: {
    type: String,
    required: false,
    minlength: 6,
  },
  phone: {
    type: String,
    required: true,
  },
    bookings: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  streetAddress: {
    type: String,
    required: false,
  },
  address2: {
    type: String,
    required: false,
  },
  city:{
    type: String,
    required: false
  },
  isEmailConfirmed: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    required :false
  },
  dateJoined: {
    type: Date,
    default: Date.now,
  },
  gender:{
    type:String,
    required: false,
  },
  age: {
    type: Number,
    required: false,
  },
  isMember: {
    type: Boolean,
    required: false,
    default: false,
  },
  image: {
    type: String,
    required: false,
  },
  zipCode:{
    type: String,
    required : false
  },
  idCard: {
    type: String,
    required: false,
  },
  dob: {
    type: String,
    required: false,
  },
  // nextRenewalDate: {
  //   type: Date,
  //   required: false,
  // },
  // latestPaymentDate: {
  //   type: Date,
  //   required: false,
  // },
  // latestPaymentAmount: {
  //   type: Number,
  //   required: false,
  // },
  // nextTrip: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Trip',
  // },
  hasDiscount: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
