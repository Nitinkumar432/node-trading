const mongoose = require('mongoose');

// Define the registration schema
const registrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure unique emails
    lowercase: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true, // Ensure unique phone numbers
    trim: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Add a minimum length requirement for the password
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userType:{
    type:String,
    default:"user",
  },
  funds:{
    type:Number,
    default:0
  },
  loginAttempts: {
    type: Number,
    default: 0, // Track failed login attempts
  },
  lockUntil: {
    type: Date, // Timestamp to indicate when login can be retried
  },
});

// Create the model
const Register = mongoose.model('Register', registrationSchema);

// Export the model
module.exports = Register;
