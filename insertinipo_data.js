const mongoose = require('mongoose');
const Ipo = require('./models/Ipo'); // Assuming Ipo model is in 'models/Ipo.js'

// Connect to your MongoDB database
mongoose.connect('mongodb+srv://admin:hbGtVkPoT6gDR8lf@cluster0.gjyf8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB!");
}).catch((err) => {
  console.log("MongoDB connection error: ", err);
});

// Function to create sample IPO data
function createSampleIpoData() {
  return [
    {
      companyName: "Tech Innovations Ltd.",
      logoUrl: "https://via.placeholder.com/150",
      type: "Mainstream",
      closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Closing date 30 days from now
      minimumInvestment: "₹5,000",
      shares: 50000,
      day: 3,
      overallSubscription: 10.5,
      companyUrl: "https://www.techinnovations.com",
    },
    {
      companyName: "Green Energy Co.",
      logoUrl: "https://via.placeholder.com/150",
      type: "SME",
      closingDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // Closing date 25 days from now
      minimumInvestment: "₹2,000",
      shares: 20000,
      day: 5,
      overallSubscription: 8.2,
      companyUrl: "https://www.greenenergyco.com",
    },
    {
      companyName: "Foodies Delight Inc.",
      logoUrl: "https://via.placeholder.com/150",
      type: "Mainstream",
      closingDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // Closing date 20 days from now
      minimumInvestment: "₹3,000",
      shares: 30000,
      day: 4,
      overallSubscription: 12.3,
      companyUrl: "https://www.foodiesdelight.com",
    },
    {
      companyName: "HealthFirst Ltd.",
      logoUrl: "https://via.placeholder.com/150",
      type: "SME",
      closingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Closing date 15 days from now
      minimumInvestment: "₹1,500",
      shares: 15000,
      day: 2,
      overallSubscription: 15.0,
      companyUrl: "https://www.healthfirst.com",
    },
    {
      companyName: "FinTech Solutions",
      logoUrl: "https://via.placeholder.com/150",
      type: "Mainstream",
      closingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Closing date 10 days from now
      minimumInvestment: "₹4,000",
      shares: 60000,
      day: 1,
      overallSubscription: 18.0,
      companyUrl: "https://www.fintechsolutions.com",
    },
    {
      companyName: "AutoTech Inc.",
      logoUrl: "https://via.placeholder.com/150",
      type: "SME",
      closingDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // Closing date 12 days from now
      minimumInvestment: "₹2,500",
      shares: 25000,
      day: 3,
      overallSubscription: 5.5,
      companyUrl: "https://www.autotech.com",
    },
    {
      companyName: "EduTech Innovations",
      logoUrl: "https://via.placeholder.com/150",
      type: "Mainstream",
      closingDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // Closing date 8 days from now
      minimumInvestment: "₹1,000",
      shares: 40000,
      day: 4,
      overallSubscription: 9.8,
      companyUrl: "https://www.edutechinnovations.com",
    },
    {
      companyName: "Fashion Hub Ltd.",
      logoUrl: "https://via.placeholder.com/150",
      type: "SME",
      closingDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // Closing date 18 days from now
      minimumInvestment: "₹2,200",
      shares: 10000,
      day: 5,
      overallSubscription: 11.1,
      companyUrl: "https://www.fashionhub.com",
    },
    {
      companyName: "Real Estate Ventures",
      logoUrl: "https://via.placeholder.com/150",
      type: "Mainstream",
      closingDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // Closing date 28 days from now
      minimumInvestment: "₹7,000",
      shares: 80000,
      day: 2,
      overallSubscription: 16.0,
      companyUrl: "https://www.realestateventures.com",
    },
    {
      companyName: "Travel Joy Co.",
      logoUrl: "https://via.placeholder.com/150",
      type: "SME",
      closingDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), // Closing date 22 days from now
      minimumInvestment: "₹3,500",
      shares: 35000,
      day: 1,
      overallSubscription: 14.5,
      companyUrl: "https://www.traveljoy.com",
    },
  ];
}

// Function to populate the database with sample IPO data
async function populateIpoData() {
  const ipoDataArray = createSampleIpoData();

  try {
    // Insert multiple IPO data entries
    const result = await Ipo.insertMany(ipoDataArray);
    console.log(`${result.length} IPO entries successfully created!`);
  } catch (error) {
    console.error("Error inserting IPO data: ", error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
}

// Populate the database with sample data
populateIpoData();
