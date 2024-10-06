const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    stockName: {
        type: String,
        required: true,
        trim: true
    },
    stockSymbol: {  // New field added for stock symbol
        type: String,
       required:true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

const userstock = mongoose.model('userstock', stockSchema);

module.exports = userstock;
