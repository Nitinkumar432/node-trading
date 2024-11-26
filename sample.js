const mongoose = require('mongoose');
const Stock = require('./models/stock'); // Adjust the path to your Stock model file

// MongoDB connection
mongoose.connect('mongodb+srv://admin:hbGtVkPoT6gDR8lf@cluster0.gjyf8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Generate sample data
const createSampleData = () => {
    const stocks = [
        {
            stockName: 'Tech Innovators',
            stockSymbol: 'TINV',
            companyName: 'Tech Innovators Inc.',
            currentPrice: 150.25,
            historicalPrices: [
                { date: new Date('2023-11-01'), open: 145, high: 155, low: 140, close: 150, volume: 5000 },
                { date: new Date('2023-10-01'), open: 140, high: 150, low: 135, close: 145, volume: 6000 },
                { date: new Date('2023-09-01'), open: 150, high: 160, low: 145, close: 155, volume: 5500 },
                { date: new Date('2023-08-01'), open: 155, high: 165, low: 150, close: 160, volume: 5200 },
                { date: new Date('2023-07-01'), open: 160, high: 170, low: 155, close: 165, volume: 5100 }
            ],
            marketCap: 500000000,
            sector: 'Technology'
        },
        {
            stockName: 'Green Energy Corp',
            stockSymbol: 'GEC',
            companyName: 'Green Energy Corporation',
            currentPrice: 75.50,
            historicalPrices: [
                { date: new Date('2023-11-01'), open: 70, high: 80, low: 65, close: 75, volume: 7000 },
                { date: new Date('2023-10-01'), open: 65, high: 75, low: 60, close: 70, volume: 8000 },
                { date: new Date('2023-09-01'), open: 75, high: 85, low: 70, close: 80, volume: 7500 },
                { date: new Date('2023-08-01'), open: 80, high: 90, low: 75, close: 85, volume: 7200 },
                { date: new Date('2023-07-01'), open: 85, high: 95, low: 80, close: 90, volume: 7100 }
            ],
            marketCap: 750000000,
            sector: 'Energy'
        },
        // Add 23 more stocks here following the same structure
    ];

    return stocks;
};

// Insert data into the database
const seedData = async () => {
    try {
        const sampleData = createSampleData();
        await Stock.insertMany(sampleData);
        console.log('Sample stock data entries inserted successfully');
    } catch (err) {
        console.error('Error inserting sample data:', err);
    } finally {
        mongoose.connection.close();
    }
};

seedData();
