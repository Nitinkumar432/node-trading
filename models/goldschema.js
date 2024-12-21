// models/GoldInvestment.js
import mongoose from 'mongoose';

const goldInvestmentSchema = new mongoose.Schema({
    type: { type: String, required: true },
    pricePerUnit: { type: Number, required: true },
    description: { type: String, required: true },
    availableUnits: { type: Number, default: 100 }, // Number of available units for this gold type
});

const Gold  = mongoose.model('GoldInvestment', goldInvestmentSchema);
export default Gold;