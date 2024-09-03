const mongoose = require('mongoose');

// Define the registration schema
const helpSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  query: {
    type: String,
    required: true,
  },
  query_resolved: {
    type: String,
    default: 'No',
  },
  resolved_message: {
    type: String,
    default: 'NA',
  }
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

// Create the model
const Help = mongoose.model('Help', helpSchema);

// Export the model
module.exports = Help;