const mongoose = require('mongoose');

// Define the schema for Mutual Fund Scheme
const mutualFundSchema = new mongoose.Schema({
  fundName: {
    type: String,
    required: true,
  },
  fundType: {
    type: String,
    enum: ['Equity', 'Debt', 'Hybrid', 'Liquid'], // Different types of mutual funds
    required: true,
  },
  manager: {
    type: String,
    required: true,
  },
  minimumInvestment: {
    type: Number,
    required: true,
  },
  currentNAV: {
    type: Number,
    required: true, // Net Asset Value
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
mutualFundSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create the Mutual Fund model
const MutualFund = mongoose.model('MutualFund', mutualFundSchema);

module.exports = MutualFund;
