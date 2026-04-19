const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  division: {
    type: String,
    required: [true, 'Division is required'],
    enum: ['Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh']
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  thana: {
    type: String,
    required: [true, 'Thana/Upazilla is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Specific address is required'],
    trim: true
  },
  zipCode: {
    type: String,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
