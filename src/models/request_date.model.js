import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    tripId: {
      type: String, 
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
    },
    tripName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Request = mongoose.model("Request", RequestSchema);

export default Request;
