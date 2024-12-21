// models/UserInvestment.js
import mongoose from 'mongoose';

const userInvestmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goldType: { type: mongoose.Schema.Types.ObjectId, ref: 'GoldInvestment', required: true },
    unitsInvested: { type: Number, required: true },
    totalInvestment: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

const userinv  = mongoose.model('UserInvestment', userInvestmentSchema);
export default userinv;