const mongoose = require('mongoose');

// Define the schema for IPO booking
const ipoBookingSchema = new mongoose.Schema({
    slots: {
        type: Number,
        required: true,
    },
    bidPrice: {
        type: Number,
        required: true,
    },
    userEmail: {
        type: String,
        required: true,
        match: /.+\@.+\..+/,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    ipoId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'IPO', // Assuming you have an IPO model
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    status:{
        type:String,
        default:"Pending"
    }
}, { timestamps: true }); // This will add createdAt and updatedAt fields

// Create a model from the schema
const IpoBooking = mongoose.model('IpoBooking', ipoBookingSchema);

module.exports = IpoBooking;
