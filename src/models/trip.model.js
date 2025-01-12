import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  mainLocation: {
    type: String,
    required: [true, 'Main location is required.']
  },
  pointsOfInterest: [{
    type: String,
    trim: true,
    maxlength: [100, 'Point of interest name cannot exceed 100 characters.']
  }]
});

const tripDateSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: [true, 'Start date is required.']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required.']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  slotsRemaining: {
    type: Number,
    required: [true, 'Slots remaining is required.'],
    min: [0, 'Slots remaining cannot be negative.']
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: [],
    unique:false
  }]
});

const tripSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Trip name is required.'],
    trim: true,
    maxlength: [100, 'Trip name cannot exceed 100 characters.']
  },
  description: {
    type: String,
    required: [true, 'Description is required.'],
    minlength: [20, 'Description should be at least 20 characters long.']
  },
  type: {
    type: String,
    enum: ['hiking', 'camping', 'mountaineering', 'camping & hiking', 'other'],
    required: [true, 'Trip type is required.']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'hard', 'expert'],
    required: [true, 'Difficulty level is required.']
  },
  activityLevel: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    default: 1,
    required: [true, 'Activity level is required.']
  },
  duration: {
    days: {
      type: Number,
      required: [true, 'Number of days is required.'],
      min: [1, 'The trip must be at least 1 day long.']
    },
    nights: {
      type: Number,
      required: [true, 'Number of nights is required.'],
      min: [0, 'Number of nights cannot be negative.']
    },
  },
  groupSize: {
    min: {
      type: Number,
      required: [true, 'Minimum group size is required.'],
      min: [1, 'Minimum group size must be at least 1.'],
      default: 4
    },
    max: {
      type: Number,
      required: [true, 'Maximum group size is required.'],
      min: [1, 'Maximum group size must be at least 1.'],
      default: 12
    },
  },
  location: {
    type: locationSchema,
    required: [true, 'Location details are required.']
  },
  cost: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required.'],
      min: [0, 'Base price cannot be negative.']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative.'],
      max: [100, 'Discount cannot exceed 100 percent.']
    },
  },
  schedule: {
    dates: [tripDateSchema],
    itinerary: [{
      day: {
        type: Number,
        required: [true, 'Day number is required.'],
        min: [1, 'Day number must be at least 1.']
      },
      activities: {
        type: String,
        required: [true, 'Activities for the day are required.'],
        maxlength: [500, 'Activities description cannot exceed 500 characters.']
      },
    }],
  },
  logistics: {
    transportation: {
      type: String,
      trim: true,
      maxlength: [100, 'Transportation description cannot exceed 100 characters.']
    },
    gearProvided: {
      type: Boolean,
      default: false
    },
    accommodation: {
      type: String,
      trim: true,
      maxlength: [100, 'Accommodation description cannot exceed 100 characters.']
    },
  },
  images: [{
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/.test(value);
      },
      message: props => `${props.value} is not a valid image URL.`
    }
  }],
  status: {
    type: String,
    enum: ['open', 'closed', 'completed', 'cancelled'],
    default: 'closed'
  },
}, { timestamps: true });

tripSchema.virtual('formattedImages').get(function () {
  return this.images.map(image => ({ url: image }));
});

const Location = mongoose.model('Location', locationSchema);
const TripDate = mongoose.model('TripDate', tripDateSchema);
const Trip = mongoose.model('Trip', tripSchema);

export { Trip, Location, TripDate };
