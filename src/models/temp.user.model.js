import mongoose from 'mongoose';

const tempUserSchema = new mongoose.Schema({
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
  phone: {
    type: String,
    required: true,
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  }],
  streetAddress: {
    type: String,
    required: true,
  },
  address2: {
    type: String,
    required: false,
  },
  city:{
    type: String,
    required: true
  },
  dateJoined: {
    type: Date,
    default: Date.now,
  },
  age: {
    type: Number,
    required: false,
  },
  gender:{
    type:String,
    required: true,
  },
  isMember: {
    type: Boolean,
    default: false,
    required: false
  },
  idCard: {
    type: String,
    required: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  zipCode:{
    type: String,
    required : false
  }
}, { timestamps: true });

const TempUser = mongoose.model('TempUser', tempUserSchema);

export default TempUser;
