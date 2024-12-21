import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
    stockName: {
        type: String,
        required: true,
        trim: true
    },
    stockSymbol: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    currentPrice: {
        type: Number,
        required: true
    },
    historicalPrices: [{
        date: {
            type: Date,
            required: true
        },
        open: {
            type: Number,
            required: true
        },
        high: {
            type: Number,
            required: true
        },
        low: {
            type: Number,
            required: true
        },
        close: {
            type: Number,
            required: true
        },
        volume: {
            type: Number,
            required: true
        }
    }],
    marketCap: {
        type: Number,
        required: false // Optional field for market capitalization
    },
    sector: {
        type: String,
        required: false // Optional field for sector classification
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Stock = mongoose.model('Stock', stockSchema);

export default  Stock;