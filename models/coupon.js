const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
    },
    discount: {
        type: String,
        required: true,
    },
    validTill: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
