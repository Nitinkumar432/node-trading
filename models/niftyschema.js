const mongoose = require('mongoose');

// Schema for Sensex Companies
const NiftyCompanySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  openPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  highPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  lowPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  marketCap: {
    type: Number,
    required: true,
  },
  volume: {
    type: Number,
    required: true,
    min: 0,
  },
  sector: {
    type: String,
    required: true,
    enum: [
      'Finance',
      'Technology',
      'Healthcare',
      'Energy',
      'Consumer Goods',
      'Utilities',
      'Industrials',
      'Other',
      'Engineering',
      'Automobile',
      'Cement',
      'Pharmaceuticals',
      'Metals',
      'Ports',
    ],
  },
  priceChange: {
    type: Number,
    required: true,
  },
  percentageChange: {
    type: Number,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Adding a method to calculate price fluctuation
NiftyCompanySchema.methods.calculateFluctuation = function () {
  const randomPercentage = Math.random() * (2 - (-2)) + (-2); // Random fluctuation between -2% to +2%
  const fluctuation = (this.currentPrice * randomPercentage) / 100;
  this.currentPrice += fluctuation;
  this.priceChange = fluctuation;
  this.percentageChange = randomPercentage;
  this.lastUpdated = Date.now();
  return this.save();
};

module.exports = mongoose.model('NiftyCompany', NiftyCompanySchema);
