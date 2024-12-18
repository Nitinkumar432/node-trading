const request = require('request');

// Replace the "demo" API key with your own from https://www.alphavantage.co/support/#api-key
const url = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=VNCQ9ZTI0645DW7';

request.get({
    url: url,
    json: true,
    headers: { 'User-Agent': 'request' }
}, (err, res, data) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    if (res.statusCode !== 200) {
        console.error('Status Code:', res.statusCode);
        return;
    }

    // Parse and display stock data
    const timeSeries = data['Time Series (5min)'];

    if (!timeSeries) {
        console.error('Error: Time Series data not found in the response.');
        return;
    }

    console.log(`Stock Data for Symbol: ${data['Meta Data']['2. Symbol']}`);
    console.log('---------------------------------------------');

    // Loop through and print the stock data
    Object.keys(timeSeries).slice(0, 5).forEach((timestamp) => { // Limiting to the latest 5 entries
        const stockInfo = timeSeries[timestamp];
        console.log(`Timestamp: ${timestamp}`);
        console.log(`  Open: ${stockInfo['1. open']}`);
        console.log(`  High: ${stockInfo['2. high']}`);
        console.log(`  Low: ${stockInfo['3. low']}`);
        console.log(`  Close: ${stockInfo['4. close']}`);
        console.log(`  Volume: ${stockInfo['5. volume']}`);
        console.log('---------------------------------------------');
    });
});
