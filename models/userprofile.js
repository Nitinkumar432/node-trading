import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
  // Demat Account Details
  dematAccountNumber: { type: String },
  dpId: { type: String },
  depositoryParticipant: { type: String },
  depository: { type: String },
  
  // Personal Details
  aadharNumber: {
    type: Number,
    required: true
  },
  pancard: {
    type: String,
    required: true
  },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  
  // Bank Account Details
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  branch: { type: String, required: true },

  // Nominee Details
  nominees: { type: String },
  isVerified: {
    type: String,
    default: 'false'
  },
  verifed_by:{
    type:String,
  },
  reason:{
    type:String,

  },



  // KYC Copy URL or File Reference
  kycCopyUrl: { type: String },

}, {
  timestamps: true, // Automatically adds createdAt and updatedAt timestamps
});

const UserProfile = mongoose.model('UserProfile', UserProfileSchema);

export default UserProfile;