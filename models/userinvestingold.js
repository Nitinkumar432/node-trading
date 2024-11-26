// models/UserInvestment.js
const mongoose = require('mongoose');

const userInvestmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goldType: { type: mongoose.Schema.Types.ObjectId, ref: 'GoldInvestment', required: true },
    unitsInvested: { type: Number, required: true },
    totalInvestment: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserInvestment', userInvestmentSchema);
