const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  
  // Seller Information (associates which books belong to which seller)
  sellers: [{
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sellerName: String,
    items: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    }],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'],
      default: 'pending'
    },
    statusHistory: [{
      status: String,
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: String
    }]
  }],
  
  // Address Information
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    division: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    thana: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    zipCode: {
      type: String
    }
  },

  // Price Details
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  coupon: {
    code: String,
    discountAmount: {
      type: Number,
      default: 0
    }
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },

  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery', 'card'],
    default: 'cash_on_delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },

  // Order Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Status History
  statusHistory: [{
    status: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String
  }],

  // Cancellation Details
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Delivery Information
  deliveredAt: Date,
  trackingNumber: String,

  // Additional Info
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Generate an order number when one wasn't set explicitly.
orderSchema.pre('save', async function() {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);
