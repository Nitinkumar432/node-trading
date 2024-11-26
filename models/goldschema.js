// models/GoldInvestment.js
const mongoose = require('mongoose');

const goldInvestmentSchema = new mongoose.Schema({
    type: { type: String, required: true },
    pricePerUnit: { type: Number, required: true },
    description: { type: String, required: true },
    availableUnits: { type: Number, default: 100 }, // Number of available units for this gold type
});

module.exports = mongoose.model('GoldInvestment', goldInvestmentSchema);
