const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: String,
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String
}, { timestamps: true });

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  condition: {
    type: String,
    enum: ['new', 'like new', 'good', 'fair', 'poor'],
    required: [true, 'Condition is required']
  },
  category: {
    type: [String],
    required: [true, 'At least one category is required']
  },

  images: [{ type: String }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  exchangeAvailable: {
    type: Boolean,
    default: false
  },
    location: {
    type: String,
    required: [true, 'Location is required']
  },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    default: 0
  },
  
  numReviews: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);