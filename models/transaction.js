const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    stockName: {
        type: String,
        required: true,
        trim: true
    },
    stock_mode:{
        type:String,
        required: true,
    },
    stockSymbol: {  
        type: String,
        required: true,
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

const transaction = mongoose.model('userstock', stockSchema);

module.exports = transaction;
