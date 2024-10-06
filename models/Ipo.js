// models/Ipo.js
const mongoose = require('mongoose');

const ipoSchema = new mongoose.Schema({
  companyName: String,
  logoUrl: String,
  type: String, // SME or Mainstream
  closingDate: Date,
  minimumInvestment: String,
  shares: Number,
  day: Number,
  overallSubscription: Number,
  companyUrl: String,
});

const Ipo = mongoose.model('Ipo', ipoSchema);

module.exports = Ipo;
