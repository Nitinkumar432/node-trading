import mongoose from 'mongoose';

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
    currentPrice:{
        type:Number,
        default:0,
    },
    totalPrice: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

const userstock = mongoose.model('userstock', stockSchema);

export default userstock;
