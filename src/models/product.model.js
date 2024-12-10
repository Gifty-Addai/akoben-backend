import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['accessories','camping light','cookwear', 'others'],
    required: false,
    default:"accessories"
  },
  stock: {
    type: Number,
    required: false,
    min: 0,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
