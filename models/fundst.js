// models/Transaction.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // assuming you have a User model to link transactions with a user
        required: true
    },
    type: {
        type: String,
        enum: ['Deposit', 'Withdrawal'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        enum: ['credit-card', 'bank-transfer', 'digital-wallet'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});
const tt = mongoose.model('Transaction', transactionSchema);
export default tt;