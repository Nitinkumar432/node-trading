// models/putcoupon.js
const mongoose = require('mongoose');

const putCouponSchema = new mongoose.Schema({
    discount: {
        type: String,
        required: true,
    },
    validTill: {
        type: Date,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true,
    },
    isscratched: {
        type: Boolean,
        default: false, // Use Boolean for true/false values
    }
}, {
    timestamps: true,
});

// Creating the Putoken model
const Putoken = mongoose.model('Putoken', putCouponSchema);

// Exporting the Putoken model
module.exports = Putoken;
