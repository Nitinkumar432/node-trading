const mongoose = require('mongoose');
const Stock = require('./models/stock'); // Adjust the path to your Stock model

// Connect to MongoDB
mongoose.connect('mongodb+srv://admin:hbGtVkPoT6gDR8lf@cluster0.gjyf8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Function to generate random stock data
const generateRandomStocks = () => {
    const stocks = [];
    const companies = [
        "Apple Inc.", "Microsoft Corp.", "Amazon.com Inc.", "Alphabet Inc.", "Tesla Inc.",
        "Facebook Inc.", "Berkshire Hathaway", "Johnson & Johnson", "Visa Inc.", "Procter & Gamble",
        "NVIDIA Corp.", "JPMorgan Chase & Co.", "Walmart Inc.", "Mastercard Inc.", "Intel Corp.",
        "Coca-Cola Co.", "PepsiCo Inc.", "Exxon Mobil Corp.", "AbbVie Inc.", "Salesforce.com Inc."
    ];

    const usedSymbols = new Set(); // To track used stock symbols

    while (stocks.length < 20) {
        const randomIndex = Math.floor(Math.random() * companies.length);
        const stockName = companies[randomIndex];
        let stockSymbol;

        // Generate a unique stock symbol
        do {
            stockSymbol = stockName.split(' ').map(word => word[0]).join('').toUpperCase(); // Simple symbol generation
            // Ensure uniqueness by appending a number if necessary
            if (usedSymbols.has(stockSymbol)) {
                stockSymbol += Math.floor(Math.random() * 100); // Append a random number
            }
        } while (usedSymbols.has(stockSymbol));

        usedSymbols.add(stockSymbol); // Add to used symbols

        const currentPrice = (Math.random() * (500 - 50) + 50).toFixed(2); // Random price between $50 and $500
        const historicalPrices = [];

        for (let j = 0; j < 5; j++) { // Generate last 5 days of historical prices
            const date = new Date();
            date.setDate(date.getDate() - j);
            historicalPrices.push({
                date: date,
                open: (Math.random() * (500 - 50) + 50).toFixed(2),
                high: (Math.random() * (500 - 50) + 50).toFixed(2),
                low: (Math.random() * (500 - 50) + 50).toFixed(2),
                close: (Math.random() * (500 - 50) + 50).toFixed(2),
                volume: Math.floor(Math.random() * 1000000) + 1000 // Random volume between 1000 and 1,000,000
            });
        }

        stocks.push({
            stockName: stockName,
            stockSymbol: stockSymbol,
            companyName: stockName,
            currentPrice: parseFloat(currentPrice),
            historicalPrices: historicalPrices,
            marketCap: Math.floor(Math.random() * (2000000000 - 100000000) + 100000000), // Random market cap between $100M and $2B
            sector: 'Technology' // You can modify this as needed
        });
    }

    return stocks;
};

// Insert random stocks into the database
const insertRandomStocks = async () => {
    try {
        await Stock.deleteMany({}); // Optional: Clear existing stocks before inserting new ones
        const randomStocks = generateRandomStocks();
        await Stock.insertMany(randomStocks);
        console.log('Random stocks inserted successfully');
    } catch (error) {
        console.error('Error inserting stocks:', error);
    } finally {
        mongoose.connection.close();
    }
};

// Run the function
insertRandomStocks();